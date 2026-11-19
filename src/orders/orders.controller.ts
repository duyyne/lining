import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Can } from '@nestjs/authorization';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../users/user.entity';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @Get()
  @Can.Anyone()
  getAllOrders(@CurrentUser() user: User) {
    return this.orderService.getAllOrders(user);
  }

  @Get(':id')
  @Can.Anyone()
  getOrder(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.getOrder(user, orderId);
  }

  @Post()
  @Can.Anyone()
  checkout(@CurrentUser('id') userId: number) {
    return this.orderService.checkout(userId);
  }
}
