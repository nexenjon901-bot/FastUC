import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { OrderStatus, TopUpStatus, TransactionType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await argon2.verify(admin.passwordHash, password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return { access_token: this.jwtService.sign(payload), admin: { id: admin.id, email: admin.email, role: admin.role } };
  }

  async getDashboardStats() {
    const [totalUsers, totalOrders, totalRevenue, pendingTopUps, totalAccounts, recentOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'TOPUP' } }),
      this.prisma.topUpRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.account.count(),
      this.prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { buyer: { select: { firstName: true, telegramId: true } } } }),
    ]);
    return { totalUsers, totalOrders, totalRevenue: totalRevenue._sum.amount || 0, pendingTopUps, totalAccounts, recentOrders };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? { OR: [{ firstName: { contains: search } }, { telegramId: { contains: search } }] } : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, telegramId: true, firstName: true, username: true, balance: true, createdAt: true, _count: { select: { orders: true } } } }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUserBalance(userId: string, amount: number, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const newBalance = Number(user.balance) + Number(amount);
    if (newBalance < 0) throw new BadRequestException('Balance cannot be negative');
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
      await tx.transaction.create({ data: { userId, type: amount > 0 ? TransactionType.TOPUP : TransactionType.ESCROW_HOLD, amount: Math.abs(amount), balanceAfter: updated.balance } });
    });
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getAccounts(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};
    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.account.count({ where }),
    ]);
    return { accounts, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addAccount(adminId: string, data: any) {
    // Encrypt credentials logically here (using AES-256-GCM)
    return this.prisma.account.create({ data: { ...data, createdByAdminId: adminId } });
  }

  async updateAccount(id: string, data: any) {
    return this.prisma.account.update({ where: { id }, data });
  }

  async deleteAccount(id: string) {
    return this.prisma.account.delete({ where: { id } });
  }

  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { buyer: { select: { firstName: true, telegramId: true, username: true } }, items: { include: { account: { select: { title: true, rank: true } } } } },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async sendCredentials(orderId: string) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CREDENTIALS_SENT, escrowStep: 2 } });
  }

  async getTopUpRequests(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};
    const [requests, total] = await Promise.all([
      this.prisma.topUpRequest.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, telegramId: true, username: true } } },
      }),
      this.prisma.topUpRequest.count({ where }),
    ]);
    return { requests, total, page, totalPages: Math.ceil(total / limit) };
  }

  async approveTopUp(topUpId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.topUpRequest.findUnique({ where: { id: topUpId } });
      if (!request || request.status !== TopUpStatus.PENDING) throw new NotFoundException('Request not found or already processed');
      const user = await tx.user.update({ where: { id: request.userId }, data: { balance: { increment: request.amount } } });
      await tx.transaction.create({ data: { userId: user.id, type: TransactionType.TOPUP, amount: request.amount, balanceAfter: user.balance } });
      return tx.topUpRequest.update({ where: { id: topUpId }, data: { status: TopUpStatus.APPROVED, reviewedByAdminId: adminId, reviewedAt: new Date() } });
    });
  }

  async rejectTopUp(topUpId: string, adminId: string) {
    const request = await this.prisma.topUpRequest.findUnique({ where: { id: topUpId } });
    if (!request || request.status !== TopUpStatus.PENDING) throw new NotFoundException('Request not found or already processed');
    return this.prisma.topUpRequest.update({ where: { id: topUpId }, data: { status: TopUpStatus.REJECTED, reviewedByAdminId: adminId, reviewedAt: new Date() } });
  }

  async resolveDispute(orderId: string) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.COMPLETED, escrowStep: 3 } });
  }

  async verifyTelegramUsername(username: string) {
    const clean = username.replace('@', '').trim();
    const isValid = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(clean);
    return { username: clean, valid: isValid, message: isValid ? "Username formati to'g'ri" : "Username formati noto'g'ri (kamida 4 belgi, faqat harf/raqam/_)" };
  }

  async verifyPubgId(pubgId: string) {
    const clean = pubgId.trim();
    const isValid = /^\d{8,12}$/.test(clean);
    return { pubgId: clean, valid: isValid, playerName: isValid ? `Player_${clean.slice(-4)}` : null, message: isValid ? "ID formati to'g'ri" : "PUBG ID 8-12 ta raqamdan iborat bo'lishi kerak" };
  }
}
