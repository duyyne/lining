import { CurrentUser, Public } from '@nestjs/authentication';
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() loginBody: LoginDto) {
    return this.authService.login(loginBody);
  }

  @Get('me')
  getme(@CurrentUser() user: User) {
    return user;
  }
}
