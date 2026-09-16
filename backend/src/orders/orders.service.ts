import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, AccountStatus, TransactionType, ProductType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(buyerId: string, accountId: string) {
    return this.prisma.$transaction(async (tx) => {
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

      // 1. Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: account.price } },
      });

      // 2. Create Order
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          totalAmount: account.price,
          status: OrderStatus.ESCROW_HELD,
          escrowStep: 1,
          items: {
            create: {
              productType: ProductType.ACCOUNT,
              productId: account.id,
              accountId: account.id,
              price: account.price,
              quantity: 1
            }
          }
        },
      });

      // 3. Create Transaction
      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: TransactionType.ESCROW_HOLD,
          amount: account.price,
          balanceAfter: updatedUser.balance,
          orderId: order.id,
        },
      });

      // 4. Update Account Status
      await tx.account.update({
        where: { id: accountId },
        data: { status: AccountStatus.RESERVED },
      });

      return order;
    });
  }

  async confirmOrder(buyerId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ 
        where: { id: orderId },
        include: { items: true }
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
      });

      const accountItem = order.items.find(i => i.productType === 'ACCOUNT');
      if (accountItem && accountItem.accountId) {
        await tx.account.update({
          where: { id: accountItem.accountId },
          data: { status: AccountStatus.SOLD },
        });
      }

      return updatedOrder;
    });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            account: {
              select: { title: true, rank: true, images: true }
            }
          }
        }
      },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            account: {
              select: { title: true, rank: true, images: true }
            }
          }
        }
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async disputeOrder(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== userId) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot dispute this order');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DISPUTED } as any,
    });
  }
}

