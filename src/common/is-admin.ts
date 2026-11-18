import { User } from '../users/user.entity';
import { UserRole } from '../users/users-role.enum';

export const isAdmin = (user: User | null) => user?.role === UserRole.Admin;
