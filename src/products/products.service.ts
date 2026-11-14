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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  getProducts() {
    return this.productsRepository.find();
  }

  async getOneProduct(id: number) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Sản phẩm này không tồn tại');
    }
    return product;
  }

  createProduct(createProduct: CreateProductDto) {
    const product = this.productsRepository.create(createProduct);
    return this.productsRepository.save(product);
  }

  async updateProduct(id: number, updateProduct: UpdateProductDto) {
    if (Object.keys(updateProduct).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }
    await this.getOneProduct(id);
    await this.productsRepository.update(id, updateProduct);
    return this.productsRepository.findOneBy({ id });
  }

  async deleteProduct(id: number) {
    await this.getOneProduct(id);
    await this.productsRepository.delete(id);
    return this.getProducts();
  }
}
