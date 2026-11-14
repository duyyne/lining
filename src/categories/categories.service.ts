import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  private async checkParent(parentId?: number | null, selfId?: number) {
    if (parentId === null || parentId === undefined) {
      return;
    }
    if (parentId === selfId) {
      throw new BadRequestException('Danh mục cha không thể là chính nó');
    }
    const parent = await this.categoryRepository.findOneBy({ id: parentId });
    if (!parent) {
      throw new NotFoundException('Danh mục cha này không tồn tại');
    }
  }

  async getCategories() {
    return await this.categoryRepository.find();
  }

  async getOneCategory(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!category) {
      throw new NotFoundException('Danh mục này không tồn tại');
    }
    return category;
  }

  async createCategory(bodyCategory: CreateCategoryDto) {
    await this.checkParent(bodyCategory.parentId);
    const category = this.categoryRepository.create(bodyCategory);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, bodyCategory: UpdateCategoryDto) {
    if (Object.keys(bodyCategory).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }
    const category = await this.getOneCategory(id);
    await this.checkParent(bodyCategory.parentId, category.id);
    await this.categoryRepository.update(id, bodyCategory);
    return this.getOneCategory(id);
  }

  async deleteCategory(id: number) {
    await this.getOneCategory(id);
    const checkChild = await this.categoryRepository.findOneBy({
      parentId: id,
    });
    if (checkChild) {
      throw new ConflictException(
        'Danh mục này đang có các danh mục con. Không được xóa!',
      );
    }
    await this.categoryRepository.delete(id);
    return { message: 'Đã xóa danh mục' };
  }
}
