import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Basic CRUD for seeding/admin (unprotected for MVP Phase 1 as per PDF)
  @Post()
  create(
    @Body('category') category: string,
    @Body('label') label: string,
    @Body('amount') amount: number,
    @Body('priceUzs') priceUzs: number,
    @Body('isFeatured') isFeatured?: boolean,
    @Body('sortOrder') sortOrder?: number,
  ) {
    return this.productsService.createProduct({ category, label, amount, priceUzs, isFeatured, sortOrder });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
