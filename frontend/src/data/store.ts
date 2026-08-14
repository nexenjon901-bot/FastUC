import type { GameAccount, Order, Product, TopupRequest, User } from '../types';

const KEYS = {
  user: 'fastuc_user_v1',
  orders: 'fastuc_orders_v1',
  topups: 'fastuc_topups_v1',
};

export const ACCOUNT_LISTINGS: GameAccount[] = [
  {
    id: 'acc-1',
    title: 'Conqueror Akkaunt',
    rank: 'Conqueror',
    level: 78,
    skins: 42,
    price: 850000,
    currency: 'UZS',
    badge: 'TOP',
    image: '/accounts-banner.png',
    description: 'Yuqori rank, premium skinlar va to‘liq bog‘langan akkaunt.',
    features: ['Email bog‘langan', 'Telefon bog‘langan', 'Premium skinlar', 'Tez o‘tkazish'],
    active: true,
  },
  {
    id: 'acc-2',
    title: 'Crown Akkaunt',
    rank: 'Crown',
    level: 65,
    skins: 28,
    price: 520000,
    currency: 'UZS',
    badge: 'HOT',
    image: '/accounts-banner.png',
    description: 'Crown tier, yaxshi skin to‘plami bilan.',
    features: ['Email bog‘langan', 'RP skinlar', 'Tez o‘tkazish'],
    active: true,
  },
  {
    id: 'acc-3',
    title: 'Ace Akkaunt',
    rank: 'Ace',
    level: 52,
    skins: 15,
    price: 280000,
    currency: 'UZS',
    image: '/accounts-banner.png',
    description: 'Ace tier, arzon va ishonchli variant.',
    features: ['Email bog‘langan', 'Tez o‘tkazish'],
    active: true,
  },
  {
    id: 'acc-4',
    title: 'Diamond Akkaunt',
    rank: 'Diamond',
    level: 45,
    skins: 12,
    price: 195000,
    currency: 'UZS',
    image: '/accounts-banner.png',
    description: 'Diamond tier, boshlang‘ich premium akkaunt.',
    features: ['Email bog‘langan'],
    active: true,
  },
];

export const UC_PRODUCTS: Product[] = [
  { id: 'uc-60', type: 'UC', amount: 60, price: 12000, currency: 'UZS', active: true, label: '60 UC', createdAt: '2026-01-01' },
  { id: 'uc-325', type: 'UC', amount: 325, price: 58000, currency: 'UZS', active: true, label: '325 UC', createdAt: '2026-01-01' },
  { id: 'uc-660', type: 'UC', amount: 660, price: 115000, currency: 'UZS', active: true, label: '660 UC', createdAt: '2026-01-01' },
  { id: 'uc-1800', type: 'UC', amount: 1800, price: 290000, currency: 'UZS', active: true, label: '1800 UC', createdAt: '2026-01-01' },
  { id: 'uc-3850', type: 'UC', amount: 3850, price: 580000, currency: 'UZS', active: true, label: '3850 UC', createdAt: '2026-01-01' },
  { id: 'uc-8100', type: 'UC', amount: 8100, price: 1160000, currency: 'UZS', active: true, label: '8100 UC', createdAt: '2026-01-01' },
];

export const STARS_PRODUCTS: Product[] = [
  { id: 'stars-50', type: 'STARS', amount: 50, price: 15000, currency: 'UZS', active: true, label: '50 Stars', createdAt: '2026-01-01' },
  { id: 'stars-100', type: 'STARS', amount: 100, price: 30000, currency: 'UZS', active: true, label: '100 Stars', createdAt: '2026-01-01' },
  { id: 'stars-250', type: 'STARS', amount: 250, price: 75000, currency: 'UZS', active: true, label: '250 Stars', createdAt: '2026-01-01' },
  { id: 'stars-500', type: 'STARS', amount: 500, price: 150000, currency: 'UZS', active: true, label: '500 Stars', createdAt: '2026-01-01' },
  { id: 'stars-1000', type: 'STARS', amount: 1000, price: 295000, currency: 'UZS', active: true, label: '1000 Stars', createdAt: '2026-01-01' },
  { id: 'stars-2500', type: 'STARS', amount: 2500, price: 720000, currency: 'UZS', active: true, label: '2500 Stars', createdAt: '2026-01-01' },
];

const defaultUser = (): User => ({
  id: 'u-local',
  telegramId: '123456',
  username: 'fastuc_user',
  firstName: 'Foydalanuvchi',
  lastName: '',
  balance: 0,
  createdAt: '2026-08-13T10:00:00.000Z',
  completedOrders: 0,
});

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUser(): User {
  return read(KEYS.user, defaultUser());
}

export function setStoredUser(user: User) {
  write(KEYS.user, user);
}

export function getStoredOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []);
}

export function setStoredOrders(orders: Order[]) {
  write(KEYS.orders, orders);
}

export function getStoredTopups(): TopupRequest[] {
  return read<TopupRequest[]>(KEYS.topups, []);
}

export function setStoredTopups(topups: TopupRequest[]) {
  write(KEYS.topups, topups);
}

export function nextOrderId(): string {
  const n = 10000 + getStoredOrders().length + Math.floor(Math.random() * 80);
  return `FU-${n}`;
}

export function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms));
}
