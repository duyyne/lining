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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '@nestjs/authentication';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Public()
  @Get(':id')
  getOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getOneCategory(id);
  }

  @Post()
  createCategory(@Body() bodyCategory: CreateCategoryDto) {
    return this.categoriesService.createCategory(bodyCategory);
  }

  @Patch(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() bodyCategory: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, bodyCategory);
  }

  @Delete(':id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }
}
