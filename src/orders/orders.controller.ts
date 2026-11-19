import { Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Can } from '@nestjs/authorization';
import { CurrentUser } from '@nestjs/authentication';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @Get()
  @Can.Anyone()
  getMyOrders(@CurrentUser('id') userId: number) {
    return this.orderService.getMyOrders(userId);
  }

  @Post()
  @Can.Anyone()
  checkout(@CurrentUser('id') userId: number) {
    return this.orderService.checkout(userId);
  }
}
