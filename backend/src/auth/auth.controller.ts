import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('telegram')
  async telegramAuth(@Body('initData') initData: string) {
    return this.authService.validateTelegramData(initData);
  }

  @Post('dev-login')
  async devLogin(
    @Body('telegramId') telegramId?: string,
    @Body('firstName') firstName?: string,
  ) {
    return this.authService.devLogin(telegramId, firstName);
  }
}
