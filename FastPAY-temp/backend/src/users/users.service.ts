import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertTelegramUser(telegramUser: any): Promise<User> {
    const telegramId = telegramUser.id.toString();
    const username = telegramUser.username || null;
    const firstName = telegramUser.first_name || null;
    const languageCode = telegramUser.language_code || 'uz';

    return this.prisma.user.upsert({
      where: { telegramId },
      update: {
        username,
        firstName,
        lastLoginAt: new Date(),
        // Keep existing language if already set, or you could overwrite based on preference
      },
      create: {
        telegramId,
        username,
        firstName,
        languageCode,
        lastLoginAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
