import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Request() req,
    @Body('productId') productId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.ordersService.createOrder(req.user.id, productId, targetId);
  }

  @Get('me')
  myOrders(@Request() req) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get(':id')
  getOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user.id);
  }
}
