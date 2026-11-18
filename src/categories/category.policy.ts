import { Policy } from '@nestjs/authorization';
import { User } from '../users/user.entity';
import { isAdmin } from '../common/is-admin';

@Policy()
export class CategoryPolicy {
  create(user: User | null) {
    return isAdmin(user);
  }
  update(user: User | null) {
    return isAdmin(user);
  }
  delete(user: User | null) {
    return isAdmin(user);
  }
}
