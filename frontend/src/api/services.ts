import api from '../api';
import type { Order, PaymentMethod, Product, ProductType, TopupMethod, TopupRequest, User, VerifyResult } from '../types';

export const links = {
  admin: import.meta.env.VITE_ADMIN_TG || 'https://t.me/fastpay_tgbot',
  feedback: import.meta.env.VITE_FEEDBACK_TG || 'https://t.me/fastpay_tgbot',
  news: import.meta.env.VITE_NEWS_TG || 'https://t.me/fastpay_tgbot',
  support: import.meta.env.VITE_ADMIN_TG || 'https://t.me/fastpay_tgbot',
  terms: '#',
  privacy: '#',
};

export function formatUzs(n: number) { return n.toLocaleString('uz-UZ') + ' UZS'; }

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function statusLabel(status: Order['status']) {
  const map: Record<Order['status'], string> = {
    PAYMENT_PENDING: "To'lov kutilmoqda", PAYMENT_CHECKING: "To'lov tekshirilmoqda",
    CONFIRMED: 'Tasdiqlandi', DELIVERING: 'Yetkazilmoqda', COMPLETED: 'Yakunlandi', CANCELLED: 'Bekor qilindi',
    PENDING: "To'lov kutilmoqda", FULFILLED: "Yakunlandi"
  } as any;
  return map[status] || status;
}

export function statusTone(status: Order['status']): 'warning' | 'primary' | 'success' | 'error' | 'muted' {
  if (status === 'COMPLETED' || status === 'FULFILLED') return 'success';
  if (status === 'CANCELLED') return 'error';
  if (status === 'CONFIRMED' || status === 'DELIVERING') return 'primary';
  if (status === 'PAYMENT_CHECKING' || status === 'PAYMENT_PENDING' || status === 'PENDING') return 'warning';
  return 'muted';
}

export const apiService = {
  async getMe(): Promise<User> {
    const res = await api.get('/users/me');
    return res.data;
  },
  async getProducts(type: ProductType): Promise<Product[]> {
    const res = await api.get('/products');
    return res.data.filter((p: any) => p.category === type);
  },
  async getAccounts() { return []; },
  async getAccount(id: string) { return null; },
  async createAccountOrder(accountId: string, paymentMethod: PaymentMethod): Promise<Order> { throw new Error('Not implemented'); },
  
  async verifyPlayer(playerId: string): Promise<VerifyResult> {
    const id = playerId.trim();
    if (!id || id.length < 5) return { ok: false, message: 'Player topilmadi' };
    return { ok: true, playerId: id, nickname: 'Player_' + id.slice(-4), platform: 'PUBG Mobile' };
  },
  async verifyTelegram(username: string): Promise<VerifyResult> {
    let u = username.trim().replace(/^@/, '');
    if (!u) return { ok: false, message: 'Username kiriting' };
    return { ok: true, username: '@' + u, displayName: u };
  },

  async createOrder(input: { productId: string; targetId: string; targetName?: string; paymentMethod: PaymentMethod }): Promise<Order> {
    const res = await api.post('/orders', {
      productId: input.productId,
      targetId: input.targetId,
      paymentMethod: input.paymentMethod
    });
    return res.data;
  },

  async getOrders(): Promise<Order[]> {
    const res = await api.get('/orders/me');
    return res.data;
  },
  async getOrder(id: string): Promise<Order | null> {
    const res = await api.get('/orders/' + id);
    return res.data;
  },

  async createTopup(amount: number, method: TopupMethod): Promise<TopupRequest> {
    const res = await api.post('/topups', {
      amountUzs: amount,
      method: method
    });
    return res.data;
  },

  openAdminChat(payload: { kind: string; amount?: number; extra?: string }) {
    // Endi admin bilan shaxsiy chatga o'tish shart emas (agar xohlamasa), lekin chek tashlash uchun o'tkazamiz.
    const summa = payload.amount ? payload.amount.toLocaleString('uz-UZ') + ' UZS' : '';
    const message = "Assalomu alaykum, to'lov qildim. Chekni yuboryapman. Summa: " + summa;
    const text = encodeURIComponent(message);
    window.open(links.admin + "?text=" + text, '_blank');
  }
};