import { Controller, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req, @Body('accountId') accountId: string) {
    return this.ordersService.createOrder(req.user.id, accountId);
  }

  @Post(':id/confirm')
  async confirmOrder(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.confirmOrder(req.user.id, orderId);
  }
}
