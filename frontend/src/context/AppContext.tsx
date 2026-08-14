import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { apiService } from '../api/services';
import { setStoredUser } from '../data/store';
import type { Order, User } from '../types';

interface ToastState {
  id: number;
  message: string;
}

interface AppCtx {
  user: User | null;
  loading: boolean;
  orders: Order[];
  toast: ToastState | null;
  refreshUser: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  showToast: (message: string) => void;
  setUserBalance: (balance: number) => void;
}

const AppContext = createContext<AppCtx | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, 2600);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await apiService.getMe();
    setUser(me);
  }, []);

  const refreshOrders = useCallback(async () => {
    const list = await apiService.getOrders();
    setOrders(list);
  }, []);

  const setUserBalance = useCallback((balance: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, balance };
      setStoredUser(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor('#111321');
        WebApp.setBackgroundColor('#111321');

        const tgUser = WebApp.initDataUnsafe?.user;
        if (tgUser) {
          const current = await apiService.getMe();
          const merged: User = {
            ...current,
            telegramId: String(tgUser.id),
            username: tgUser.username || current.username,
            firstName: tgUser.first_name || current.firstName,
            lastName: tgUser.last_name || current.lastName,
            photoUrl: tgUser.photo_url || current.photoUrl,
          };
          setStoredUser(merged);
          setUser(merged);
        } else {
          await refreshUser();
        }
        await refreshOrders();
      } catch {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, [refreshOrders, refreshUser]);

  const value = useMemo(
    () => ({ user, loading, orders, toast, refreshUser, refreshOrders, showToast, setUserBalance }),
    [user, loading, orders, toast, refreshUser, refreshOrders, showToast, setUserBalance]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast.message}</div>}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
