import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { TopupsService } from './topups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('topups')
export class TopupsController {
  constructor(private readonly topupsService: TopupsService) {}

  @Post()
  create(
    @Request() req,
    @Body('amountUzs') amountUzs: number,
    @Body('method') method: string,
  ) {
    return this.topupsService.createTopup(req.user.id, Number(amountUzs), method);
  }

  @Get('me')
  myTopups(@Request() req) {
    return this.topupsService.getMyTopups(req.user.id);
  }

  // Admin endpoints (basic, no separate guard for MVP)
  @Get('admin/all')
  getAll(@Query('status') status?: string) {
    return this.topupsService.getAllTopups(status);
  }

  @Patch('admin/:id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.topupsService.approveTopup(id, req.user.id);
  }

  @Patch('admin/:id/reject')
  reject(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.topupsService.rejectTopup(id, req.user.id, reason);
  }
}
