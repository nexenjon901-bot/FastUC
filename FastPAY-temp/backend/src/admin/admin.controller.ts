import { Controller, Post, Body, Patch, Param, Request, Get, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Simple admin guard - checks if user has admin role in JWT
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();
    try {
      const token = auth.split(' ')[1];
      const payload = this.jwtService.verify(token, { secret: this.configService.get('JWT_SECRET') });
      if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') throw new UnauthorizedException();
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Auth
  @Post('auth/login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) throw new BadRequestException('Email va parol talab qilinadi');
    return this.adminService.login(email, password);
  }

  // Dashboard
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // Users
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, search);
  }

  @Patch('users/:id/balance')
  async updateUserBalance(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.adminService.updateUserBalance(id, amount, 'admin');
  }

  // Accounts
  @Get('accounts')
  async getAccounts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAccounts(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, status);
  }

  @Post('accounts')
  async addAccount(@Request() req, @Body() data: any) {
    return this.adminService.addAccount('admin', data);
  }

  @Patch('accounts/:id')
  async updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAccount(id, data);
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string) {
    return this.adminService.deleteAccount(id);
  }

  // Orders
  @Get('orders')
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOrders(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, status);
  }

  @Patch('orders/:id/send-credentials')
  async sendCredentials(@Param('id') id: string) {
    return this.adminService.sendCredentials(id);
  }

  @Patch('orders/:id/resolve')
  async resolveDispute(@Param('id') id: string) {
    return this.adminService.resolveDispute(id);
  }

  // Top-up requests
  @Get('topup-requests')
  async getTopUpRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getTopUpRequests(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, status);
  }

  @Patch('topup-requests/:id/approve')
  async approveTopup(@Param('id') id: string) {
    return this.adminService.approveTopUp(id, 'admin');
  }

  @Patch('topup-requests/:id/reject')
  async rejectTopup(@Param('id') id: string) {
    return this.adminService.rejectTopUp(id, 'admin');
  }

  // Verification
  @Get('verify/pubg/:id')
  async verifyPubgId(@Param('id') id: string) {
    return this.adminService.verifyPubgId(id);
  }

  @Get('verify/telegram/:username')
  async verifyTelegram(@Param('username') username: string) {
    return this.adminService.verifyTelegramUsername(username);
  }
}
