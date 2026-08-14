import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status: status as any } : { status: 'AVAILABLE' };
    return this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sku: true,
        title: true,
        rank: true,
        level: true,
        skinsCount: true,
        ucBalance: true,
        price: true,
        status: true,
        images: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        title: true,
        rank: true,
        level: true,
        skinsCount: true,
        ucBalance: true,
        price: true,
        status: true,
        description: true,
        images: true,
        createdAt: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }
}
