import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  getProducts() {
    return this.productsRepository.find({ relations: { category: true } });
  }

  async getOneProduct(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm này không tồn tại');
    }
    return product;
  }

  async createProduct(createProduct: CreateProductDto) {
    await this.categoriesService.getOneCategory(createProduct.categoryId);
    const product = this.productsRepository.create(createProduct);
    const save = await this.productsRepository.save(product);
    return this.getOneProduct(save.id);
  }

  async updateProduct(id: number, updateProduct: UpdateProductDto) {
    // check xem có gửi object trống
    if (Object.keys(updateProduct).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    // check xem sản phẩm cần update có tồn tại
    await this.getOneProduct(id);

    // check xem danh mục có tồn tại
    if (updateProduct.categoryId !== undefined) {
      await this.categoriesService.getOneCategory(updateProduct.categoryId);
    }

    await this.productsRepository.update(id, updateProduct);
    return this.getOneProduct(id);
  }

  async deleteProduct(id: number) {
    await this.getOneProduct(id);
    await this.productsRepository.delete(id);
    return this.getProducts();
  }
}
