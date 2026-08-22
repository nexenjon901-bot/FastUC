import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, session, Keyboard, Context, SessionFlavor } from 'grammy';
import { conversations, createConversation, type ConversationFlavor, type Conversation } from '@grammyjs/conversations';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { InputFile } from 'grammy';
import * as fs from 'fs';
import * as path from 'path';

interface SessionData {
  editUserId?: string;
  broadcastMsgId?: number;
}

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
    private settingsService: SettingsService
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    const adminIdStr = this.configService.get<string>('ADMIN_CHAT_ID');
    this.adminId = adminIdStr ? parseInt(adminIdStr, 10) : undefined;
    this.webAppUrl = this.configService.get<string>('WEB_APP_URL') || 'https://t.me/fastpay_tgbot';
    
    if (token) this.bot = new Bot<MyContext>(token);
  }

  onModuleInit() {
    if (!this.bot) return;

    this.bot.use(session({ initial: () => ({}) }));
    this.bot.use(conversations());

    this.bot.use(createConversation(this.searchUserConversation.bind(this), 'search_user'));
    this.bot.use(createConversation(this.broadcastConversation.bind(this), 'broadcast'));
    this.bot.use(createConversation(this.editBalanceConversation.bind(this), 'edit_balance'));
    this.bot.use(createConversation(this.editCardNumberConversation.bind(this), 'edit_card_num'));
    this.bot.use(createConversation(this.editCardNameConversation.bind(this), 'edit_card_name'));

    this.setupMenus();
    this.setupHandlers();
    
    this.bot.start({ onStart: (b) => this.logger.log('Bot started: ' + b.username) })
      .catch(e => this.logger.error('Failed to start bot', e));
  }

  // --- CONVERSATIONS ---
  private async searchUserConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Mijoz ID si yoki Username'ini yuboring:", { reply_markup: { remove_keyboard: true } });
    const { message } = await conversation.wait();
    const query = message?.text;
    
    if (!query || query === '/cancel' || query === 'Bekor qilish') {
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
      await ctx.reply("❌ Topilmadi.", { reply_markup: this.getMainMenu() });
      return;
    }

    const orderCount = await conversation.external(() => this.prisma.order.count({ where: { userId: user.id } }));
    const msg = "👤 FOYDALANUVCHI\n\n🆔 ID: " + user.telegramId + "\n👤 User: @" + (user.username || 'yoq') + "\n💰 Balans: " + user.balance + " UZS\n🛒 Buyurtmalar: " + orderCount;
    const kb = new InlineKeyboard().text("💰 Balansni tahrirlash", "edit_bal_" + user.id);
      
    await ctx.reply(msg, { reply_markup: kb });
    await ctx.reply("Asosiy menyu", { reply_markup: this.getMainMenu() });
  }

  private async editBalanceConversation(conversation: MyConversation, ctx: MyContext) {
    const userId = ctx.session.editUserId;
    if (!userId) return;
    await ctx.reply("Summa kiriting (musbat qo'shadi, manfiy ayiradi):");
    const { message } = await conversation.wait();
    const amount = parseInt(message?.text || '0', 10);
    if (isNaN(amount) || amount === 0) {
      await ctx.reply("❌ Xato miqdor.");
      return;
    }
    const user = await conversation.external(() => this.prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } } }));
    await ctx.reply("✅ Yangi balans: " + user.balance + " UZS");
  }

  private async broadcastConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Xabarni yuboring:", { reply_markup: { remove_keyboard: true } });
    const replyCtx = await conversation.wait();
    if (!replyCtx.message) return;
    
    await ctx.reply("Barchaga tarqatamizmi?", {
      reply_markup: new InlineKeyboard().text('✅ Yuborish', 'confirm_broadcast').text('❌ Bekor qilish', 'cancel_broadcast')
    });
    ctx.session.broadcastMsgId = replyCtx.message.message_id;
  }

  private async editCardNumberConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Yangi karta raqamini yuboring (masalan: 8600 0000 0000 0000):", { reply_markup: { remove_keyboard: true } });
    const { message } = await conversation.wait();
    if (message?.text) {
      await conversation.external(() => this.settingsService.updateSettings({ cardNumber: message.text }));
      await ctx.reply("✅ Karta raqami saqlandi!", { reply_markup: this.getMainMenu() });
      await this.sendSettingsMenu(ctx);
    }
  }

  private async editCardNameConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Karta egasining ismini yuboring (masalan: Alisher T.):", { reply_markup: { remove_keyboard: true } });
    const { message } = await conversation.wait();
    if (message?.text) {
      await conversation.external(() => this.settingsService.updateSettings({ cardName: message.text }));
      await ctx.reply("✅ Karta nomi saqlandi!", { reply_markup: this.getMainMenu() });
      await this.sendSettingsMenu(ctx);
    }
  }

  // --- MENUS ---
  private getMainMenu() {
    return new Keyboard().text('📦 Buyurtmalar').text('💳 To\'lovlar').row().text('👥 Mijozlar').text('📊 Statistika').row().text('📢 Broadcast').text('⚙️ Sozlamalar').resized();
  }

  private setupMenus() {
    if (!this.bot) return;
    this.bot.command('start', async (ctx) => {
      const firstName = ctx.from?.first_name || 'Foydalanuvchi';
      const welcomeMsg = "👋 Xush kelibsiz, " + firstName + "\n\nBu FastPAY — ishonchli va tezkor xizmat.\n\n🛍 Pastdagi tugmani bosing va hoziroq boshlang ⬇️";
      
      const realWebAppUrl = this.webAppUrl.includes('t.me') ? 'https://fastuc.vercel.app' : this.webAppUrl;
      const keyboard = new InlineKeyboard().webApp('Xarid qilish 🚀', realWebAppUrl);
      const photoPath = path.join(process.cwd(), 'assets', 'welcome.jpg');
      
      try {
        if (fs.existsSync(photoPath)) {
          await ctx.replyWithPhoto(new InputFile(photoPath), { caption: welcomeMsg, reply_markup: keyboard });
        } else {
          await ctx.reply(welcomeMsg, { reply_markup: keyboard });
        }
      } catch (err) {
        this.logger.error('Failed to send welcome message', err);
        await ctx.reply(welcomeMsg, { reply_markup: keyboard });
      }

      if (this.adminId && ctx.from?.id === this.adminId) {
        await ctx.reply('Siz Adminsiz! Pastdagi menyudan boshqarishingiz mumkin 👇', { reply_markup: this.getMainMenu() });
      }
    });
  }

  private async sendSettingsMenu(ctx: MyContext) {
    const s = this.settingsService.getSettings();
    const msg = "⚙️ TIZIM SOZLAMALARI\n\n" +
      "🟢 Tizim holati: " + (s.isMaintenance ? "Tanaffusda (O'chirilgan)" : "Aktiv (Yoniq)") + "\n" +
      "💳 Karta: " + s.cardNumber + "\n" +
      "👤 Karta nomi: " + s.cardName;
      
    const kb = new InlineKeyboard()
      .text("💳 Karta raqamini o'zgartirish", 'menu_edit_card_num').row()
      .text("👤 Karta nomini o'zgartirish", 'menu_edit_card_name').row()
      .text(s.isMaintenance ? "🟢 Tizimni yoqish" : "🔴 Tizimni o'chirish", 'menu_toggle_maint');
      
    await ctx.reply(msg, { reply_markup: kb });
  }

  private setupHandlers() {
    if (!this.bot) return;
    
    // Commands
    this.bot.hears('📦 Buyurtmalar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const pending = await this.prisma.order.count({ where: { status: 'PENDING' } });
      const completed = await this.prisma.order.count({ where: { status: 'FULFILLED' } });
      const msg = "📦 BUYURTMALAR BO'LIMI\n\nKutilayotgan: " + pending + " ta\nBajarilgan: " + completed + " ta";
      const kb = new InlineKeyboard().text("👀 Kutilayotganlarni ko'rish", "view_orders_pending");
      await ctx.reply(msg, { reply_markup: kb });
    });

    this.bot.hears('💳 To\'lovlar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const pending = await this.prisma.topup.count({ where: { status: 'PENDING' } });
      const msg = "💳 TO'LOVLAR BO'LIMI\n\nTasdiqlanmagan: " + pending + " ta";
      const kb = new InlineKeyboard().text("👀 Kutilayotganlarni ko'rish", "view_topups_pending");
      await ctx.reply(msg, { reply_markup: kb });
    });

    this.bot.hears('📊 Statistika', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const usersCount = await this.prisma.user.count();
      const totalRevenue = await this.prisma.order.aggregate({ where: { status: 'FULFILLED' }, _sum: { priceUzs: true } });
      await ctx.reply("📊 STATISTIKA\n\n👥 Mijozlar: " + usersCount + "\n💰 Aylanma: " + (totalRevenue._sum.priceUzs || 0) + " UZS");
    });

    this.bot.hears('👥 Mijozlar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const msg = "👥 MIJOZLAR BO'LIMI";
      const kb = new InlineKeyboard().text("🔍 Qidirish (ID/User)", "search_customer");
      await ctx.reply(msg, { reply_markup: kb });
    });

    this.bot.hears('📢 Broadcast', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      await ctx.conversation.enter('broadcast');
    });

    this.bot.hears('⚙️ Sozlamalar', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      await this.sendSettingsMenu(ctx);
    });
    
    // Callbacks
    this.bot.callbackQuery('menu_edit_card_num', async (ctx) => { await ctx.conversation.enter('edit_card_num'); });
    this.bot.callbackQuery('menu_edit_card_name', async (ctx) => { await ctx.conversation.enter('edit_card_name'); });
    this.bot.callbackQuery('menu_toggle_maint', async (ctx) => {
      const current = this.settingsService.getSettings().isMaintenance;
      this.settingsService.updateSettings({ isMaintenance: !current });
      await ctx.editMessageText("Hozir holat o'zgardi!");
      await this.sendSettingsMenu(ctx as any);
    });

    this.bot.callbackQuery('search_customer', async (ctx) => { await ctx.conversation.enter('search_user'); });

    this.bot.callbackQuery('view_orders_pending', async (ctx) => {
      const orders = await this.prisma.order.findMany({ where: { status: 'PENDING' }, include: { user: true, product: true }, take: 10 });
      if (orders.length === 0) return ctx.editMessageText('Barchasi toza!');
      await ctx.deleteMessage();
      for (const order of orders) {
        const msg = "🛒 #" + order.id + "\n👤 @" + (order.user.username || order.user.telegramId) + "\n🎮 " + order.product.label + "\n🆔 " + order.targetId + "\n💰 " + order.priceUzs + " UZS";
        const kb = new InlineKeyboard().text('✅', "fulfill_order_" + order.id).text('❌', "cancel_order_" + order.id);
        await ctx.reply(msg, { reply_markup: kb });
      }
    });

    this.bot.callbackQuery('view_topups_pending', async (ctx) => {
      const topups = await this.prisma.topup.findMany({ where: { status: 'PENDING' }, include: { user: true }, take: 10 });
      if (topups.length === 0) return ctx.editMessageText('Barchasi toza!');
      await ctx.deleteMessage();
      for (const t of topups) {
        const msg = "💳 #" + t.id + "\n👤 @" + (t.user.username || t.user.telegramId) + "\n💵 " + t.amountUzs + " UZS\n💳 " + t.method;
        const kb = new InlineKeyboard().text('✅', "approve_topup_" + t.id).text('❌', "reject_topup_" + t.id);
        await ctx.reply(msg, { reply_markup: kb });
      }
    });

    this.bot.callbackQuery('confirm_broadcast', async (ctx) => {
      await ctx.editMessageText("Tarqatilmoqda...");
      const msgId = ctx.session.broadcastMsgId;
      if (msgId && this.bot) {
        const users = await this.prisma.user.findMany();
        for (const user of users) { try { await this.bot.api.copyMessage(Number(user.telegramId), ctx.from.id, msgId); } catch(e) {} }
        await ctx.reply("✅ Yuborildi!", { reply_markup: this.getMainMenu() });
      }
    });
    this.bot.callbackQuery('cancel_broadcast', async (ctx) => { await ctx.editMessageText("❌ Bekor qilindi"); });

    this.bot.callbackQuery(/^edit_bal_(.+)$/, async (ctx) => { ctx.session.editUserId = ctx.match[1]; await ctx.conversation.enter('edit_balance'); });

    this.bot.callbackQuery(/^fulfill_order_(.+)$/, async (ctx) => {
      await this.prisma.order.update({ where: { id: ctx.match[1] }, data: { status: 'FULFILLED', fulfilledAt: new Date(), fulfilledBy: ctx.from.id?.toString() }});
      await ctx.editMessageText("✅ Bajarildi");
    });
    this.bot.callbackQuery(/^cancel_order_(.+)$/, async (ctx) => {
      const order = await this.prisma.order.update({ where: { id: ctx.match[1] }, data: { status: 'CANCELLED', cancelReason: 'Admin bekor qildi' }});
      await this.prisma.user.update({ where: { id: order.userId }, data: { balance: { increment: order.priceUzs } }});
      await ctx.editMessageText("❌ Bekor qilindi");
    });
    
    this.bot.callbackQuery(/^approve_topup_(.+)$/, async (ctx) => {
      const t = await this.prisma.topup.update({ where: { id: ctx.match[1] }, data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.from.id?.toString() }});
      await this.prisma.user.update({ where: { id: t.userId }, data: { balance: { increment: t.amountUzs } }});
      await ctx.editMessageText("✅ Tasdiqlandi");
    });
    this.bot.callbackQuery(/^reject_topup_(.+)$/, async (ctx) => {
      await this.prisma.topup.update({ where: { id: ctx.match[1] }, data: { status: 'REJECTED', rejectReason: 'Admin rad etdi' }});
      await ctx.editMessageText("❌ Rad etildi");
    });
  }

  async notifyNewOrder(orderId: string) {
    if (!this.bot || !this.adminId) return;
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { user: true, product: true } });
    if (!order) return;
    const msg = "🔔 YANGI BUYURTMA\n👤 @" + (order.user.username || order.user.telegramId) + "\n🎮 " + order.product.label + "\n🆔 " + order.targetId + "\n💰 " + order.priceUzs + " UZS";
    const kb = new InlineKeyboard().text('✅ Bajarildi', "fulfill_order_" + order.id).text('❌ Bekor qilish', "cancel_order_" + order.id);
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: kb }).catch(e => this.logger.error(e));
  }

  async notifyNewTopup(topupId: string) {
    if (!this.bot || !this.adminId) return;
    const t = await this.prisma.topup.findUnique({ where: { id: topupId }, include: { user: true } });
    if (!t) return;
    const msg = "💳 YANGI TO'LOV SO'ROVI\n👤 @" + (t.user.username || t.user.telegramId) + "\n💵 " + t.amountUzs + " UZS\n💳 " + t.method;
    const kb = new InlineKeyboard().text('✅ Tasdiqlash', "approve_topup_" + t.id).text('❌ Rad etish', "reject_topup_" + t.id);
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: kb }).catch(e => this.logger.error(e));
  }
}