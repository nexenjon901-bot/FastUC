import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
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
      }
    };

    fetchBalance();
    const interval = setInterval(() => fetchBalance(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMethodClick = (method: string) => {
    triggerHaptic();
    setSelectedMethod(method);
    setShowModal(true);
  };

  const handleConfirm = () => {
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount < 5000) {
      triggerHaptic('heavy');
      alert("Eng kam to'lov miqdori 5,000 UZS");
      return;
    }
    
    triggerHaptic('medium');
    const text = `Pul o'tkazmoqchi edim, karta raqam bering ${numAmount.toLocaleString('uz-UZ')} UZS`;
    const url = `https://t.me/FastUC_support?text=${encodeURIComponent(text)}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.location.href = url;
    }
    
    setShowModal(false);
    setAmount('');
  };

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-4 relative">
        {/* Back and Help */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { triggerHaptic(); navigate(-1); }} className="flex items-center gap-2 text-[#5a67d8] hover:text-[#7c3aed] font-medium transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ortga
          </button>
        </div>

        <h1 className="text-3xl font-black text-white mb-1">Hisobni to'ldirish</h1>
        <p className="text-[#94a3b8] mb-8 font-medium">To'lov usulini tanlang</p>

        <div className="flex flex-col gap-4">
          {/* UZCARD / HUMO */}
          <div 
            onClick={() => handleMethodClick('UZCARD/HUMO')} 
            className="bg-[#1d2138] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#16192b] transition-colors shadow-lg active:scale-95"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mr-4 p-1 overflow-hidden shadow-sm">
              <img src="https://humocard.uz/upload/iblock/cff/cff2f2604bf9c0b11568e6f1f4405c10.png" alt="Uzcard/Humo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-black text-lg">UZCARD / HUMO</h3>
              <p className="text-[#94a3b8] text-xs font-medium">Karta orqali</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#16192b] text-[#facc15] px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                so'm
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* SBP */}
          <div 
            onClick={() => handleMethodClick('SBP')} 
            className="bg-[#1d2138] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#16192b] transition-colors shadow-lg active:scale-95"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mr-4 p-2 overflow-hidden shadow-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/SBP_Logo.svg/1200px-SBP_Logo.svg.png" alt="SBP" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-black text-lg">СБП</h3>
              <p className="text-[#94a3b8] text-xs font-medium">Rossiya banklari</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#16192b] text-[#facc15] px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                рубль
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* BANKOMAT */}
          <div 
            onClick={() => handleMethodClick('BANKOMAT')} 
            className="bg-[#1d2138] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#16192b] transition-colors shadow-lg active:scale-95"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mr-4 p-1 overflow-hidden shadow-sm">
              <img src="https://cdn-icons-png.flaticon.com/512/2953/2953536.png" alt="Bankomat" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-black text-lg uppercase">Bankomat</h3>
              <p className="text-[#94a3b8] text-xs font-medium">Naqd pul</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#16192b] text-[#facc15] px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                so'm
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Modal for Amount Input */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-[#1d2138] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative">
              <button 
                onClick={() => { triggerHaptic(); setShowModal(false); setAmount(''); }}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              <h2 className="text-2xl font-black text-white mb-2">Summani kiriting</h2>
              <p className="text-[#94a3b8] text-sm mb-6">{selectedMethod} orqali to'lov (Min: 5,000 UZS)</p>
              
              <div className="relative mb-6">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-[#16192b] border border-[#5a67d8]/30 rounded-xl px-4 py-4 text-white text-xl font-bold focus:border-[#5a67d8] outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] font-bold">UZS</span>
              </div>
              
              <button 
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Tasdiqlash va Adminga yozish
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BalancePage;
