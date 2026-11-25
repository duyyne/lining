import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  FindOptionsWhere,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationService } from '@nestjs/authorization';
import { OrderPolicy } from './order.policy';
import { User } from '../users/user.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ALLOWED_TRANSITIONS, OrderStatus } from './order-status.enum';
import { Product } from '../products/product.entity';
import { OrderQueryDto } from './dto/order-query.dto';
import { paginatedResult } from '../common/paginated-result';
import { FakePaymentGateway } from './fake-payment.gateway';
import { PaymentDto } from './dto/payment.dto';
import { Payment } from './entity/payment.entity';
import { PaymentStatus } from './payment.enum';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private authorizationService: AuthorizationService,
    private paymentGateway: FakePaymentGateway,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async getAllOrders(query: OrderQueryDto, user: User) {
    const where: FindOptionsWhere<Order> = {};
    if (query.status) {
      where.status = query.status;
    }

    const canViewAll = await this.authorizationService.can(
      OrderPolicy,
      'viewAll',
      user,
    );

    // Admin thì view tất cả đơn
    if (!canViewAll) {
      where.userId = user.id;
    }

    // User thường thì view đơn của user
    const [items, total] = await this.orderRepository.findAndCount({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });

    return paginatedResult(items, total, query);
  }

  async getOrder(user: User, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Đơn hàng này không tồn tại');
    }

    const canView = await this.authorizationService.can(
      OrderPolicy,
      'view',
      user,
      order,
    );
    if (!canView) {
      throw new NotFoundException('Đơn hàng này không tồn tại');
    }

    return order;
  }

  async checkout(userId: number) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Check giỏ hàng có sản phẩm không
      const cart = await manager.find(CartItem, {
        where: { userId },
        relations: { product: true },
      });
      if (cart.length === 0) {
        throw new BadRequestException(
          'Bạn chưa có sản phẩm nào trong giỏ hàng',
        );
      }

      const sortedCart = [...cart].sort((a, b) => a.productId - b.productId);
      for (const item of sortedCart) {
        const result = await manager.decrement(
          Product,
          { id: item.productId, stock: MoreThanOrEqual(item.quantity) },
          'stock',
          item.quantity,
        );
        if (result.affected === 0) {
          throw new BadRequestException(
            `Sản phẩm "${item.product.name}" không đủ hàng`,
          );
        }
      }

      // 1.1. Tính total amount
      const totalAmount = cart.reduce((total, item) => {
        const price = item.product?.price || 0;
        return total + price * item.quantity;
      }, 0);

      // 2. Tạo order
      const orderBody = {
        userId,
        totalAmount,
      };
      const order = manager.create(Order, orderBody);
      const saveOrder = await manager.save(Order, order);
      const newOrderId = saveOrder.id;

      // 3. Tạo order items
      const orderItems = cart.map((cartItem) => {
        return manager.create(OrderItem, {
          orderId: newOrderId,
          productId: cartItem.productId,
          productName: cartItem.product.name,
          unitPrice: cartItem.product.price,
          quantity: cartItem.quantity,
        });
      });
      await manager.save(orderItems);

      // 4. Clear giỏ hàng
      await manager.delete(CartItem, { userId });

      // Testing hủy giao dịch
      // throw new Error('test hủy transaction');

      const newOrder = await manager.findOne(Order, {
        where: { id: newOrderId },
        relations: { items: true },
      });
      return newOrder;
    });
  }

  async updateOrder(user: User, orderId: number, { status }: UpdateOrderDto) {
    // Check chặn update status paid (chỉ cổng thanh toán mới được đổi)
    if (status === OrderStatus.Paid) {
      throw new BadRequestException(
        `Trạng thái ${status} chỉ có thể được cập nhật bởi cổng thanh toán`,
      );
    }

    // 404 nếu đơn không tồn tại hoặc không phải đơn của mình
    const order = await this.getOrder(user, orderId);

    // 1. Quyền
    const allowed =
      status === OrderStatus.Canceled
        ? await this.authorizationService.can(
            OrderPolicy,
            'cancel',
            user,
            order,
          )
        : await this.authorizationService.can(
            OrderPolicy,
            'updateStatus',
            user,
          );
    if (!allowed) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thay đổi này');
    }

    // 2. Chuyển trạng thái có hợp lệ không
    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw new BadRequestException(
        `Đơn đang ở "${order.status}", không thể chuyển sang "${status}"`,
      );
    }

    // 3. Đổi trạng thái (và trả kho nếu hủy) trong cùng một transaction
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        Order,
        { id: orderId, status: order.status },
        { status },
      );
      if (result.affected === 0) {
        throw new ConflictException(
          'Đơn vừa bị thay đổi, hãy tải lại và thử lại',
        );
      }

      if (status === OrderStatus.Canceled) {
        const items = [...order.items].sort(
          (a, b) => (a.productId ?? 0) - (b.productId ?? 0),
        );
        for (const item of items) {
          if (item.productId === null) continue;
          await manager.increment(
            Product,
            { id: item.productId },
            'stock',
            item.quantity,
          );
        }
      }
    });

    return this.getOrder(user, orderId);
  }

  async payOrder(user: User, orderId: number, paymentBody: PaymentDto) {
    const order = await this.getOrder(user, orderId);

    const canPay = await this.authorizationService.can(
      OrderPolicy,
      'pay',
      user,
      order,
    );
    if (!canPay) {
      throw new ForbiddenException('Đơn hàng không hợp lệ để thanh toán');
    }

    const paymentResult = await this.paymentGateway.charge(
      order.totalAmount,
      paymentBody.method,
      paymentBody.cardToken,
    );
    if (!paymentResult.success) {
      await this.paymentRepository.save(
        this.paymentRepository.create({
          orderId,
          amount: order.totalAmount,
          status: PaymentStatus.Failed,
          method: paymentBody.method,
        }),
      );
      throw new BadRequestException('Thanh toán thất bại');
    }

    await this.dataSource.transaction(async (manager) => {
      const update = await manager.update(
        Order,
        { id: orderId, status: OrderStatus.Pending },
        {
          status: OrderStatus.Paid,
        },
      );
      if (update.affected === 0) {
        throw new ConflictException(
          'Đơn vừa bị thay đổi trạng thái trong lúc thanh toán, hãy liên hệ hỗ trợ',
        );
      }

      await manager.save(
        manager.create(Payment, {
          orderId,
          amount: order.totalAmount,
          status: PaymentStatus.Succeeded,
          method: paymentBody.method,
          transactionRef: paymentResult.transactionRef,
        }),
      );
    });

    return this.getOrder(user, orderId);
  }
}
