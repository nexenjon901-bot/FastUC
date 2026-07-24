import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Optional, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  OrderStatus,
  TopUpStatus,
  TransactionType,
  DisputeStatus,
  AccountStatus,
} from '@prisma/client';
import { encryptText } from '../common/crypto.util';
import { BotService } from '../bot/bot.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Optional() @Inject(forwardRef(() => BotService)) private bot?: BotService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await argon2.verify(admin.passwordHash, password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0 },
    });

    const payload = { sub: admin.id, email: admin.email, role: admin.role, typ: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  }

  async findAdminById(id: string) {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  async listOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { id: true, telegramId: true, username: true, firstName: true, balance: true },
        },
        account: {
          select: { id: true, sku: true, title: true, rank: true, price: true, status: true },
        },
        disputes: { where: { status: DisputeStatus.OPEN }, take: 1 },
      },
    });
  }

  async getDashboardStats() {
    const [totalUsers, totalOrders, totalSalesResult, activeAccounts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: OrderStatus.COMPLETED },
      }),
      this.prisma.account.count({ where: { status: AccountStatus.AVAILABLE } }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalSales: totalSalesResult._sum.amount || 0,
      activeAccounts,
    };
  }

  async listTopUpRequests(status?: string) {
    return this.prisma.topUpRequest.findMany({
      where: status ? { status: status as TopUpStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, telegramId: true, username: true, firstName: true, balance: true },
        },
      },
    });
  }

  async listAccounts() {
    return this.prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAccount(
    adminId: string,
    data: {
      sku: string;
      title: string;
      rank: string;
      level: number;
      skinsCount: number;
      ucBalance: number;
      price: number;
      description?: string;
      images?: string[];
      login: string;
      password: string;
    },
  ) {
    if (!data.login || !data.password) {
      throw new BadRequestException('login and password are required');
    }

    const encLogin = encryptText(data.login);
    const encPass = encryptText(data.password);

    const { login: _l, password: _p, ...accountFields } = data;

    return this.prisma.account.create({
      data: {
        sku: accountFields.sku,
        title: accountFields.title,
        rank: accountFields.rank,
        level: Number(accountFields.level),
        skinsCount: Number(accountFields.skinsCount),
        ucBalance: Number(accountFields.ucBalance),
        price: accountFields.price,
        description: accountFields.description,
        images: accountFields.images || [],
        status: AccountStatus.AVAILABLE,
        createdByAdminId: adminId,
        credential: {
          create: {
            encryptedLogin: encLogin.ciphertext,
            encryptedPassword: encPass.ciphertext,
            encryptionKeyVersion: encLogin.keyVersion,
          },
        },
      },
      include: { credential: false },
    });
  }

  async updateAccount(accountId: string, data: any) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.sku) updateData.sku = data.sku;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.rank) updateData.rank = data.rank;
    if (data.level !== undefined) updateData.level = Number(data.level);
    if (data.skinsCount !== undefined) updateData.skinsCount = Number(data.skinsCount);
    if (data.ucBalance !== undefined) updateData.ucBalance = Number(data.ucBalance);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.images) updateData.images = data.images;
    if (data.status) updateData.status = data.status;

    return this.prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });
  }

  async deleteAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    // First delete credential if exists
    await this.prisma.accountCredential.deleteMany({
      where: { accountId },
    });

    return this.prisma.account.delete({
      where: { id: accountId },
    });
  }

  async markReview(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.ESCROW_HELD && order.status !== OrderStatus.DISPUTED) {
      throw new BadRequestException('Order cannot enter review at this stage');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.ADMIN_REVIEW, escrowStep: 1 },
    });

    void this.bot?.notifyUser(
      order.buyer.telegramId,
      `🔎 Buyurtma tekshirilmoqda: ${order.orderNumber}`,
    );

    return updated;
  }

  async sendCredentials(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, account: { include: { credential: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.account.credential) {
      throw new BadRequestException('Account has no credentials');
    }

    const allowed: OrderStatus[] = [
      OrderStatus.ESCROW_HELD,
      OrderStatus.ADMIN_REVIEW,
      OrderStatus.DISPUTED,
    ];
    if (!allowed.includes(order.status)) {
      throw new BadRequestException('Credentials cannot be sent at this stage');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.accountCredential.update({
        where: { accountId: order.accountId },
        data: { revealedAt: new Date(), revealedToOrderId: orderId },
      });
      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CREDENTIALS_SENT, escrowStep: 2 },
      });
    });

    void this.bot?.notifyUser(
      order.buyer.telegramId,
      `🔐 Login/parol yuborildi: ${order.orderNumber}\nIlovani ochib ma'lumotlarni ko'ring va tasdiqlang.`,
    );

    return updated;
  }

  async approveTopUp(topUpId: string, adminId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const request = await tx.topUpRequest.findUnique({
        where: { id: topUpId },
        include: { user: true },
      });
      if (!request || request.status !== TopUpStatus.PENDING) {
        throw new NotFoundException('Top-up request not found');
      }

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
          paymentProvider: request.method,
        },
      });

      const updated = await tx.topUpRequest.update({
        where: { id: topUpId },
        data: {
          status: TopUpStatus.APPROVED,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
        },
      });

      return { updated, telegramId: request.user.telegramId, amount: request.amount, balance: user.balance };
    });

    void this.bot?.notifyUser(
      result.telegramId,
      `💰 Balans to'ldirildi: +${Number(result.amount).toLocaleString()} UZS\nYangi balans: ${Number(result.balance).toLocaleString()} UZS`,
    );

    return result.updated;
  }

  async rejectTopUp(topUpId: string, adminId: string, reason?: string) {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id: topUpId },
      include: { user: true },
    });
    if (!request || request.status !== TopUpStatus.PENDING) {
      throw new NotFoundException('Top-up request not found');
    }

    const updated = await this.prisma.topUpRequest.update({
      where: { id: topUpId },
      data: {
        status: TopUpStatus.REJECTED,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Rejected by admin',
      },
    });

    void this.bot?.notifyUser(
      request.user.telegramId,
      `❌ To'lov so'rovi rad etildi.\nSabab: ${updated.rejectionReason}`,
    );

    return updated;
  }

  async resolveDispute(disputeId: string, adminId: string, resolutionNote: string, refund = false) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: { include: { buyer: true } } },
    });
    if (!dispute || dispute.status !== DisputeStatus.OPEN) {
      throw new NotFoundException('Dispute not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolutionNote: resolutionNote || 'Resolved',
          resolvedByAdminId: adminId,
        },
      });

      if (refund) {
        const user = await tx.user.update({
          where: { id: dispute.order.buyerId },
          data: { balance: { increment: dispute.order.amount } },
        });
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.REFUND,
            amount: dispute.order.amount,
            balanceAfter: user.balance,
            orderId: dispute.orderId,
          },
        });
        await tx.account.update({
          where: { id: dispute.order.accountId },
          data: { status: AccountStatus.AVAILABLE },
        });
        return tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.REFUNDED },
        });
      }

      return tx.order.update({
        where: { id: dispute.orderId },
        data: { status: OrderStatus.ADMIN_REVIEW },
      });
    });
  }
}
