import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from '../products/products.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private productService: ProductsService,
  ) {}

  private async getMyItem(cartId: number, userId: number) {
    const item = await this.cartRepository.findOneBy({ id: cartId, userId });
    if (!item) {
      throw new NotFoundException('Item này không tồn tại');
    }
    return item;
  }

  private assertEnoughStock(product: Product, quantity: number) {
    if (quantity > product.stock) {
      throw new BadRequestException(
        product.stock === 0
          ? `Sản phẩm "${product.name}" đã hết hàng`
          : `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
      );
    }
  }

  async getAllMyCarts(userId: number) {
    const carts = await this.cartRepository.find({
      where: { userId },
      relations: { product: true },
    });

    const totalAmount = carts.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);

    return {
      items: carts,
      totalAmount,
    };
  }

  async addToCart(userId: number, addToCartBody: AddToCartDto) {
    const product = await this.productService.getOneProduct(
      addToCartBody.productId,
    );

    const existCartItem = await this.cartRepository.findOne({
      where: { userId, productId: addToCartBody.productId },
    });
    const newQuantity = (existCartItem?.quantity ?? 0) + addToCartBody.quantity;

    if (newQuantity > 99) {
      throw new BadRequestException('Tổng số lượng mỗi sản phẩm tối đa là 99');
    }
    this.assertEnoughStock(product, newQuantity);

    if (existCartItem) {
      await this.cartRepository.update(existCartItem.id, {
        quantity: newQuantity,
      });
    } else {
      await this.cartRepository.save(
        this.cartRepository.create({
          userId,
          productId: addToCartBody.productId,
          quantity: newQuantity,
        }),
      );
    }

    return this.cartRepository.findOne({
      where: { userId, productId: addToCartBody.productId },
      relations: { product: true },
    });
  }

  async updateCart(
    cartId: number,
    userId: number,
    updateCartBody: UpdateCartItemDto,
  ) {
    await this.getMyItem(cartId, userId);

    // update quantity
    const newQuantity = updateCartBody.quantity;
    await this.cartRepository.update(cartId, {
      quantity: newQuantity,
    });
    return this.cartRepository.findOne({
      where: { id: cartId },
      relations: { product: true },
    });
  }

  async deleteCart(cartId: number, userId: number) {
    await this.getMyItem(cartId, userId);

    await this.cartRepository.delete(cartId);
    return this.getAllMyCarts(userId);
  }

  async clearCart(userId: number) {
    await this.cartRepository.delete({ userId });
    return { message: 'Đã xóa toàn bộ giỏ hàng' };
  }
}
