import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import api from '../api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  photoUrl: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  devLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  photoUrl: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  devLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  const applyAuth = (access_token: string, userData?: any) => {
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    if (userData) setUser(userData);
    
    if (WebApp.initDataUnsafe?.user?.photo_url) {
      setPhotoUrl(WebApp.initDataUnsafe.user.photo_url);
    }
  };

  const devLogin = useCallback(async () => {
    const res = await api.post('/auth/dev-login', {
      telegramId: 'dev-user-1',
      firstName: 'Dev User',
    });
    applyAuth(res.data.access_token, res.data.user);
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (WebApp.ready) WebApp.ready();
        const initData = WebApp.initData;

        if (initData) {
          const res = await api.post('/auth/telegram', { initData });
          applyAuth(res.data.access_token, res.data.user);
          return;
        }

        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          setToken(storedToken);
          try {
            const res = await api.get('/users/me');
            setUser(res.data);
          } catch {
            // token invalid — try dev login in browser
            if (import.meta.env.DEV) {
              await devLogin();
            }
          }
          return;
        }

        // Browser without Telegram: auto dev-login in development
        if (import.meta.env.DEV) {
          console.warn('No Telegram initData — using dev-login');
          await devLogin();
        }
      } catch (err) {
        console.error('Auth failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [devLogin]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 10000); // 10 seconds polling for real-time balance

    return () => clearInterval(interval);
  }, [token, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        photoUrl,
        isLoading,
        isAuthenticated: !!token,
        refreshUser,
        devLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
