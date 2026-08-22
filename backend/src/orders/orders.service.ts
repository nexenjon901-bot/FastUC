import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { BotService } from '../bot/bot.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private botService: BotService) {}

  async createOrder(userId: string, productId: string, targetId: string) {
    const order = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) {
        throw new NotFoundException('Mahsulot topilmadi yoki mavjud emas');
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

      if (user.balance < product.priceUzs) {
        throw new BadRequestException('Balans yetarli emas');
      }

      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: product.priceUzs } },
      });

      // Create order
      return tx.order.create({
        data: {
          userId,
          productId,
          targetId,
          priceUzs: product.priceUzs,
          status: 'PENDING',
        },
        include: { product: true },
      });
    });

    this.botService.notifyNewOrder(order.id);
    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
  }

  async getOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { product: true },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }
}
