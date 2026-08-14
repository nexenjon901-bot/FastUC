import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
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

    // In a real app, generate a 2FA token here and wait for verify-2fa
    // For MVP, we will assume 2FA is verified or just issue token
    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async addAccount(adminId: string, data: any) {
    // Encrypt credentials logically here (using AES-256-GCM)
    return this.prisma.account.create({
      data: {
        ...data,
        createdByAdminId: adminId,
      }
    });
  }

  async sendCredentials(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CREDENTIALS_SENT, escrowStep: 2 },
    });
  }

  async resolveDispute(orderId: string) {
    // Implementation for resolving disputes
  }

  async approveTopUp(topUpId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.topUpRequest.findUnique({ where: { id: topUpId } });
      if (!request || request.status !== TopUpStatus.PENDING) throw new NotFoundException();

      const user = await tx.user.update({
        where: { id: request.userId },
        data: { balance: { increment: request.amount } },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.TOPUP,
          amount: request.amount,
          balanceAfter: user.balance,
        },
      });

      return tx.topUpRequest.update({
        where: { id: topUpId },
        data: { status: TopUpStatus.APPROVED, reviewedByAdminId: adminId, reviewedAt: new Date() },
      });
    });
  }
}
