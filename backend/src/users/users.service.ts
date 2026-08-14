import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertTelegramUser(telegramUser: any): Promise<User> {
    const telegramId = BigInt(telegramUser.id);
    const username = telegramUser.username || null;
    const firstName = telegramUser.first_name || null;
    const avatarUrl = telegramUser.photo_url || null;

    return this.prisma.user.upsert({
      where: { telegramId },
      update: {
        username,
        firstName,
        avatarUrl,
      },
      create: {
        telegramId,
        username,
        firstName,
        avatarUrl,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
