import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot | null = null;
  private readonly logger = new Logger(BotService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const token =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      this.configService.get<string>('BOT_TOKEN');

    if (!token || token.includes('your_telegram')) {
      this.logger.warn('TELEGRAM_BOT_TOKEN / BOT_TOKEN not configured — bot disabled');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });

      this.bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || msg.chat.first_name || 'Hurmatli Mijoz';

        const welcomeMessage =
          `👋 Xush kelibsiz, ${firstName}\n\n` +
          `Bu FastPAY — akkauntni ishonchli tarzda olishning eng tez yo'li.\n\n` +
          `⚡️ Qulay interfeys\n⚡️ Qulay to'lov\n⚡️ Escrow himoyasi\n\n` +
          `🛍 Pastdagi tugmani bosing va hoziroq boshlang⬇️`;

        const webAppUrl =
          this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

        this.bot!.sendMessage(chatId, welcomeMessage, {
          reply_markup: {
            inline_keyboard: [[{ text: 'Xarid qilish 🚀', web_app: { url: webAppUrl } }]],
          },
        }).catch((err) => this.logger.error('sendMessage failed', err?.message));
      });

      this.bot.on('polling_error', (err) => {
        this.logger.warn(`Polling error: ${err?.message || err}`);
      });

      this.logger.log('Telegram bot started successfully');
    } catch (err: any) {
      this.logger.error(`Failed to start bot: ${err?.message || err}`);
      this.bot = null;
    }
  }

  async notifyUser(telegramId: string | null | undefined, text: string) {
    if (!this.bot || !telegramId) return;
    try {
      await this.bot.sendMessage(telegramId, text);
    } catch (err: any) {
      this.logger.warn(`notifyUser(${telegramId}) failed: ${err?.message || err}`);
    }
  }
}
