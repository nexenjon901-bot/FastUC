import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, session, Keyboard } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot | undefined;
  private readonly logger = new Logger(BotService.name);
  private adminId: number | undefined;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    const adminIdStr = this.configService.get<string>('ADMIN_CHAT_ID');
    this.adminId = adminIdStr ? parseInt(adminIdStr, 10) : undefined;
    
    if (!token) {
      this.logger.warn('BOT_TOKEN is not defined in .env. Bot will not start.');
      return;
    }
    
    this.bot = new Bot(token);
  }

  onModuleInit() {
    if (!this.bot) return;

    this.bot.use(session({ initial: () => ({}) }));
    this.bot.use(conversations());

    this.setupMenus();
    this.setupHandlers();
    
    this.bot.start({
      onStart: (botInfo) => {
        this.logger.log(`Bot started as ${botInfo.username}`);
      }
    }).catch(err => this.logger.error('Failed to start bot', err));
  }

  private getMainMenu() {
    return new Keyboard()
      .text('📦 Buyurtmalar').text('💳 To\'lovlar').row()
      .text('👥 Mijozlar').text('📊 Statistika').row()
      .text('📢 Broadcast').text('⚙️ Sozlamalar')
      .resized();
  }

  private setupMenus() {
    if (!this.bot) return;
    this.bot.command('start', async (ctx) => {
      if (ctx.from?.id !== this.adminId && this.adminId !== undefined) {
        return ctx.reply('Siz admin emassiz.');
      }
      await ctx.reply('FastUC Admin Paneliga xush kelibsiz!', {
        reply_markup: this.getMainMenu(),
      });
    });
  }

  private setupHandlers() {
    if (!this.bot) return;
    // Actions for main menu
    this.bot.hears('📦 Buyurtmalar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const pendingOrders = await this.prisma.order.findMany({
        where: { status: 'PENDING' },
        include: { user: true, product: true },
        take: 5
      });
      
      if (pendingOrders.length === 0) {
        return ctx.reply('Kutilayotgan buyurtmalar yo\'q.');
      }
      
      for (const order of pendingOrders) {
        const msg = `🛒 BUYURTMA #${order.id}\n👤 Foydalanuvchi: ${order.user.username ? '@'+order.user.username : order.user.telegramId}\n🎮 Mahsulot: ${order.product.label}\n🆔 Target ID: ${order.targetId}\n💰 Narx: ${order.priceUzs} UZS\n📅 ${order.createdAt.toLocaleString('uz-UZ')}`;
        const keyboard = new InlineKeyboard()
          .text('✅ Bajarildi', `fulfill_order_${order.id}`)
          .text('❌ Bekor qilish', `cancel_order_${order.id}`);
        await ctx.reply(msg, { reply_markup: keyboard });
      }
    });

    this.bot.hears('💳 To\'lovlar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const pendingTopups = await this.prisma.topup.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        take: 5
      });
      
      if (pendingTopups.length === 0) {
        return ctx.reply('Kutilayotgan to\'lov so\'rovlari yo\'q.');
      }
      
      for (const topup of pendingTopups) {
        const msg = `💳 TO'LOV SO'ROVI #${topup.id}\n👤 Foydalanuvchi: ${topup.user.username ? '@'+topup.user.username : topup.user.telegramId}\n💵 Summa: ${topup.amountUzs} UZS\n💳 Usul: ${topup.method}\n📅 ${topup.createdAt.toLocaleString('uz-UZ')}`;
        const keyboard = new InlineKeyboard()
          .text('✅ Tasdiqlash', `approve_topup_${topup.id}`)
          .text('❌ Rad etish', `reject_topup_${topup.id}`);
        await ctx.reply(msg, { reply_markup: keyboard });
      }
    });

    this.bot.hears('📊 Statistika', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const usersCount = await this.prisma.user.count();
      const completedOrders = await this.prisma.order.count({ where: { status: 'FULFILLED' } });
      const totalRevenue = await this.prisma.order.aggregate({
        where: { status: 'FULFILLED' },
        _sum: { priceUzs: true }
      });
      
      const msg = `📊 FASTUC DASHBOARD\n\n👥 Jami foydalanuvchilar: ${usersCount}\n🛒 Bajarilgan buyurtmalar: ${completedOrders}\n💰 Jami aylanma: ${totalRevenue._sum.priceUzs || 0} UZS`;
      await ctx.reply(msg);
    });

    // Dummy answers for the rest
    this.bot.hears('👥 Mijozlar', ctx => ctx.reply('Mijozlarni qidirish (Tez kunda)'));
    this.bot.hears('📢 Broadcast', ctx => ctx.reply('Ommaviy xabar yuborish (Tez kunda)'));
    this.bot.hears('⚙️ Sozlamalar', ctx => ctx.reply('Sozlamalar paneli (Tez kunda)'));
    
    // Callbacks
    this.bot.callbackQuery(/^fulfill_order_(.+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'FULFILLED', fulfilledAt: new Date(), fulfilledBy: ctx.from.id?.toString() }
      });
      await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n✅ Bajarildi');
    });
    
    this.bot.callbackQuery(/^cancel_order_(.+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelReason: 'Admin bekor qildi' }
      });
      // Refund
      await this.prisma.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.priceUzs } }
      });
      await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n❌ Bekor qilindi (Pul qaytarildi)');
    });
    
    this.bot.callbackQuery(/^approve_topup_(.+)$/, async (ctx) => {
      const topupId = ctx.match[1];
      const topup = await this.prisma.topup.update({
        where: { id: topupId },
        data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.from.id?.toString() }
      });
      await this.prisma.user.update({
        where: { id: topup.userId },
        data: { balance: { increment: topup.amountUzs } }
      });
      await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n✅ Tasdiqlandi va balansga qo\'shildi');
    });
    
    this.bot.callbackQuery(/^reject_topup_(.+)$/, async (ctx) => {
      const topupId = ctx.match[1];
      await this.prisma.topup.update({
        where: { id: topupId },
        data: { status: 'REJECTED', rejectReason: 'Admin rad etdi' }
      });
      await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n❌ Rad etildi');
    });
  }

  // Exposed methods to trigger notifications from API
  async notifyNewOrder(orderId: string) {
    if (!this.bot || !this.adminId) return;
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, product: true }
    });
    if (!order) return;
    
    const msg = `🔔 YANGI BUYURTMA #${order.id}\n👤 Foydalanuvchi: ${order.user.username ? '@'+order.user.username : order.user.telegramId}\n🎮 Mahsulot: ${order.product.label}\n🆔 Target ID: ${order.targetId}\n💰 Narx: ${order.priceUzs} UZS\n📅 ${order.createdAt.toLocaleString('uz-UZ')}`;
    const keyboard = new InlineKeyboard()
      .text('✅ Bajarildi', `fulfill_order_${order.id}`)
      .text('❌ Bekor qilish', `cancel_order_${order.id}`);
      
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: keyboard }).catch(e => this.logger.error(e));
  }

  async notifyNewTopup(topupId: string) {
    if (!this.bot || !this.adminId) return;
    const topup = await this.prisma.topup.findUnique({
      where: { id: topupId },
      include: { user: true }
    });
    if (!topup) return;
    
    const msg = `💳 YANGI TO'LOV SO'ROVI #${topup.id}\n👤 Foydalanuvchi: ${topup.user.username ? '@'+topup.user.username : topup.user.telegramId}\n💵 Summa: ${topup.amountUzs} UZS\n💳 Usul: ${topup.method}\n📅 ${topup.createdAt.toLocaleString('uz-UZ')}`;
    const keyboard = new InlineKeyboard()
      .text('✅ Tasdiqlash', `approve_topup_${topup.id}`)
      .text('❌ Rad etish', `reject_topup_${topup.id}`);
      
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: keyboard }).catch(e => this.logger.error(e));
  }
}
