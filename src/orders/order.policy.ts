import { Policy } from '@nestjs/authorization';
import { isAdmin } from '../common/is-admin';
import { User } from '../users/user.entity';
import { Order } from './entity/order.entity';
import { OrderStatus } from './order-status.enum';

@Policy()
export class OrderPolicy {
  viewAll(user: User) {
    return isAdmin(user);
  }

  view(user: User, order: Order) {
    return order.userId === user.id || isAdmin(user);
  }

  updateStatus(user: User) {
    return isAdmin(user);
  }

  cancel(user: User, order: Order) {
    if (isAdmin(user)) return true;
    return order.userId === user.id && order.status === OrderStatus.Pending;
  }

  pay(user: User, order: Order) {
    return order.userId === user.id && order.status === OrderStatus.Pending;
  }
}
