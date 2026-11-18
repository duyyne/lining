import { Policy } from '@nestjs/authorization';
import { User } from './user.entity';
import { isAdmin } from '../common/is-admin';

@Policy()
export class UserPolicy {
  getAll(user: User | null) {
    return isAdmin(user);
  }
  getOne(user: User | null) {
    return isAdmin(user);
  }
  update(user: User | null) {
    return isAdmin(user);
  }
  delete(user: User | null) {
    return isAdmin(user);
  }
}
