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

    this.bot.on('callback_query', async (query) => {
      const data = query.data;
      const adminId = query.from.id.toString();
      const adminUsername = query.from.username || query.from.first_name;

      if (!data || (!data.startsWith('tu_app:') && !data.startsWith('tu_rej:'))) return;

      const adminIdsStr = this.configService.get<string>('ADMIN_IDS') || '';
      const allowedAdmins = adminIdsStr.split(',').map(id => id.trim());
      if (allowedAdmins.length > 0 && adminIdsStr !== '' && !allowedAdmins.includes(adminId)) {
        return this.bot.answerCallbackQuery(query.id, { text: "Sizda ruxsat yo'q!", show_alert: true });
      }

      const action = data.split(':')[0]; // tu_app or tu_rej
      const requestId = data.split(':')[1];
      
      try {
        const topUp = await this.prisma.topUpRequest.findUnique({
          where: { id: requestId },
          include: { user: true }
        });

        if (!topUp) {
          return this.bot.answerCallbackQuery(query.id, { text: "So'rov topilmadi!", show_alert: true });
        }

        if (topUp.status !== 'PENDING') {
          return this.bot.answerCallbackQuery(query.id, { text: "Bu so'rov allaqachon ko'rib chiqilgan!", show_alert: true });
        }

        if (action === 'tu_app') {

          // Approve logic: increment balance
          await this.prisma.$transaction(async (tx) => {
            await tx.topUpRequest.update({
              where: { id: requestId },
              data: {
                status: 'APPROVED',
                reviewedByAdminId: adminId,
                reviewedAt: new Date(),
              }
            });

            const newBalance = Number(topUp.user.balance) + Number(topUp.amount);

            await tx.user.update({
              where: { id: topUp.userId },
              data: { balance: newBalance }
            });

            await tx.transaction.create({
              data: {
                userId: topUp.userId,
                type: 'TOPUP',
                amount: topUp.amount,
                balanceAfter: newBalance,
                paymentProvider: topUp.method,
              }
            });
          });

          const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' });
          const newCaption = query.message.caption + `\n\n✅ Tasdiqlandi\n👤 Admin: @${adminUsername}\n🕐 ${time}`;
          
          await this.bot.editMessageCaption(newCaption, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          });
          
          this.bot.answerCallbackQuery(query.id, { text: "Tasdiqlandi ✅" });
        } else if (action === 'tu_rej') {
          // Reject logic
          await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: {
              status: 'REJECTED',
              reviewedByAdminId: adminId,
              reviewedAt: new Date(),
            }
          });

          const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' });
          const newCaption = query.message.caption + `\n\n❌ Rad etildi\n👤 Admin: @${adminUsername}\n🕐 ${time}`;
          
          await this.bot.editMessageCaption(newCaption, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          });
          
          this.bot.answerCallbackQuery(query.id, { text: "Rad etildi ❌" });
        }
      } catch (error) {
        this.logger.error('Error handling callback_query', error);
        this.bot.answerCallbackQuery(query.id, { text: "Xatolik yuz berdi" });
      }
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

    const caption = `🆕 Yangi hisob to'ldirish so'rovi\n` +
      `👤 Foydalanuvchi: ${user.username ? '@' + user.username : 'Noma\'lum'} (ID: ${user.telegramId})\n` +
      `💰 Summa: ${formattedAmount} UZS\n` +
      `💳 Usul: ${method}\n` +
      `🕐 Vaqt: ${time}`;

    const opts = {
      caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Tasdiqlash", callback_data: `tu_app:${requestId.slice(0, 36)}` },
            { text: "❌ Rad etish", callback_data: `tu_rej:${requestId.slice(0, 36)}` }
          ]
        ]
      }
    };

    try {
      const msg = await this.bot.sendPhoto(adminChatId, fileBuffer, opts, { filename: 'receipt.jpg', contentType: 'image/jpeg' });
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
