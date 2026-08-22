import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, session, Keyboard, Context, SessionFlavor } from 'grammy';
import { conversations, createConversation, type ConversationFlavor, type Conversation } from '@grammyjs/conversations';
import { PrismaService } from '../prisma/prisma.service';

interface SessionData {
  editUserId?: string;
  broadcastMsgId?: number;
}

// Build context type in two steps to avoid circular reference
type MyBaseContext = Context & SessionFlavor<SessionData>;
type MyContext = MyBaseContext & ConversationFlavor<MyBaseContext>;
type MyConversation = Conversation<MyContext>;

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot<MyContext> | undefined;
  private readonly logger = new Logger(BotService.name);
  private adminId: number | undefined;
  private webAppUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    const adminIdStr = this.configService.get<string>('ADMIN_CHAT_ID');
    this.adminId = adminIdStr ? parseInt(adminIdStr, 10) : undefined;
    this.webAppUrl = this.configService.get<string>('WEB_APP_URL') || 'https://t.me/fastpay_tgbot';
    
    if (!token) {
      this.logger.warn('BOT_TOKEN is not defined in .env. Bot will not start.');
      return;
    }
    
    this.bot = new Bot<MyContext>(token);
  }

  onModuleInit() {
    if (!this.bot) return;

    this.bot.use(session({ initial: () => ({}) }));
    this.bot.use(conversations());

    // Register conversations
    this.bot.use(createConversation(this.searchUserConversation.bind(this), 'search_user'));
    this.bot.use(createConversation(this.broadcastConversation.bind(this), 'broadcast'));
    this.bot.use(createConversation(this.editBalanceConversation.bind(this), 'edit_balance'));

    this.setupMenus();
    this.setupHandlers();
    
    this.bot.start({
      onStart: (botInfo) => {
        this.logger.log(`Bot started as ${botInfo.username}`);
      }
    }).catch(err => this.logger.error('Failed to start bot', err));
  }

  // --- CONVERSATIONS ---
  
  private async searchUserConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Foydalanuvchi Telegram ID si yoki Username'ini (masalan, @nexenjon) yuboring:", {
      reply_markup: { remove_keyboard: true }
    });
    const { message } = await conversation.wait();
    const query = message?.text;
    
    if (!query) {
      await ctx.reply("Bekor qilindi.", { reply_markup: this.getMainMenu() });
      return;
    }

    let user;
    if (query.startsWith('@')) {
      user = await conversation.external(() => this.prisma.user.findFirst({ where: { username: query.replace('@', '') } }));
    } else if (!isNaN(Number(query))) {
      user = await conversation.external(() => this.prisma.user.findUnique({ where: { telegramId: BigInt(query) } }));
    }

    if (!user) {
      await ctx.reply("❌ Foydalanuvchi topilmadi.", { reply_markup: this.getMainMenu() });
      return;
    }

    const orderCount = await conversation.external(() => this.prisma.order.count({ where: { userId: user.id } }));
    
    const msg = `👤 FOYDALANUVCHI PROFILI\n🆔 ID: ${user.telegramId}\n👤 Username: ${user.username ? '@'+user.username : 'Yo\'q'}\n💰 Balans: ${user.balance} UZS\n🛒 Bajarilgan: ${orderCount} ta buyurtma`;
    const keyboard = new InlineKeyboard()
      .text('💰 Balansni o\'zgartirish', `edit_bal_${user.id}`);
      
    await ctx.reply(msg, { reply_markup: keyboard });
    await ctx.reply("Asosiy menyu", { reply_markup: this.getMainMenu() });
  }

  private async editBalanceConversation(conversation: MyConversation, ctx: MyContext) {
    const userId = ctx.session.editUserId;
    if (!userId) return;
    
    await ctx.reply("Qancha summa qo'shish yoki ayirish kerakligini yozing.\n(Masalan, qo'shish uchun: `50000`, ayirish uchun: `-10000`)");
    const { message } = await conversation.wait();
    const amount = parseInt(message?.text || '0', 10);
    
    if (isNaN(amount) || amount === 0) {
      await ctx.reply("❌ Xato miqdor kiritildi. Bekor qilindi.");
      return;
    }
    
    const user = await conversation.external(() => this.prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } }
    }));
    
    await ctx.reply(`✅ Balans o'zgartirildi! Yangi balans: ${user.balance} UZS`);
  }

  private async broadcastConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Barcha foydalanuvchilarga yubormoqchi bo'lgan xabaringizni yuboring (rasm, video yoki matn):", {
      reply_markup: { remove_keyboard: true }
    });
    
    const replyCtx = await conversation.wait();
    if (!replyCtx.message) return;
    
    await ctx.reply("Barchaga yuboramizmi?", {
      reply_markup: new InlineKeyboard().text('✅ Yuborish', 'confirm_broadcast').text('❌ Bekor qilish', 'cancel_broadcast')
    });
    
    // Store message id in session to forward it later
    ctx.session.broadcastMsgId = replyCtx.message.message_id;
  }

  // --- MENUS & HANDLERS ---

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
      // 1. Agar admin bo'lsa
      if (this.adminId && ctx.from?.id === this.adminId) {
        return await ctx.reply('FastUC Admin Paneliga xush kelibsiz!', {
          reply_markup: this.getMainMenu(),
        });
      }

      // 2. Oddiy foydalanuvchi
      const firstName = ctx.from?.first_name || 'Foydalanuvchi';
      
      const welcomeMsg = `👋 Xush kelibsiz, ${firstName}\n\n` +
        `Bu FastPAY — akkauntni ishonchli tarzda olishning eng tez yo'li.\n\n` +
        `⚡ Qulay interfeys\n` +
        `⚡ Qulay to'lov\n` +
        `⚡ Escrow himoyasi\n\n` +
        `🛍 Pastdagi tugmani bosing va hoziroq boshlang ⬇️`;

      const keyboard = new InlineKeyboard().webApp('Xarid qilish 🚀', this.webAppUrl);

      // Require path module at top, but we can just use simple relative path here
      const { InputFile } = require('grammy');
      const fs = require('fs');
      const path = require('path');
      const photoPath = path.join(process.cwd(), 'assets', 'welcome.jpg');
      
      if (fs.existsSync(photoPath)) {
        await ctx.replyWithPhoto(new InputFile(photoPath), { 
          caption: welcomeMsg, 
          reply_markup: keyboard 
        });
      } else {
        await ctx.reply(welcomeMsg, { reply_markup: keyboard });
      }
    });
  }

  private setupHandlers() {
    if (!this.bot) return;
    
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

    this.bot.hears('👥 Mijozlar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      await ctx.conversation.enter('search_user');
    });

    this.bot.hears('📢 Broadcast', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      await ctx.conversation.enter('broadcast');
    });

    this.bot.hears('⚙️ Sozlamalar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const msg = "⚙️ Tizim Sozlamalari\n\nHozirgi holat: 🟢 YONIQ\nTo'lov qabul: 🟢 YONIQ\nKarta: 8600 0000 0000 0000";
      const kb = new InlineKeyboard()
        .text('⏸ Botni to\'xtatish', 'toggle_maint')
        .row()
        .text('✏️ Karta raqamini o\'zgartirish', 'edit_card');
      await ctx.reply(msg, { reply_markup: kb });
    });
    
    // Callbacks
    this.bot.callbackQuery('confirm_broadcast', async (ctx) => {
      await ctx.editMessageText("Xabar tarqatilmoqda...");
      const msgId = ctx.session.broadcastMsgId;
      if (msgId && this.bot) {
        const users = await this.prisma.user.findMany({ select: { telegramId: true } });
        let success = 0;
        for (const user of users) {
          try {
            await this.bot.api.copyMessage(Number(user.telegramId), ctx.from.id, msgId);
            success++;
          } catch(e) {}
        }
        await ctx.reply(`✅ Xabar ${success} ta foydalanuvchiga yuborildi!`, { reply_markup: this.getMainMenu() });
      }
    });

    this.bot.callbackQuery('cancel_broadcast', async (ctx) => {
      await ctx.editMessageText("❌ Ommaviy xabar bekor qilindi.");
      await ctx.reply("Asosiy menyu", { reply_markup: this.getMainMenu() });
    });

    this.bot.callbackQuery(/^edit_bal_(.+)$/, async (ctx) => {
      ctx.session.editUserId = ctx.match[1];
      await ctx.conversation.enter('edit_balance');
    });

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
