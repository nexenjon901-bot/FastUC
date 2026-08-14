import type {
  Order,
  PaymentMethod,
  Product,
  ProductType,
  TopupMethod,
  TopupRequest,
  User,
  VerifyResult,
} from '../types';
import {
  ACCOUNT_LISTINGS,
  STARS_PRODUCTS,
  UC_PRODUCTS,
  delay,
  getStoredOrders,
  getStoredTopups,
  getStoredUser,
  nextOrderId,
  setStoredOrders,
  setStoredTopups,
  setStoredUser,
} from '../data/store';

const ADMIN_TG = import.meta.env.VITE_ADMIN_TG || 'https://t.me/FastUC_Support';
const FEEDBACK_TG = import.meta.env.VITE_FEEDBACK_TG || 'https://t.me/FastUC_Feedback';
const NEWS_TG = import.meta.env.VITE_NEWS_TG || 'https://t.me/FastUC_News';

export const links = {
  admin: ADMIN_TG,
  feedback: FEEDBACK_TG,
  news: NEWS_TG,
  support: ADMIN_TG,
  terms: '#',
  privacy: '#',
};

export function formatUzs(n: number) {
  return `${n.toLocaleString('uz-UZ')} UZS`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: Order['status']) {
  const map: Record<Order['status'], string> = {
    PAYMENT_PENDING: "To'lov kutilmoqda",
    PAYMENT_CHECKING: "To'lov tekshirilmoqda",
    CONFIRMED: 'Tasdiqlandi',
    DELIVERING: 'Yetkazilmoqda',
    COMPLETED: 'Yakunlandi',
    CANCELLED: 'Bekor qilindi',
  };
  return map[status];
}

export function statusTone(status: Order['status']): 'warning' | 'primary' | 'success' | 'error' | 'muted' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED') return 'error';
  if (status === 'CONFIRMED' || status === 'DELIVERING') return 'primary';
  if (status === 'PAYMENT_CHECKING' || status === 'PAYMENT_PENDING') return 'warning';
  return 'muted';
}

async function tryApi<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export const apiService = {
  async getMe(): Promise<User> {
    await delay(350);
    return getStoredUser();
  },

  async getProducts(type: ProductType): Promise<Product[]> {
    await delay(450);
    if (type === 'UC') return UC_PRODUCTS.filter((p) => p.active);
    if (type === 'STARS') return STARS_PRODUCTS.filter((p) => p.active);
    return [];
  },

  async getAccounts() {
    await delay(400);
    return ACCOUNT_LISTINGS.filter((a) => a.active);
  },

  async getAccount(id: string) {
    await delay(300);
    return ACCOUNT_LISTINGS.find((a) => a.id === id) || null;
  },

  async createAccountOrder(accountId: string, paymentMethod: PaymentMethod): Promise<Order> {
    await delay(900);
    const account = ACCOUNT_LISTINGS.find((a) => a.id === accountId);
    if (!account) throw new Error('Akkaunt topilmadi');

    const user = getStoredUser();
    if (paymentMethod === 'BALANCE' && user.balance < account.price) {
      throw new Error('Balansingiz yetarli emas');
    }
    if (paymentMethod === 'BALANCE') {
      user.balance -= account.price;
      setStoredUser(user);
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: nextOrderId(),
      userId: user.id,
      productId: account.id,
      productType: 'ACCOUNT',
      productLabel: account.title,
      amount: 1,
      price: account.price,
      targetId: account.id,
      targetName: account.rank,
      status: paymentMethod === 'BALANCE' ? 'PAYMENT_CHECKING' : 'PAYMENT_PENDING',
      paymentMethod,
      createdAt: now,
      updatedAt: now,
    };
    setStoredOrders([order, ...getStoredOrders()]);
    return order;
  },

  async verifyPlayer(playerId: string): Promise<VerifyResult> {
    await delay(900);
    const id = playerId.trim();
    if (!id) return { ok: false, message: 'Player ID kiriting' };
    if (!/^\d{6,12}$/.test(id)) return { ok: false, message: 'Player topilmadi' };
    if (id.endsWith('000')) return { ok: false, message: 'Player topilmadi' };
    const nickPool = ['NEXEN', 'SHADOW', 'VIPER', 'NOVA', 'RAZER'];
    const nickname = nickPool[Number(id.slice(-1)) % nickPool.length];
    return { ok: true, playerId: id, nickname, platform: 'PUBG Mobile' };
  },

  async verifyTelegram(username: string): Promise<VerifyResult> {
    await delay(900);
    let u = username.trim().replace(/^@/, '');
    if (!u) return { ok: false, message: 'Username kiriting' };
    if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(u)) {
      return { ok: false, message: 'Username noto‘g‘ri' };
    }
    return {
      ok: true,
      username: `@${u}`,
      displayName: u.charAt(0).toUpperCase() + u.slice(1),
    };
  },

  async createOrder(input: {
    productId: string;
    targetId: string;
    targetName?: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> {
    await delay(1000);
    const products = [...UC_PRODUCTS, ...STARS_PRODUCTS];
    const product = products.find((p) => p.id === input.productId);
    if (!product || !product.active) throw new Error('Mahsulot topilmadi');

    const user = getStoredUser();
    // Server-side price trust simulation
    const finalPrice = product.price;

    if (input.paymentMethod === 'BALANCE' && user.balance < finalPrice) {
      throw new Error('Balansingiz yetarli emas');
    }

    if (input.paymentMethod === 'BALANCE') {
      user.balance -= finalPrice;
      setStoredUser(user);
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: nextOrderId(),
      userId: user.id,
      productId: product.id,
      productType: product.type,
      productLabel: product.label,
      amount: product.amount,
      price: finalPrice,
      targetId: input.targetId,
      targetName: input.targetName,
      status: input.paymentMethod === 'BALANCE' ? 'PAYMENT_CHECKING' : 'PAYMENT_PENDING',
      paymentMethod: input.paymentMethod,
      createdAt: now,
      updatedAt: now,
    };

    const orders = [order, ...getStoredOrders()];
    setStoredOrders(orders);
    return order;
  },

  async getOrders(): Promise<Order[]> {
    await delay(400);
    return getStoredOrders();
  },

  async getOrder(id: string): Promise<Order | null> {
    await delay(300);
    return getStoredOrders().find((o) => o.id === id) || null;
  },

  async createTopup(amount: number, method: TopupMethod): Promise<TopupRequest> {
    await delay(700);
    if (amount < 2000) throw new Error('Minimal summa 2 000 UZS');
    const user = getStoredUser();
    const req: TopupRequest = {
      id: `TP-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      amount,
      method,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setStoredTopups([req, ...getStoredTopups()]);
    return req;
  },

  openAdminChat(payload: { kind: string; amount?: number; extra?: string }) {
    const summa = payload.amount
      ? `${payload.amount.toLocaleString('uz-UZ')} UZS`
      : '';
    const isBankomat = payload.kind.toLowerCase().includes('bankomat');
    const message = isBankomat
      ? `Assalomu Alaykum shep, pul oʻtkazmoqchi edim!\nBankomat orqali to'ldirmoqchiman: ${summa}`
      : `Assalomu Alaykum shep, pul oʻtkazmoqchi edim!\nKarta raqam bering: ${summa}`;
    const text = encodeURIComponent(
      payload.extra ? `${message}\n${payload.extra}` : message
    );
    const url = `${ADMIN_TG}${ADMIN_TG.includes('?') ? '&' : '?'}text=${text}`;
    window.open(url, '_blank');
  },
};

void tryApi;
