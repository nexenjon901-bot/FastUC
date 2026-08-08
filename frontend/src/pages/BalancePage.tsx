import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const submitLock = useRef(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    const fetchBalance = async (isSilent = false) => {
      try {
        const res = await api.get('/users/me');
        const newBalance = Number(res.data.balance) || 0;
        setBalance(prev => {
          if (isSilent && newBalance > prev) {
            triggerHaptic('heavy');
            if (window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(`Hisobingiz to'ldirildi!\nYangi balans: ${newBalance.toLocaleString()} UZS`);
            }
          }
          return newBalance;
        });
      } catch (e) {}
    };

    fetchBalance();
    const interval = setInterval(() => fetchBalance(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMethodClick = (method: string) => {
    triggerHaptic();
    setSelectedMethod(method);
    setAmount('');
    setShowModal(true);
  };

  const buildMessage = () => {
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (selectedMethod === 'BANKOMAT') {
      return `Bankomat orqali pul o'tkazmoqchi edim, adres bering ${num.toLocaleString('uz-UZ')} UZS`;
    }
    return `Pul o'tkazmoqchi edim, karta raqam bering ${num.toLocaleString('uz-UZ')} UZS`;
  };

  const handleConfirm = () => {
    if (submitLock.current) return;
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount < 5000) {
      triggerHaptic('heavy');
      alert("Eng kam to'lov miqdori 5,000 UZS");
      return;
    }
    submitLock.current = true;
    triggerHaptic('medium');
    const text = buildMessage();
    const url = `https://t.me/FastUC_support?text=${encodeURIComponent(text)}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
    setShowModal(false);
    setAmount('');
    setTimeout(() => { submitLock.current = false; }, 2000);
  };

  const PAYMENT_METHODS = [
    {
      id: 'UZCARD_HUMO',
      label: 'UZCARD / HUMO',
      sub: 'Karta orqali',
      currency: 'so\'m',
      color: '#facc15',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="14" rx="3" stroke="#facc15" strokeWidth="2"/>
          <path d="M2 10h20" stroke="#facc15" strokeWidth="2"/>
          <rect x="5" y="13" width="5" height="2" rx="1" fill="#facc15"/>
        </svg>
      ),
    },
    {
      id: 'BANKOMAT',
      label: 'Bankomat',
      sub: 'Naqd pul',
      currency: 'so\'m',
      color: '#10b981',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="#10b981" strokeWidth="2"/>
          <path d="M7 8h10M7 12h6M7 16h4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="17" cy="15" r="2" stroke="#10b981" strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-4">
        {/* Back */}
        <button
          onClick={() => { triggerHaptic(); navigate(-1); }}
          className="flex items-center gap-2 text-[#5a67d8] font-medium mb-6 transition-colors active:opacity-70"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ortga
        </button>

        <h1 className="text-3xl font-black text-white mb-1">Hisobni to'ldirish</h1>
        <p className="text-[#94a3b8] mb-8 font-medium">To'lov usulini tanlang</p>

        <div className="flex flex-col gap-4">
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.id}
              onClick={() => handleMethodClick(m.id)}
              className="bg-[#1d2138] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#16192b] transition-all shadow-lg active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-[#16192b] rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                {m.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-base">{m.label}</h3>
                <p className="text-[#94a3b8] text-xs font-medium">{m.sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#16192b] px-3 py-1 rounded-full text-xs font-bold border border-white/5" style={{ color: m.color }}>
                  {m.currency}
                </span>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-6 bg-[#5a67d8]/10 border border-[#5a67d8]/20 rounded-2xl p-4 flex items-start gap-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#5a67d8] flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-[#94a3b8] text-xs leading-relaxed">
            To'lov bossgandan so'ng admin bilan bog'lanasiz. Admin sizga karta raqam beradi, pul o'tkazilgandan keyin balans 5 daqiqa ichida to'ldiriladi.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in-up">
          <div className="bg-[#1d2138] w-full max-w-md rounded-t-3xl p-6 border border-white/10 shadow-2xl">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5"/>
            <button
              onClick={() => { triggerHaptic(); setShowModal(false); setAmount(''); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h2 className="text-2xl font-black text-white mb-1">Summani kiriting</h2>
            <p className="text-[#94a3b8] text-sm mb-5">
              {selectedMethod === 'BANKOMAT' ? 'Bankomat' : 'Karta'} orqali to'lov · Min: 5,000 UZS
            </p>

            <div className="relative mb-5">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="5000"
                className="w-full bg-[#16192b] border border-[#5a67d8]/30 rounded-xl px-4 py-4 text-white text-xl font-bold focus:border-[#5a67d8] outline-none transition-colors"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] font-bold">UZS</span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Adminga yozish →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancePage;
