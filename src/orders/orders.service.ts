import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationService } from '@nestjs/authorization';
import { OrderPolicy } from './order.policy';
import { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private authorizationService: AuthorizationService,
  ) {}

  async getAllOrders(user: User) {
    const userId = user.id;
    const canViewAll = await this.authorizationService.can(
      OrderPolicy,
      'viewAll',
      user,
    );
    if (canViewAll) {
      const allOrders = await this.orderRepository.find({
        relations: { items: true },
        order: { createdAt: 'DESC' },
      });
      return allOrders;
    }

    const orders = await this.orderRepository.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });

    return orders;
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
}
