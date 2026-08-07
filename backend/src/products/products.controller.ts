import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminJwtGuard } from '../admin/admin-jwt.guard';
import { ProductCategory } from '@prisma/client';

// ── Public + User routes ──────────────────────────────────
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
}

// ── User order routes ─────────────────────────────────────
@UseGuards(JwtAuthGuard)
@Controller('product-orders')
export class ProductOrdersController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  purchase(
    @Request() req,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('playerIdOrUsername') playerIdOrUsername?: string,
  ) {
    return this.productsService.purchase(req.user.id, productId, quantity || 1, playerIdOrUsername);
  }

  @Get('me')
  myOrders(@Request() req) {
    return this.productsService.getMyProductOrders(req.user.id);
  }
}

// ── Admin routes ──────────────────────────────────────────
@UseGuards(AdminJwtGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Post()
  create(
    @Body('category') category: ProductCategory,
    @Body('name') name: string,
    @Body('amount') amount: number,
    @Body('price') price: number,
    @Body('imageUrl') imageUrl?: string,
    @Body('sortOrder') sortOrder?: number,
  ) {
    return this.productsService.createProduct({ category, name, amount, price, imageUrl, sortOrder });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Get('orders')
  getAllOrders(@Query('status') status?: string) {
    return this.productsService.getAllProductOrders(status);
  }

  @Patch('orders/:id/deliver')
  markDelivered(@Param('id') id: string) {
    return this.productsService.markDelivered(id);
  }
}
