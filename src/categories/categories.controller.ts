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
import { Can } from '@nestjs/authorization';
import { CategoryPolicy } from './category.policy';

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
  @Can(CategoryPolicy, 'create')
  createCategory(@Body() bodyCategory: CreateCategoryDto) {
    return this.categoriesService.createCategory(bodyCategory);
  }

  @Patch(':id')
  @Can(CategoryPolicy, 'update')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() bodyCategory: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, bodyCategory);
  }

  @Delete(':id')
  @Can(CategoryPolicy, 'delete')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }
}
