export type ProductType = 'UC' | 'STARS' | 'ACCOUNT';

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CHECKING'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'BALANCE' | 'UZCARD_HUMO' | 'BANKOMAT';

export type TopupMethod = 'UZCARD_HUMO' | 'BANKOMAT';

export interface Product {
  id: string;
  type: ProductType;
  amount: number;
  price: number;
  currency: 'UZS';
  active: boolean;
  label: string;
  icon?: string;
  createdAt: string;
}

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
  createdAt: string;
  completedOrders: number;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productType: ProductType;
  productLabel: string;
  amount: number;
  price: number;
  targetId: string;
  targetName?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface TopupRequest {
  id: string;
  userId: string;
  amount: number;
  method: TopupMethod;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface GameAccount {
  id: string;
  title: string;
  rank: string;
  level: number;
  skins: number;
  price: number;
  currency: 'UZS';
  badge?: string;
  image: string;
  description: string;
  features: string[];
  active: boolean;
}

export interface VerifiedPlayer {
  ok: true;
  playerId: string;
  nickname: string;
  platform: 'PUBG Mobile';
}

export interface VerifiedTelegram {
  ok: true;
  username: string;
  displayName: string;
}

export type VerifyResult =
  | VerifiedPlayer
  | VerifiedTelegram
  | { ok: false; message: string };
