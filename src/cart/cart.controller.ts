import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '@nestjs/authentication';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Can } from '@nestjs/authorization';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get('')
  @Can.Anyone()
  getAllMyCarts(@CurrentUser('id') userId: number) {
    return this.cartService.getAllMyCarts(userId);
  }

  @Post('')
  @Can.Anyone()
  addToCart(
    @CurrentUser('id') userId: number,
    @Body() addToCartBody: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartBody);
  }

  @Patch(':id')
  @Can.Anyone()
  updateCart(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateCartBody: UpdateCartItemDto,
  ) {
    return this.cartService.updateCart(id, userId, updateCartBody);
  }

  @Delete(':id')
  @Can.Anyone()
  deleteCart(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.cartService.deleteCart(id, userId);
  }

  @Delete('')
  @Can.Anyone()
  clearCart(@CurrentUser('id') userId: number) {
    return this.cartService.clearCart(userId);
  }
}
