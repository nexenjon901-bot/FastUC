import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

interface Account {
  id: string;
  sku: string;
  title: string;
  rank: string;
  level: number;
  skinsCount: number;
  ucBalance: number;
  price: string;
  description: string;
  images: string[];
  status: string;
}

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const triggerHaptic = (style: 'light'|'medium'|'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const fetchAccount = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api.get(`/accounts/${id}`)
      .then(res => setAccount(res.data))
      .catch(err => {
        console.error(err);
        setError("Akkaunt ma'lumotlarini yuklashda xatolik yuz berdi.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleBuy = async () => {
    if (!account) return;
    triggerHaptic('medium');
    setIsPurchasing(true);
    setPurchaseError('');
    try {
      const res = await api.post('/orders', { accountId: account.id });
      triggerHaptic('heavy');
      navigate(`/orders/${res.data.id}`);
    } catch (err: any) {
      triggerHaptic('heavy');
      setPurchaseError(err.response?.data?.message || 'Xarid qilishda xatolik yuz berdi');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-[#5a67d8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex flex-col items-center justify-center h-[80vh]">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-black text-white mb-2">Xatolik!</h2>
        <p className="text-[#94a3b8] text-center mb-8 px-4">{error}</p>
        <button 
          onClick={() => { triggerHaptic(); fetchAccount(); }}
          className="bg-[#5a67d8] text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!account) return null;

  const formatPrice = (p: string) => Number(p).toLocaleString('uz-UZ') + ' UZS';

  const statItems = [
    { label: t('account.rank', 'Daraja'), value: account.rank },
    { label: t('account.level', 'Level'), value: `${account.level}` },
    { label: t('account.skins', 'Skins'), value: `${account.skinsCount}` },
    { label: t('account.uc', 'UC Balans'), value: `${account.ucBalance} UC` },
  ];

  return (
    <div className="page-container relative pb-24">
      {/* Back Button */}
      <button
        onClick={() => { triggerHaptic(); navigate(-1); }}
        className="flex items-center gap-2 text-[#5a67d8] hover:text-[#7c3aed] mb-4 font-medium transition-colors"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-bold">Orqaga</span>
      </button>

      {/* Image Carousel */}
      {account.images.length > 0 ? (
        <div className="relative w-full h-64 rounded-3xl overflow-hidden bg-[#16192b] mb-6 shadow-lg">
          <img
            src={account.images[imgIndex]}
            alt={account.title}
            className="w-full h-full object-cover"
          />
          {account.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {account.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { triggerHaptic(); setImgIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === imgIndex ? 'bg-[#facc15] w-6' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 rounded-3xl bg-[#16192b] flex items-center justify-center mb-6 opacity-50 border border-white/5 shadow-inner">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-white/20">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}

      {/* Title & SKU */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 leading-tight">{account.title}</h1>
          <code className="text-[#94a3b8] text-xs font-mono bg-[#16192b] px-2 py-1 rounded-md border border-white/5">{account.sku}</code>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[#facc15] text-2xl font-black drop-shadow-sm">{formatPrice(account.price)}</p>
          <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
            {t('account.escrowProtected', 'Xavfsiz bitim')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statItems.map(item => (
          <div key={item.label} className="bg-[#1d2138] rounded-2xl p-4 flex flex-col justify-center border border-white/5 shadow-md">
            <p className="text-[#94a3b8] text-[11px] font-bold tracking-wider mb-1 uppercase">{item.label}</p>
            <p className="text-white font-black text-lg">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {account.description && (
        <div className="bg-[#1d2138] rounded-3xl p-5 mb-6 border border-white/5 shadow-md">
          <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#5a67d8]">
              <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tavsif
          </h2>
          <p className="text-[#94a3b8] text-sm leading-relaxed">{account.description}</p>
        </div>
      )}

      {/* Escrow Info */}
      <div className="bg-gradient-to-br from-[#5a67d8]/10 to-transparent border border-[#5a67d8]/20 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#5a67d8]/20 flex items-center justify-center flex-shrink-0 text-[#5a67d8]">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-black mb-1">{t('account.escrowProtected', 'Xavfsiz bitim kafolati')}</p>
            <p className="text-[#94a3b8] text-xs leading-relaxed">
              Login va parol sizga xariddan keyin taqdim etiladi. Pullar siz to'liq rozi bo'lguningizcha tizimda saqlanadi.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {purchaseError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 text-center">
          <p className="text-red-500 font-bold text-sm">{purchaseError}</p>
        </div>
      )}

      {/* Fixed Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/90 to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleBuy}
            disabled={isPurchasing || account.status !== 'AVAILABLE'}
            className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(250,204,21,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isPurchasing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin text-black" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Kuting...
              </span>
            ) : account.status === 'AVAILABLE' ? 'Xarid qilish' : 'Sotib olingan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;
