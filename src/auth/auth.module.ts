import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtAuth } from './jwt-auth.provider';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuth],
})
export class AuthModule {}
