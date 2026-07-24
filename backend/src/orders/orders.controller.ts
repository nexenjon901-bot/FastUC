import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getMyOrders(@Request() req) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get(':id')
  async getOrder(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(req.user.id, orderId);
  }

  @Post()
  async createOrder(@Request() req, @Body('accountId') accountId: string) {
    return this.ordersService.createOrder(req.user.id, accountId);
  }

  @Post(':id/confirm')
  async confirmOrder(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.confirmOrder(req.user.id, orderId);
  }

  @Post(':id/dispute')
  async openDispute(
    @Request() req,
    @Param('id') orderId: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.openDispute(req.user.id, orderId, reason);
  }
}
