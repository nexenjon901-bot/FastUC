import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '@prisma/client';

@Injectable()
export class TopupService {
  constructor(private prisma: PrismaService) {}

  async requestTopup(userId: string, amount: number, method: string, proofImageUrl: string, userComment?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    
    // Check if the provider is valid
    if (!Object.values(PaymentProvider).includes(method as any)) {
      throw new BadRequestException('Invalid payment method');
    }

    return this.prisma.topUpRequest.create({
      data: {
        userId,
        amount,
        method: method as PaymentProvider,
        proofImageUrl,
        userComment,
      },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.topUpRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
