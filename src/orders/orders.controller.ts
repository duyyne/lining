import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Can } from '@nestjs/authorization';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../users/user.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @Get()
  @Can.Anyone()
  getAllOrders(@Query() query: OrderQueryDto, @CurrentUser() user: User) {
    return this.orderService.getAllOrders(query, user);
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
