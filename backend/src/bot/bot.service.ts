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
  msgTargetId?: string;
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
    this.bot.use(createConversation(this.sendMessageConversation.bind(this), 'send_msg'));

    this.setupMenus();
    this.setupHandlers();
    
    this.bot.start({ onStart: (b) => this.logger.log('Bot started: ' + b.username) })
      .catch(e => this.logger.error('Failed to start bot', e));
  }

  // --- CONVERSATIONS ---
  private async searchUserConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("🔍 ID yoki Username yuboring (Masalan: @nexenjon):", { reply_markup: { remove_keyboard: true } });
    const { message } = await conversation.wait();
    const query = message?.text;
    if (!query || query === '/cancel') return ctx.reply("Bekor qilindi.", { reply_markup: this.getMainMenu() });

    let user: any = null;
    if (query.startsWith('@')) {
      user = await conversation.external(() => this.prisma.user.findFirst({ where: { username: query.replace('@', '') } }));
    } else if (!isNaN(Number(query))) {
      user = await conversation.external(() => this.prisma.user.findUnique({ where: { telegramId: BigInt(query) } }));
    }

    if (!user) return ctx.reply("❌ Topilmadi.", { reply_markup: this.getMainMenu() });

    const orderCount = await conversation.external(() => this.prisma.order.count({ where: { userId: user.id } }));
    const msg = "👤 **Mijoz Profili**\n\n🆔 " + user.telegramId + "\n💬 @" + (user.username || 'yoq') + "\n💰 " + user.balance.toLocaleString() + " UZS\n🛒 Xaridlar: " + orderCount;
    
    const kb = new InlineKeyboard()
      .text("💰 Balans (+/-)", "edit_bal_" + user.id).text("✉️ Xabar yozish", "send_msg_" + user.telegramId).row()
      .text("🚫 Ban/Unban (Tez kunda)", "noop");
      
    await ctx.reply(msg, { reply_markup: kb, parse_mode: 'Markdown' });
    await ctx.reply("Asosiy menyu:", { reply_markup: this.getMainMenu() });
  }

  private async editBalanceConversation(conversation: MyConversation, ctx: MyContext) {
    if (!ctx.session.editUserId) return;
    await ctx.reply("Summa kiritng (+5000 yoki -2000):");
    const { message } = await conversation.wait();
    const amount = parseInt(message?.text || '0', 10);
    if (isNaN(amount) || amount === 0) return ctx.reply("❌ Xato miqdor.");
    const user = await conversation.external(() => this.prisma.user.update({ where: { id: ctx.session.editUserId! }, data: { balance: { increment: amount } } }));
    await ctx.reply("✅ Yangi balans: " + user.balance.toLocaleString() + " UZS");
  }

  private async sendMessageConversation(conversation: MyConversation, ctx: MyContext) {
    if (!ctx.session.msgTargetId) return;
    await ctx.reply("Mijozga yozmoqchi bo'lgan xabaringizni yuboring:");
    const { message } = await conversation.wait();
    if (message?.text) {
      try {
        await conversation.external(() => this.bot!.api.sendMessage(ctx.session.msgTargetId!, "📩 **Admindan xabar:**\n\n" + message.text, { parse_mode: 'Markdown' }));
        await ctx.reply("✅ Xabar yuborildi!");
      } catch (e) {
        await ctx.reply("❌ Xatolik! Balki mijoz botni bloklagan.");
      }
    }
  }

  private async broadcastConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Post (Rasm/Video/Text) yuboring:", { reply_markup: { remove_keyboard: true } });
    const replyCtx = await conversation.wait();
    if (!replyCtx.message) return;
    await ctx.reply("Hammaga tarqatamizmi?", { reply_markup: new InlineKeyboard().text('✅ Ha', 'confirm_broadcast').text('❌ Yoq', 'cancel_broadcast') });
    ctx.session.broadcastMsgId = replyCtx.message.message_id;
  }

  private async editCardNumberConversation(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Yangi karta raqamini yuboring:", { reply_markup: { remove_keyboard: true } });
    const { message } = await conversation.wait();
    if (message?.text) {
      await conversation.external(() => this.settingsService.updateSettings({ cardNumber: message.text }));
      await ctx.reply("✅ Saqlandi!", { reply_markup: this.getMainMenu() });
      await this.sendSettingsMenu(ctx);
    }
  }

  // --- MENUS ---
  private getMainMenu() {
    return new Keyboard()
      .text('📦 Buyurtmalar').text('💳 To\'lovlar').row()
      .text('👥 Mijozlar').text('📊 Statistika').row()
      .text('📢 Xabar tarqatish').text('⚙️ Sozlamalar').resized();
  }

  private setupMenus() {
    if (!this.bot) return;
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from?.id || '';
      const welcomeMsg = `👋 Xush Kelibsiz! Hurmatli mijoz ${userId}\n\n` +
        `Bu FastUC - donat va akkaunt sotib olishni eng oson usuli.\n\n` +
        `📱 Qulay interfeys\n` +
        `⚡ Tezkor to'lov tizimi\n` +
        `🛡 Escrow himoyasi\n\n` +
        `👇 Pastdagi "Xarid qilish 🚀" tugmasini bosing va hoziroq boshlang!`;
        
      const keyboard = new InlineKeyboard().webApp('Xarid qilish 🚀', 'https://fast-pay-topaz.vercel.app/');
      const photoPath = path.join(process.cwd(), 'assets', 'welcome.jpg');
      
      try {
        if (fs.existsSync(photoPath)) await ctx.replyWithPhoto(new InputFile(photoPath), { caption: welcomeMsg, reply_markup: keyboard });
        else await ctx.reply(welcomeMsg, { reply_markup: keyboard });
      } catch (err) { await ctx.reply(welcomeMsg, { reply_markup: keyboard }); }

      if (this.adminId && ctx.from?.id === this.adminId) {
        await ctx.reply('👨‍💻 **Admin Panel**', { reply_markup: this.getMainMenu(), parse_mode: 'Markdown' });
      }
    });
  }

  private async sendSettingsMenu(ctx: MyContext) {
    const s = this.settingsService.getSettings();
    const msg = "⚙️ **Sozlamalar**\n\n🟢 Holat: " + (s.isMaintenance ? "🔴 O'chirilgan" : "🟢 Yoniq") + "\n💳 Karta: " + s.cardNumber + "";
    const kb = new InlineKeyboard()
      .text("📝 Karta almashtirish", 'menu_edit_card_num').row()
      .text(s.isMaintenance ? "🟢 Tizimni yoqish" : "🔴 Tizimni o'chirish", 'menu_toggle_maint');
    await ctx.reply(msg, { reply_markup: kb, parse_mode: 'Markdown' });
  }

  // Modern Pagination Viewers
  private async showOrder(ctx: Context, skip: number) {
    const total = await this.prisma.order.count({ where: { status: 'PENDING' } });
    if (total === 0) {
      if (skip === 0) return ctx.reply("✅ Yangi buyurtmalar yo'q.");
      return ctx.editMessageText("✅ Barchasi bajarildi!");
    }
    const order = await this.prisma.order.findFirst({ where: { status: 'PENDING' }, include: { user: true, product: true }, skip, orderBy: { createdAt: 'asc' } });
    if (!order) return this.showOrder(ctx, 0); // fallback

    const msg = "🛒 **#" + order.id + "** | 💰 " + order.priceUzs.toLocaleString() + " UZS\n" +
                "👤 @" + (order.user.username || order.user.telegramId) + "\n" +
                "🎮 " + order.product.label + " ➔ 🆔 " + order.targetId + "";
    
    const kb = new InlineKeyboard()
      .text('✅ Tasdiq', "ful_ord_" + order.id + "_" + skip)
      .text('❌ Bekor', "can_ord_" + order.id + "_" + skip).row()
      .text('✉️ Mijozga yozish', "send_msg_" + order.user.telegramId).row();
      
    // Pagination row
    if (total > 1) {
      if (skip > 0) kb.text('⬅️', "nxt_ord_" + (skip - 1));
      kb.text((skip + 1) + "/" + total, "noop");
      if (skip + 1 < total) kb.text('➡️', "nxt_ord_" + (skip + 1));
    }
    
    if (ctx.callbackQuery) await ctx.editMessageText(msg, { reply_markup: kb, parse_mode: 'Markdown' });
    else await ctx.reply(msg, { reply_markup: kb, parse_mode: 'Markdown' });
  }

  private async showTopup(ctx: Context, skip: number) {
    const total = await this.prisma.topup.count({ where: { status: 'PENDING' } });
    if (total === 0) {
      if (skip === 0) return ctx.reply("✅ Yangi to'lovlar yo'q.");
      return ctx.editMessageText("✅ Barchasi ko'rildi!");
    }
    const t = await this.prisma.topup.findFirst({ where: { status: 'PENDING' }, include: { user: true }, skip, orderBy: { createdAt: 'asc' } });
    if (!t) return this.showTopup(ctx, 0);

    const msg = "💳 **#" + t.id + "** | 💰 " + t.amountUzs.toLocaleString() + " UZS\n" +
                "👤 @" + (t.user.username || t.user.telegramId) + "\n💳 " + t.method;
    
    const kb = new InlineKeyboard()
      .text('✅ Tasdiq', "app_top_" + t.id + "_" + skip)
      .text('❌ Bekor', "rej_top_" + t.id + "_" + skip).row()
      .text('✉️ Mijozga yozish', "send_msg_" + t.user.telegramId).row();

    if (total > 1) {
      if (skip > 0) kb.text('⬅️', "nxt_top_" + (skip - 1));
      kb.text((skip + 1) + "/" + total, "noop");
      if (skip + 1 < total) kb.text('➡️', "nxt_top_" + (skip + 1));
    }
    
    if (ctx.callbackQuery) await ctx.editMessageText(msg, { reply_markup: kb, parse_mode: 'Markdown' });
    else await ctx.reply(msg, { reply_markup: kb, parse_mode: 'Markdown' });
  }

  private setupHandlers() {
    if (!this.bot) return;
    
    this.bot.hears('📦 Buyurtmalar', async (ctx) => { if (ctx.from?.id === this.adminId) await this.showOrder(ctx, 0); });
    this.bot.hears('💳 To\'lovlar', async (ctx) => { if (ctx.from?.id === this.adminId) await this.showTopup(ctx, 0); });
    this.bot.hears('👥 Mijozlar', async (ctx) => { if (ctx.from?.id === this.adminId) await ctx.conversation.enter('search_user'); });
    this.bot.hears('📢 Xabar tarqatish', async (ctx) => { if (ctx.from?.id === this.adminId) await ctx.conversation.enter('broadcast'); });
    this.bot.hears('⚙️ Sozlamalar', async (ctx) => { if (ctx.from?.id === this.adminId) await this.sendSettingsMenu(ctx); });
    
    this.bot.hears('📊 Statistika', async (ctx) => {
      if (ctx.from?.id !== this.adminId) return;
      const usersCount = await this.prisma.user.count();
      const completed = await this.prisma.order.count({ where: { status: 'FULFILLED' } });
      const rev = await this.prisma.order.aggregate({ where: { status: 'FULFILLED' }, _sum: { priceUzs: true } });
      await ctx.reply("📊 **Statistika**\n\n👥 Mijozlar: " + usersCount + "\n🛒 Sotildi: " + completed + " ta\n💰 Aylanma: " + (rev._sum.priceUzs || 0).toLocaleString() + " UZS", { parse_mode: 'Markdown' });
    });

    // Callbacks
    this.bot.callbackQuery('menu_edit_card_num', async (ctx) => { await ctx.conversation.enter('edit_card_num'); });
    this.bot.callbackQuery('menu_toggle_maint', async (ctx) => {
      const current = this.settingsService.getSettings().isMaintenance;
      this.settingsService.updateSettings({ isMaintenance: !current });
      await ctx.answerCallbackQuery("Holat o'zgardi!");
      await this.sendSettingsMenu(ctx as any);
    });

    this.bot.callbackQuery(/^nxt_ord_(\d+)$/, async (ctx) => { await this.showOrder(ctx, parseInt(ctx.match[1])); });
    this.bot.callbackQuery(/^ful_ord_(.+)_(.+)$/, async (ctx) => {
      await this.prisma.order.update({ where: { id: ctx.match[1] }, data: { status: 'FULFILLED', fulfilledAt: new Date(), fulfilledBy: ctx.from.id?.toString() }});
      await ctx.answerCallbackQuery("✅ Bajarildi");
      await this.showOrder(ctx, Math.max(0, parseInt(ctx.match[2]) - 1));
    });
    this.bot.callbackQuery(/^can_ord_(.+)_(.+)$/, async (ctx) => {
      const order = await this.prisma.order.update({ where: { id: ctx.match[1] }, data: { status: 'CANCELLED', cancelReason: 'Admin bekor qildi' }});
      await this.prisma.user.update({ where: { id: order.userId }, data: { balance: { increment: order.priceUzs } }});
      await ctx.answerCallbackQuery("❌ Bekor qilindi (Pul qaytdi)");
      await this.showOrder(ctx, Math.max(0, parseInt(ctx.match[2]) - 1));
    });
    
    this.bot.callbackQuery(/^nxt_top_(\d+)$/, async (ctx) => { await this.showTopup(ctx, parseInt(ctx.match[1])); });
    this.bot.callbackQuery(/^app_top_(.+)_(.+)$/, async (ctx) => {
      const t = await this.prisma.topup.update({ where: { id: ctx.match[1] }, data: { status: "APPROVED", approvedAt: new Date(), approvedBy: ctx.from.id?.toString() }, include: { user: true }});
      await this.prisma.user.update({ where: { id: t.userId }, data: { balance: { increment: t.amountUzs } }});
      await ctx.answerCallbackQuery("✅ Tasdiqlandi (Balans qo'shildi)");
      
      // Notify user
      try { await this.bot!.api.sendMessage(Number(t.user.telegramId), "💰 Balansingiz " + t.amountUzs.toLocaleString() + " UZS ga to'ldirildi!"); } catch(e){}

      await this.showTopup(ctx, Math.max(0, parseInt(ctx.match[2]) - 1));
    });
    this.bot.callbackQuery(/^rej_top_(.+)_(.+)$/, async (ctx) => {
      const t = await this.prisma.topup.update({ where: { id: ctx.match[1] }, data: { status: 'REJECTED', rejectReason: 'Admin rad etdi' }, include: { user: true }});
      await ctx.answerCallbackQuery("❌ Rad etildi");
      
      try { await this.bot!.api.sendMessage(Number(t.user.telegramId), "❌ To'lov so'rovingiz rad etildi."); } catch(e){}

      await this.showTopup(ctx, Math.max(0, parseInt(ctx.match[2]) - 1));
    });

    this.bot.callbackQuery(/^send_msg_(.+)$/, async (ctx) => {
      ctx.session.msgTargetId = ctx.match[1];
      await ctx.conversation.enter('send_msg');
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
  }

  async notifyNewOrder(orderId: string) {
    if (!this.bot || !this.adminId) return;
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { user: true, product: true } });
    if (!order) return;
    const msg = "🔔 **YANGI BUYURTMA**\n👤 @" + (order.user.username || order.user.telegramId) + "\n🎮 " + order.product.label + " ➔ 🆔 " + order.targetId + "\n💰 " + order.priceUzs.toLocaleString() + " UZS";
    const kb = new InlineKeyboard().text('✅ Tasdiq', "ful_ord_" + order.id + "_0").text('❌ Bekor', "can_ord_" + order.id + "_0");
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: kb, parse_mode: 'Markdown' }).catch(e => this.logger.error(e));
  }

  async notifyNewTopup(topupId: string) {
    if (!this.bot || !this.adminId) return;
    const t = await this.prisma.topup.findUnique({ where: { id: topupId }, include: { user: true } });
    if (!t) return;
    const msg = "💳 **YANGI TO'LOV SO'ROVI**\n👤 @" + (t.user.username || t.user.telegramId) + "\n💵 " + t.amountUzs.toLocaleString() + " UZS";
    const kb = new InlineKeyboard().text('✅ Tasdiq', "app_top_" + t.id + "_0").text('❌ Rad etish', "rej_top_" + t.id + "_0");
    this.bot.api.sendMessage(this.adminId, msg, { reply_markup: kb, parse_mode: 'Markdown' }).catch(e => this.logger.error(e));
  }
}


