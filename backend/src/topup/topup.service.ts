import { Injectable, BadRequestException, Optional, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '@prisma/client';
import { BotService } from '../bot/bot.service';

@Injectable()
export class TopupService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(forwardRef(() => BotService)) private bot?: BotService,
  ) {}

  async requestTopup(
    userId: string,
    amount: number,
    method: string,
    proofImageUrl?: string,
    userComment?: string,
  ) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (!Object.values(PaymentProvider).includes(method as any)) {
      throw new BadRequestException('Invalid payment method');
    }

    const request = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount,
        method: method as PaymentProvider,
        proofImageUrl: proofImageUrl || null,
        userComment,
      },
      include: { user: true },
    });

    void this.bot?.notifyUser(
      request.user.telegramId,
      `⏳ To'lov so'rovi qabul qilindi: ${Number(amount).toLocaleString()} UZS\nAdmin tasdiqlashini kuting.`,
    );

    const { user: _u, ...safe } = request as any;
    return safe;
  }

  async getMyRequests(userId: string) {
    return this.prisma.topUpRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
