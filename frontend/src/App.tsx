import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { AuthProvider } from './context/AuthContext';
import { initI18n } from './i18n';
import './index.css';

import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import BalancePage from './pages/BalancePage';
import OrdersPage from './pages/OrdersPage';
import EscrowPage from './pages/EscrowPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ProductPurchasePage from './pages/ProductPurchasePage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    if (WebApp.ready) WebApp.ready();
    if (WebApp.expand) WebApp.expand();

    // Set language from Telegram
    const lang = WebApp.initDataUnsafe?.user?.language_code || 'uz';
    const supported = ['uz', 'ru', 'en'];
    initI18n(supported.includes(lang) ? lang : 'uz');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative min-h-screen bg-bg font-sans">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/accounts/:id" element={<AccountDetailPage />} />
                <Route path="/balance" element={<BalancePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<EscrowPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/products/:id" element={<ProductPurchasePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Routes>
              <Route path="/admin" element={null} />
              <Route path="*" element={<BottomNav />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
