import { Controller, Post, Get, Patch, Param, UseGuards, Request, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.findOne(req.user.id, orderId);
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
  async disputeOrder(
    @Request() req,
    @Param('id') orderId: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.disputeOrder(req.user.id, orderId, reason);
  }
}
