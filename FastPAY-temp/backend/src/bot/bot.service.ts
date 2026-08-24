import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class BotService implements OnModuleInit {
  private bot: any;
  private readonly logger = new Logger(BotService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

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
      
      const text = `<b>👋 Assalomu alaykum, ${name}!</b>\n\n` +
                   `<b>🎮 fastPAY</b> — <b>ishonchli va tezkor PUBG Mobile akkauntlar do'koniga xush kelibsiz.</b>\n\n` +
                   `<b>🔥 Bizda eng zo'r akkauntlar, mifik kolleksiyalar va arzon narxlar mavjud.</b>\n\n` +
                   `<b>👇 Ilovani ochish uchun quyidagi tugmani bosing!</b>`;
                   
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

  async sendTopUpRequestToAdmin(requestId: string, user: any, amount: number, method: string, fileBuffer: Buffer) {
    const adminChatId = this.configService.get<string>('ADMIN_CHAT_ID');
    if (!this.bot || !adminChatId) return null;

    const formattedAmount = Number(amount).toLocaleString('uz-UZ');
    const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

    const caption = `<b>🆕 Yangi hisob to'ldirish so'rovi</b>\n` +
      `<b>👤 Foydalanuvchi:</b> ${user.username ? '@' + user.username : 'Noma\'lum'} (ID: ${user.telegramId})\n` +
      `<b>💰 Summa:</b> ${formattedAmount} UZS\n` +
      `<b>💳 Usul:</b> ${method}\n` +
      `<b>🕐 Vaqt:</b> ${time}\n\n` +
      `<b>⚙️ Admin paneldan ko'rib chiqing:</b> /admin`;

    try {
      const msg = await this.bot.sendPhoto(adminChatId, fileBuffer, { caption, parse_mode: 'HTML' }, { filename: 'receipt.jpg', contentType: 'image/jpeg' });
      const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
      return { messageId: msg.message_id, fileId };
    } catch (error) {
      this.logger.error('Failed to send receipt to admin', error);
      return null;
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
