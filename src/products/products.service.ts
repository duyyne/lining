import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  private SORT_MAP = {
    newest: { id: 'DESC' },
    price_asc: { price: 'ASC' },
    price_desc: { price: 'DESC' },
    name_asc: { name: 'ASC' },
    name_desc: { name: 'DESC' },
  } as const;

  async getProducts(query: ProductQueryDto) {
    const where: FindOptionsWhere<Product> = {};
    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [items, total] = await this.productsRepository.findAndCount({
      where,
      order: this.SORT_MAP[query.sort ?? 'newest'],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      relations: { category: true },
    });

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPage: Math.ceil(total / query.limit),
      },
    };
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
    return { message: 'Đã xóa sản phẩm' };
  }
}
