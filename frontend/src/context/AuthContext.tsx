import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import api from '../api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        WebApp.ready();
        const initData = WebApp.initData;

        // For development: if no initData, use stored token
        const storedToken = localStorage.getItem('access_token');
        if (!initData && storedToken) {
          setToken(storedToken);
          setIsLoading(false);
          return;
        }

        if (!initData) {
          console.warn('No Telegram initData available (not in Telegram)');
          setIsLoading(false);
          return;
        }

        const res = await api.post('/auth/telegram', { initData });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        setUser(userData);
      } catch (err) {
        console.error('Auth failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
