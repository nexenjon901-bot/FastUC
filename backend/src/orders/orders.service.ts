import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BotService } from '../bot/bot.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService, 
    private botService: BotService,
    private configService: ConfigService
  ) {}

  async createOrder(userId: string, productId: string, targetId: string) {
    let finalOrder;
    let coindropSuccess = false;
    let apiErrorMsg = '';

    await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) {
        throw new NotFoundException('Mahsulot topilmadi yoki mavjud emas');
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

      if (user.balance < product.priceUzs) {
        throw new BadRequestException('Balans yetarli emas');
      }

      // 1. Deduct balance first
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: product.priceUzs } },
      });

      // 2. Create order as PENDING
      finalOrder = await tx.order.create({
        data: {
          userId,
          productId,
          targetId,
          priceUzs: product.priceUzs,
          status: 'PENDING',
        },
        include: { product: true },
      });

      // 3. Try to call Coindrop API
      const apiKey = this.configService.get<string>('COINDROP_API_KEY');
      if (apiKey) {
        try {
          const payload: any = { player_id: targetId };
          if (product.category === 'UC') {
            payload.game_key = 'pubg-mobile-buykos';
            payload.product_id = product.amount + 'uc';
          } else if (product.category === 'STARS') {
            payload.game_key = 'telegram-stars';
            payload.amount = product.amount;
          }

          if (payload.game_key) {
            this.logger.log(`Sending API request to Coindrop: ${JSON.stringify(payload)}`);
            const res = await axios.post('https://coindrop.uz/api/v1/orders', payload, {
              headers: { 'X-API-Key': apiKey }
            });
            if (res.data && res.data.success) {
              coindropSuccess = true;
            }
          }
        } catch (error: any) {
          apiErrorMsg = error.response?.data?.detail || error.message;
          this.logger.error(`Coindrop API Error: ${apiErrorMsg}`);
        }
      }
    });

    // 4. If Coindrop was successful, mark FULFILLED
    if (coindropSuccess) {
      finalOrder = await this.prisma.order.update({
        where: { id: finalOrder.id },
        data: { status: 'FULFILLED', fulfilledAt: new Date(), fulfilledBy: 'API' },
        include: { product: true, user: true }
      });
      // Optionally notify admin that API handled it
      this.botService.notifyNewOrder(finalOrder.id);
    } else {
      // It remains PENDING, notify admin for manual fulfillment
      this.botService.notifyNewOrder(finalOrder.id);
    }

    return finalOrder;
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
