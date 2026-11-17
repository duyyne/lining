import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from '@nestjs/authentication';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async login(loginBody: LoginDto) {
    const email = loginBody.email.toLowerCase();
    const user = await this.usersService.findByEmailWithPassword(email);
    const isValid = user
      ? await bcrypt.compare(loginBody.password, user.password)
      : false;

    if (!user || !isValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

    return this.tokenService.issue(String(user.id), { method: 'password' });
  }
}
