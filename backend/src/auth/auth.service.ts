import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateTelegramData(initData: string): Promise<any> {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    // 24 hours = 86400 seconds
    if (now - authDate > 86400) {
      throw new UnauthorizedException('Telegram auth_date is too old');
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
      throw new UnauthorizedException('User data missing in initData');
    }

    const telegramUser = JSON.parse(userStr);
    
    // Find or create user
    const user = await this.usersService.upsertTelegramUser(telegramUser);

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    const payload = { sub: user.id, telegramId: user.telegramId, role: 'USER' };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
