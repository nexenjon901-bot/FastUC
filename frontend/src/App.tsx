import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import BalancePage from './pages/BalancePage';
import TopupPage from './pages/TopupPage';
import TopupSuccessPage from './pages/TopupSuccessPage';
import AccountDetailPage from './pages/AccountDetailPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

const BackButtonBridge: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const rootPaths = ['/', '/balance', '/orders', '/profile'];
      if (rootPaths.includes(location.pathname)) {
        WebApp.BackButton.hide();
        return;
      }
      WebApp.BackButton.show();
      const handler = () => navigate(-1);
      WebApp.BackButton.onClick(handler);
      return () => {
        WebApp.BackButton.offClick(handler);
        WebApp.BackButton.hide();
      };
    } catch {
      return undefined;
    }
  }, [location.pathname, navigate]);

  return null;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/topup/success') || location.pathname.startsWith('/order-success');

  return (
    <>
      <BackButtonBridge />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog/:type" element={<CatalogPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/topup/:method" element={<TopupPage />} />
        <Route path="/topup/success" element={<TopupSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {
      /* dev */
    }
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <div className="relative min-h-screen max-w-[480px] mx-auto bg-[#12132b]">
            <AppLayout />
          </div>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
