import { Injectable, NotFoundException, BadRequestException, Optional, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCategory, ProductOrderStatus, TransactionType } from '@prisma/client';
import { BotService } from '../bot/bot.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(forwardRef(() => BotService)) private bot?: BotService,
  ) {}

  async findAll(category?: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as ProductCategory } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  async purchase(userId: string, productId: string, quantity: number, playerIdOrUsername?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) throw new NotFoundException('Mahsulot mavjud emas');

      const qty = Math.max(1, Math.floor(quantity || 1));
      const totalAmount = Number(product.price) * qty;

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

      if (Number(user.balance) < totalAmount) {
        throw new BadRequestException('Balans yetarli emas');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalAmount } },
      });

      const orderNumber = `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const productOrder = await tx.productOrder.create({
        data: {
          orderNumber,
          userId,
          productId,
          quantity: qty,
          amount: totalAmount,
          status: ProductOrderStatus.PENDING,
          playerIdOrUsername: playerIdOrUsername?.trim() || null,
        },
        include: { product: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.PRODUCT_PURCHASE,
          amount: totalAmount,
          balanceAfter: updatedUser.balance,
        },
      });

      return { productOrder, telegramId: user.telegramId };
    });

    void this.bot?.notifyUser(
      result.telegramId,
      `🛒 Buyurtma yaratildi: ${result.productOrder.orderNumber}\n` +
      `📦 Mahsulot: ${result.productOrder.product.name}\n` +
      `💰 Summa: ${Number(result.productOrder.amount).toLocaleString()} UZS\n` +
      `⏳ Holat: Kutilmoqda — admin tez orada yetkazib beradi.`,
    );

    return result.productOrder;
  }

  async getMyProductOrders(userId: string) {
    return this.prisma.productOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
  }

  // Admin: get all product orders
  async getAllProductOrders(status?: string) {
    return this.prisma.productOrder.findMany({
      where: status ? { status: status as ProductOrderStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { product: true, user: { select: { id: true, telegramId: true, firstName: true, username: true } } },
    });
  }

  // Admin: mark order as delivered
  async markDelivered(orderId: string) {
    const order = await this.prisma.productOrder.findUnique({
      where: { id: orderId },
      include: { user: true, product: true },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    const updated = await this.prisma.productOrder.update({
      where: { id: orderId },
      data: { status: ProductOrderStatus.COMPLETED, deliveredAt: new Date() },
      include: { product: true },
    });

    void this.bot?.notifyUser(
      order.user.telegramId,
      `✅ Buyurtma yetkazildi: ${order.orderNumber}\n📦 ${order.product.name}\n🎉 O'yiningizni zavqlanib o'ynang!`,
    );

    return updated;
  }

  // Admin: CRUD for Products
  async createProduct(data: {
    category: ProductCategory;
    name: string;
    amount: number;
    price: number;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    return this.prisma.product.create({ data: { ...data, price: data.price } });
  }

  async updateProduct(id: string, data: Partial<{
    name: string; amount: number; price: number; imageUrl: string; isActive: boolean; sortOrder: number;
  }>) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
