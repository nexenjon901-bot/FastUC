import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopupStatus } from '@prisma/client';

@Injectable()
export class TopupsService {
  constructor(private prisma: PrismaService) {}

  async createTopup(userId: string, amountUzs: number, method: string) {
    const MIN = 5000;
    if (!amountUzs || amountUzs < MIN) {
      throw new BadRequestException(`Minimal to'lov summasi — ${MIN} UZS`);
    }

    return this.prisma.topup.create({
      data: {
        userId,
        amountUzs,
        method,
        status: 'PENDING',
      },
    });
  }

  async getMyTopups(userId: string) {
    return this.prisma.topup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: approve topup
  async approveTopup(id: string, adminId: string) {
    const topup = await this.prisma.topup.findUnique({ where: { id } });
    if (!topup) throw new NotFoundException('Topup topilmadi');
    if (topup.status !== 'PENDING') throw new BadRequestException('Bu topup allaqachon ko\'rib chiqilgan');

    const [updatedTopup] = await this.prisma.$transaction([
      this.prisma.topup.update({
        where: { id },
        data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: adminId },
      }),
      this.prisma.user.update({
        where: { id: topup.userId },
        data: { balance: { increment: topup.amountUzs } },
      }),
    ]);

    return updatedTopup;
  }

  // Admin: reject topup
  async rejectTopup(id: string, adminId: string, reason?: string) {
    const topup = await this.prisma.topup.findUnique({ where: { id } });
    if (!topup) throw new NotFoundException('Topup topilmadi');
    if (topup.status !== 'PENDING') throw new BadRequestException('Bu topup allaqachon ko\'rib chiqilgan');

    return this.prisma.topup.update({
      where: { id },
      data: { status: 'REJECTED', approvedBy: adminId, rejectReason: reason },
    });
  }

  async getAllTopups(status?: string) {
    return this.prisma.topup.findMany({
      where: status ? { status: status as TopupStatus } : {},
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, telegramId: true, firstName: true, username: true } } },
    });
  }
}
