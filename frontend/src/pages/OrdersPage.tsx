import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('Hammasi');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['Hammasi', 'Kutilmoqda', 'Muvaffaqiyatli', 'Bekor qilingan'];

  const triggerHaptic = (style: 'light'|'medium'|'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    Promise.all([
      api.get('/users/me'),
      api.get('/orders')
    ])
    .then(([userRes, ordersRes]) => {
      setBalance(userRes.data.balance || 0);
      setOrders(ordersRes.data || []);
    })
    .catch(err => {
      console.error(err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'Hammasi') return true;
    if (activeTab === 'Kutilmoqda') return order.status === 'PENDING' || order.status === 'CREDENTIALS_SENT';
    if (activeTab === 'Muvaffaqiyatli') return order.status === 'COMPLETED';
    if (activeTab === 'Bekor qilingan') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="page-container flex flex-col min-h-screen" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-6 flex-1 flex flex-col">
        <h1 className="text-2xl font-black text-white text-center mb-6">Buyurtmalar tarixi</h1>
        
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#94a3b8]">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Buyurtma ID yoki nomi..."
            className="w-full bg-[#16192b] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#5a67d8] transition-colors placeholder:text-[#94a3b8]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { triggerHaptic(); setActiveTab(tab); }}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeTab === tab 
                  ? 'bg-[#5a67d8] text-white border-transparent shadow-md active:scale-95' 
                  : 'bg-[#16192b] text-[#94a3b8] border-white/5 hover:bg-[#1d2138] hover:text-white active:scale-95'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1d2138] rounded-2xl p-4 shimmer h-24 border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center mt-10">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-black text-white mb-2">Xatolik!</h2>
            <p className="text-[#94a3b8] text-center text-sm mb-6 max-w-[280px]">{error}</p>
            <button 
              onClick={() => { triggerHaptic(); fetchData(); }}
              className="bg-[#5a67d8] text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform"
            >
              Qayta urinish
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center mt-10 opacity-80">
            <div className="w-20 h-20 bg-[#16192b] rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/5">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-[#94a3b8]">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-black text-white mb-3">Buyurtmalar yo'q</h2>
            <p className="text-[#94a3b8] text-center text-sm leading-relaxed max-w-[280px]">
              {activeTab === 'Hammasi' ? 'Siz hali hech narsa xarid qilmadingiz.' : `Ushbu bo'limda buyurtmalar topilmadi.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => { triggerHaptic(); navigate(`/orders/${order.id}`); }}
                className="bg-[#1d2138] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#16192b] active:scale-95 transition-all shadow-md animate-fade-in-up"
              >
                <div className="w-12 h-12 bg-[#16192b] rounded-xl flex items-center justify-center flex-shrink-0 text-[#facc15] shadow-inner">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate mb-1">Buyurtma #{order.orderNumber || order.id.slice(0, 8)}</p>
                  <p className="text-[#94a3b8] text-xs font-mono">{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                    order.status === 'COMPLETED' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                  }`}>
                    {order.status === 'COMPLETED' ? 'Bajarildi' :
                     order.status === 'CANCELLED' ? 'Bekor' : 'Kutilmoqda'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
