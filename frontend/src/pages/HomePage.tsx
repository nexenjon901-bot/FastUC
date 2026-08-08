import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const triggerHaptic = (style: 'light'|'medium'|'heavy' = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    const fetchBalance = async (isSilent = false) => {
      try {
        const res = await api.get('/users/me');
        const newBalance = res.data.balance || 0;
        
        setBalance(prev => {
          if (isSilent && newBalance > prev) {
            triggerHaptic('heavy');
            if (window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(`Hisobingiz to'ldirildi!\nYangi balans: ${newBalance.toLocaleString()} UZS`);
            }
          }
          return newBalance;
        });
      } catch (e) {
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(() => fetchBalance(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTopupClick = () => {
    triggerHaptic();
    navigate('/balance');
  };

  const handleAccountsClick = () => {
    triggerHaptic();
    navigate('/accounts');
  };

  return (
    <div className="page-container" style={{ padding: 0, background: '#0f111a' }}>
      <Header balance={balance} />

      <div className="px-4 pb-24 mt-4">
        {/* Balance Card */}
        {isLoading ? (
          <div className="shimmer h-24 w-full rounded-2xl mb-6"></div>
        ) : (
          <div className="bg-gradient-to-r from-[#1d2138] to-[#16192b] rounded-3xl p-5 flex items-center justify-between mb-6 shadow-lg border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">Hisobingiz</span>
              <div className="flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#facc15]">
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-white font-black text-2xl">{balance.toLocaleString()} UZS</span>
              </div>
            </div>
            <button 
              onClick={handleTopupClick}
              className="bg-gradient-to-r from-[#facc15] to-[#eab308] hover:opacity-90 text-black font-black px-5 py-3 rounded-2xl text-sm transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              To'ldirish
            </button>
          </div>
        )}

        {/* PUBG MOBILE Banner */}
        {isLoading ? (
          <div className="shimmer h-52 w-full rounded-3xl mb-8"></div>
        ) : (
          <div 
            onClick={handleAccountsClick}
            className="relative w-full h-52 rounded-3xl overflow-hidden mb-8 group cursor-pointer shadow-2xl border border-white/5 active:scale-[0.98] transition-transform"
          >
            <img src="https://i.ytimg.com/vi/F2n1zB3OepA/maxresdefault.jpg" alt="PUBG" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 bg-gradient-to-br from-[#5a67d8]/10 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[#facc15] text-xs font-bold uppercase tracking-widest block mb-1">Akkauntlar</span>
                <h2 className="text-white font-black text-3xl tracking-wide uppercase drop-shadow-lg">PUBG MOBILE</h2>
              </div>
              <button className="bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black px-5 py-2.5 rounded-2xl text-sm shadow-lg hover:scale-105 transition-transform active:scale-95">
                Ko'rish →
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div 
            onClick={() => { triggerHaptic(); navigate('/accounts?tab=uc'); }}
            className="bg-[#1d2138] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 cursor-pointer hover:bg-[#16192b] active:scale-95 transition-all shadow-md"
          >
            <div className="w-10 h-10 bg-[#facc15]/10 rounded-xl flex items-center justify-center">
              <span className="text-[#facc15] font-black text-xs">UC</span>
            </div>
            <span className="text-white font-bold text-xs text-center">PUBG UC</span>
          </div>

          <div 
            onClick={() => { triggerHaptic(); navigate('/accounts?tab=stars'); }}
            className="bg-[#1d2138] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 cursor-pointer hover:bg-[#16192b] active:scale-95 transition-all shadow-md"
          >
            <div className="w-10 h-10 bg-[#5a67d8]/10 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#5a67d8]">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xs text-center">Stars</span>
          </div>

          <div 
            onClick={() => { triggerHaptic(); navigate('/orders'); }}
            className="bg-[#1d2138] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 cursor-pointer hover:bg-[#16192b] active:scale-95 transition-all shadow-md"
          >
            <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#10b981]">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xs text-center">Buyurtmalar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

