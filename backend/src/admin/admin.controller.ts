import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.adminService.login(email, password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('orders')
  async listOrders(@Query('status') status?: string) {
    return this.adminService.listOrders(status);
  }

  @UseGuards(AdminAuthGuard)
  @Get('topup-requests')
  async listTopups(@Query('status') status?: string) {
    return this.adminService.listTopUpRequests(status);
  }

  @UseGuards(AdminAuthGuard)
  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(AdminAuthGuard)
  @Get('accounts')
  async listAccounts() {
    return this.adminService.listAccounts();
  }

  @UseGuards(AdminAuthGuard)
  @Post('accounts')
  async addAccount(@Request() req, @Body() data: any) {
    return this.adminService.addAccount(req.user.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('accounts/:id')
  async updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAccount(id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('accounts/:id/delete')
  async deleteAccount(@Param('id') id: string) {
    return this.adminService.deleteAccount(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('orders/:id/send-credentials')
  async sendCredentials(@Param('id') id: string) {
    return this.adminService.sendCredentials(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('orders/:id/mark-review')
  async markReview(@Param('id') id: string) {
    return this.adminService.markReview(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('topup-requests/:id/approve')
  async approveTopup(@Request() req, @Param('id') id: string) {
    return this.adminService.approveTopUp(id, req.user.id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('topup-requests/:id/reject')
  async rejectTopup(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectTopUp(id, req.user.id, reason);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('disputes/:id/resolve')
  async resolveDispute(
    @Request() req,
    @Param('id') id: string,
    @Body('resolutionNote') resolutionNote: string,
    @Body('refund') refund?: boolean,
  ) {
    return this.adminService.resolveDispute(id, req.user.id, resolutionNote, !!refund);
  }
}
