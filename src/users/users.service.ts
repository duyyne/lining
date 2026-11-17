import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAllUsers() {
    return this.userRepository.find();
  }

  async getOneUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Người dùng này không tồn tại');
    }
    return user;
  }

  findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    });
  }

  async createUser(createUser: CreateUserDto) {
    const email = createUser.email.toLowerCase();
    if (
      await this.userRepository.existsBy({
        email,
      })
    ) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const hash = await bcrypt.hash(createUser.password, 10);
    const user = this.userRepository.create({
      ...createUser,
      password: hash,
      email,
    });
    const save = await this.userRepository.save(user);
    return this.getOneUser(save.id);
  }

  async updateUser(id: number, updateUser: UpdateUserDto) {
    if (Object.keys(updateUser).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    await this.getOneUser(id);

    if (updateUser.password !== undefined) {
      const hash = await bcrypt.hash(updateUser.password, 10);
      updateUser = { ...updateUser, password: hash };
    }

    if (updateUser.email !== undefined) {
      const email = updateUser.email.toLowerCase();
      const existing = await this.userRepository.findOneBy({ email });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email này đã được sử dụng');
      }
      updateUser = { ...updateUser, email };
    }

    await this.userRepository.update(id, updateUser);
    return this.getOneUser(id);
  }

  async deleteUser(id: number) {
    await this.getOneUser(id);
    await this.userRepository.delete(id);
    return { message: 'Đã xóa người dùng' };
  }
}
