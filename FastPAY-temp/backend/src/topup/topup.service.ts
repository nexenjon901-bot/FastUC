import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '@prisma/client';
import { BotService } from '../bot/bot.service';

@Injectable()
export class TopupService {
  constructor(private prisma: PrismaService, private botService: BotService) {}

  async requestTopup(userId: string, amount: number, method: string, file: Express.Multer.File, userComment?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (amount < 5000) {
      throw new BadRequestException("Minimal to'lov miqdori 5,000 UZS bo'lishi kerak");
    }
    
    if (!Object.values(PaymentProvider).includes(method as any)) {
      throw new BadRequestException('Invalid payment method');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Foydalanuvchi topilmadi');
    }

    // 1. Create DB record first (so we have ID)
    const request = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount,
        method: method as PaymentProvider,
        userComment,
        status: 'PENDING',
      },
    });

    // 2. Send photo to admin chat
    const messageInfo = await this.botService.sendTopUpRequestToAdmin(request.id, user, amount, method, file.buffer);

    // 3. Update DB with message ID and file ID
    if (messageInfo) {
      await this.prisma.topUpRequest.update({
        where: { id: request.id },
        data: {
          adminMessageId: messageInfo.messageId,
          receiptFileId: messageInfo.fileId,
        },
      });
    }

    return request;
  }

  async getMyRequests(userId: string) {
    return this.prisma.topUpRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

