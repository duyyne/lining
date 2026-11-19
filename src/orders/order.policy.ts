import { Policy } from '@nestjs/authorization';
import { isAdmin } from '../common/is-admin';
import { User } from '../users/user.entity';
import { Order } from './order.entity';

@Policy()
export class OrderPolicy {
  viewAll(user: User) {
    return isAdmin(user);
  }

  view(user: User, order: Order) {
    return order.userId === user.id || isAdmin(user);
  }
}
