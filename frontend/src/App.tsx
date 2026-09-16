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

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTopUpPage from './pages/admin/AdminTopUpPage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import axios from 'axios';

const queryClient = new QueryClient();

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen bg-bg font-sans">
    {children}
    <BottomNav />
  </div>
);

// Admin API instance with token
const adminApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000' });
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
adminApi.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  }
  return Promise.reject(err);
});

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    if (WebApp.ready) WebApp.ready();
    if (WebApp.expand) WebApp.expand();
    const lang = WebApp.initDataUnsafe?.user?.language_code || 'uz';
    const supported = ['uz', 'ru', 'en'];
    initI18n(supported.includes(lang) ? lang : 'uz');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" /></div>}>
            <Routes>
              {/* User Routes (TWA) */}
              <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
              <Route path="/accounts" element={<MainLayout><AccountsPage /></MainLayout>} />
              <Route path="/accounts/:id" element={<MainLayout><AccountDetailPage /></MainLayout>} />
              <Route path="/balance" element={<MainLayout><BalancePage /></MainLayout>} />
              <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />
              <Route path="/orders/:id" element={<MainLayout><EscrowPage /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={
                <AdminLoginPage onLogin={() => { window.location.href = '/admin/dashboard'; }} />
              } />
              
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage adminApi={adminApi} />} />
                <Route path="orders" element={<AdminOrdersPage adminApi={adminApi} />} />
                <Route path="topups" element={<AdminTopUpPage adminApi={adminApi} />} />
                <Route path="users" element={<AdminUsersPage adminApi={adminApi} />} />
                <Route path="accounts" element={<AdminAccountsPage adminApi={adminApi} />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
