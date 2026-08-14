import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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

  private getBotToken(): string {
    const token =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      this.configService.get<string>('BOT_TOKEN');
    if (!token) throw new UnauthorizedException('TELEGRAM_BOT_TOKEN is not configured');
    return token;
  }

  async validateTelegramData(initData: string) {
    const botToken = this.getBotToken();

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      throw new UnauthorizedException('Telegram auth_date is too old');
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
      throw new UnauthorizedException('User data missing in initData');
    }

    const telegramUser = JSON.parse(userStr);
    const user = await this.usersService.upsertTelegramUser(telegramUser);

    const payload = { sub: user.id, telegramId: user.telegramId.toString(), role: 'USER', typ: 'user' };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  /** Local / browser testing without Telegram WebApp */
  async devLogin(telegramId = 'dev-user-1', firstName = 'Dev User') {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      throw new ForbiddenException('Dev login disabled in production');
    }

    const user = await this.usersService.upsertTelegramUser({
      id: telegramId,
      username: 'devuser',
      first_name: firstName,
      language_code: 'uz',
    });

    const payload = { sub: user.id, telegramId: user.telegramId.toString(), role: 'USER', typ: 'user' };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
