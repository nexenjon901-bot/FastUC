import { Controller, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.adminService.login(email, password);
  }

  // Normally we would protect the below with AdminAuthGuard
  @Post('accounts')
  async addAccount(@Request() req, @Body() data: any) {
    return this.adminService.addAccount(req.user?.id || 'admin', data);
  }

  @Patch('orders/:id/send-credentials')
  async sendCredentials(@Param('id') id: string) {
    return this.adminService.sendCredentials(id);
  }

  @Patch('topup-requests/:id/approve')
  async approveTopup(@Request() req, @Param('id') id: string) {
    return this.adminService.approveTopUp(id, req.user?.id || 'admin');
  }
}
