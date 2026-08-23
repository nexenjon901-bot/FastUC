import { Controller, Post, Get, UseGuards, Request, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TopupService } from './topup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments/topup-requests')
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  @Post()
  @UseInterceptors(FileInterceptor('receipt'))
  async requestTopup(
    @Request() req,
    @Body('amount') amount: string,
    @Body('method') method: string,
    @Body('userComment') userComment?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Chek rasmi yuklanmadi');
    }
    const amountNum = parseInt(amount, 10);
    return this.topupService.requestTopup(req.user.id, amountNum, method, file, userComment);
  }

  @Get('me')
  async getMyRequests(@Request() req) {
    return this.topupService.getMyRequests(req.user.id);
  }
}

