import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { OrderPolicy } from './order.policy';
import { Payment } from './entity/payment.entity';
import { FakePaymentGateway } from './fake-payment.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderPolicy, FakePaymentGateway],
})
export class OrdersModule {}
