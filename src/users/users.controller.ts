import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { UserPolicy } from './user.policy';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('')
  @Can(UserPolicy, 'getAll')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @Can(UserPolicy, 'getOne')
  getOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getOneUser(id);
  }

  @Public()
  @Post('')
  createUser(@Body() createUser: CreateUserDto) {
    return this.userService.createUser(createUser);
  }

  @Patch(':id')
  @Can(UserPolicy, 'update')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUser: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUser);
  }

  @Delete(':id')
  @Can(UserPolicy, 'delete')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
