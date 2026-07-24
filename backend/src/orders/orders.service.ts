import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, AccountStatus, TransactionType, DisputeStatus } from '@prisma/client';
import { decryptText } from '../common/crypto.util';
import { BotService } from '../bot/bot.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(forwardRef(() => BotService)) private bot?: BotService,
  ) {}

  async createOrder(buyerId: string, accountId: string) {
    const order = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('Account not found');
      if (account.status !== AccountStatus.AVAILABLE) {
        throw new BadRequestException('Account is not available for purchase');
      }

      const user = await tx.user.findUnique({ where: { id: buyerId } });
      if (!user) throw new NotFoundException('User not found');

      if (Number(user.balance) < Number(account.price)) {
        throw new BadRequestException('Insufficient balance');
      }

      const updatedUser = await tx.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: account.price } },
      });

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const created = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          accountId,
          amount: account.price,
          status: OrderStatus.ESCROW_HELD,
          escrowStep: 1,
        },
        include: { account: true },
      });

      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: TransactionType.ESCROW_HOLD,
          amount: account.price,
          balanceAfter: updatedUser.balance,
          orderId: created.id,
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: { status: AccountStatus.RESERVED },
      });

      return { order: created, telegramId: user.telegramId };
    });

    void this.bot?.notifyUser(
      order.telegramId,
      `✅ Buyurtma yaratildi: ${order.order.orderNumber}\nHolat: Escrow — admin tekshiruvi kutilmoqda.`,
    );

    return order.order;
  }

  async getMyOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: {
            id: true,
            sku: true,
            title: true,
            rank: true,
            price: true,
            images: true,
            status: true,
          },
        },
      },
    });
  }

  async getOrderById(buyerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        account: {
          select: {
            id: true,
            sku: true,
            title: true,
            rank: true,
            level: true,
            skinsCount: true,
            ucBalance: true,
            price: true,
            images: true,
            status: true,
            credential: true,
          },
        },
        disputes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order || order.buyerId !== buyerId) {
      throw new NotFoundException('Order not found');
    }

    let credential: { login: string; password: string } | null = null;
    if (
      (order.status === OrderStatus.CREDENTIALS_SENT ||
        order.status === OrderStatus.COMPLETED ||
        order.status === OrderStatus.BUYER_CONFIRMED) &&
      order.account.credential
    ) {
      try {
        credential = {
          login: decryptText(order.account.credential.encryptedLogin),
          password: decryptText(order.account.credential.encryptedPassword),
        };
      } catch {
        credential = { login: '***', password: '***' };
      }
    }

    const { credential: _cred, ...accountSafe } = order.account as any;
    return {
      ...order,
      account: accountSafe,
      credential,
    };
  }

  async confirmOrder(buyerId: string, orderId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { buyer: true },
      });
      if (!order || order.buyerId !== buyerId) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.CREDENTIALS_SENT) {
        throw new BadRequestException('Order cannot be confirmed at this stage');
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          escrowStep: 3,
          confirmedAt: new Date(),
        },
        include: {
          account: {
            select: { id: true, sku: true, title: true, rank: true, price: true, images: true, status: true },
          },
        },
      });

      await tx.account.update({
        where: { id: order.accountId },
        data: { status: AccountStatus.SOLD },
      });

      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: TransactionType.ESCROW_RELEASE,
          amount: order.amount,
          balanceAfter: order.buyer.balance,
          orderId: order.id,
        },
      });

      return { order: updatedOrder, telegramId: order.buyer.telegramId };
    });

    void this.bot?.notifyUser(
      result.telegramId,
      `🎉 Buyurtma yakunlandi: ${result.order.orderNumber}\nXaridingiz uchun rahmat!`,
    );

    return result.order;
  }

  async openDispute(buyerId: string, orderId: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Reason is required');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });
    if (!order || order.buyerId !== buyerId) {
      throw new NotFoundException('Order not found');
    }

    const allowed: OrderStatus[] = [
      OrderStatus.CREDENTIALS_SENT,
      OrderStatus.ADMIN_REVIEW,
      OrderStatus.ESCROW_HELD,
    ];
    if (!allowed.includes(order.status)) {
      throw new BadRequestException('Dispute cannot be opened at this stage');
    }

    const dispute = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DISPUTED },
      });
      return tx.dispute.create({
        data: {
          orderId,
          openedBy: buyerId,
          reason: reason.trim(),
          status: DisputeStatus.OPEN,
        },
      });
    });

    void this.bot?.notifyUser(
      order.buyer.telegramId,
      `⚠️ Nizo ochildi: ${order.orderNumber}\nAdmin tez orada ko'rib chiqadi.`,
    );

    return dispute;
  }
}
