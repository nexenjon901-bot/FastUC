import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(BotService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not defined. Bot will not start.');
      return;
    }

    // Start bot with polling
    this.bot = new TelegramBot(token, { polling: true });
    
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const name = msg.from?.first_name || 'Foydalanuvchi';
      const webAppUrl = this.configService.get<string>('FRONTEND_URL') || 'https://fastpay-web.vercel.app';
      
      const text = `👋 Assalomu alaykum, <b>${name}</b>!\n\n` +
                   `🎮 <b>fastPAY</b> — ishonchli va tezkor PUBG Mobile akkauntlar do'koniga xush kelibsiz.\n\n` +
                   `🔥 Bizda eng zo'r akkauntlar, mifik kolleksiyalar va arzon narxlar mavjud.\n\n` +
                   `👇 Ilovani ochish uchun quyidagi tugmani bosing!`;
                   
      this.bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔥 Ilovani ochish",
                web_app: { url: webAppUrl }
              }
            ]
          ]
        }
      });
    });

    this.logger.log('Telegram bot started successfully (polling)');
  }

  async notifyAdmin(message: string) {
    const adminChatId = this.configService.get<string>('ADMIN_CHAT_ID');
    if (this.bot && adminChatId) {
      try {
        await this.bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        this.logger.error('Failed to notify admin', error);
      }
    }
  }

  async notifyUser(telegramId: string, message: string) {
    if (this.bot && telegramId) {
      try {
        await this.bot.sendMessage(telegramId, message, { parse_mode: 'HTML' });
      } catch (error) {
        this.logger.error(`Failed to notify user ${telegramId}`, error);
      }
    }
  }
}
