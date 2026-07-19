import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { TopupService } from './topup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments/topup-requests')
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  @Post()
  async requestTopup(
    @Request() req,
    @Body('amount') amount: number,
    @Body('method') method: string,
    @Body('proofImageUrl') proofImageUrl: string,
    @Body('userComment') userComment?: string,
  ) {
    return this.topupService.requestTopup(req.user.id, amount, method, proofImageUrl, userComment);
  }

  @Get('me')
  async getMyRequests(@Request() req) {
    return this.topupService.getMyRequests(req.user.id);
  }
}
