import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Can } from '@nestjs/authorization';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../users/user.entity';
import { UpdateOrderDto } from './dto/update-order.dto';

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

  @Patch(':id')
  @Can.Anyone()
  updateCart(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateOrderBody: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(user, orderId, updateOrderBody);
  }
}
