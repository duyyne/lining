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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { ProductPolicy } from './product.policy';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Public()
  @Get(':id')
  getOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneProduct(id);
  }

  @Post()
  @Can(ProductPolicy, 'create')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch(':id')
  @Can(ProductPolicy, 'update')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @Can(ProductPolicy, 'delete')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
