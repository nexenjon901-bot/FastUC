import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

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
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    api.get(`/accounts/${id}`)
      .then(res => setAccount(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!account) return;
    setIsPurchasing(true);
    setPurchaseError('');
    try {
      const res = await api.post('/orders', { accountId: account.id });
      navigate(`/orders/${res.data.id}`);
    } catch (err: any) {
      setPurchaseError(err.response?.data?.message || 'Xarid qilishda xatolik yuz berdi');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="shimmer h-64 w-full rounded-2xl mb-4" />
        <div className="shimmer h-8 w-1/2 rounded-xl mb-3" />
        <div className="shimmer h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="page-container flex flex-col items-center justify-center h-screen">
        <h2 className="text-danger font-bold text-xl mb-2">Xatolik</h2>
        <p className="text-secondary text-sm mb-4">Akkaunt topilmadi yoki tarmoq xatosi.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Orqaga qaytish</button>
      </div>
    );
  }

  const formatPrice = (p: string) => Number(p).toLocaleString('uz-UZ') + ' UZS';

  const statItems = [
    { label: t('account.rank'), value: account.rank },
    { label: t('account.level'), value: `${account.level}` },
    { label: t('account.skins'), value: `${account.skinsCount}` },
    { label: t('account.uc'), value: `${account.ucBalance} UC` },
  ];

  const hasEnoughBalance = user && Number(user.balance) >= Number(account.price);

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      {/* Back Button */}
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary mb-4 hover:text-white transition-colors ml-4 mt-4"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-medium">Orqaga</span>
      </button>

      <div className="px-4">
        {/* Image Carousel */}
        {account.images.length > 0 ? (
          <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-bg-card2 mb-4">
            <img
              src={account.images[imgIndex]}
              alt={account.title}
              className="w-full h-full object-cover"
            />
            {account.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 flex-wrap px-4">
                {account.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIndex ? 'bg-[#facc15] w-4' : 'bg-white/40 w-1.5'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 rounded-2xl bg-[#1e2040] flex items-center justify-center mb-4 opacity-30">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-white">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        )}

        {/* Title & SKU */}
        <div className="flex items-start justify-between mb-3 animate-fade-in-up">
          <div className="flex-1 pr-2">
            <h1 className="text-lg font-black text-white mb-1 leading-tight">{account.title}</h1>
            <code className="text-[#8b92b8] text-xs font-mono">{account.sku}</code>
          </div>
          <div className="text-right">
            <p className="text-[#facc15] text-xl font-black">{formatPrice(account.price)}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {statItems.map(item => (
            <div key={item.label} className="bg-[#1e2040] rounded-xl py-3 px-1 text-center border border-white/5">
              <p className="text-[#8b92b8] text-[9px] font-bold uppercase mb-1">{item.label}</p>
              <p className="text-white font-black text-[13px]">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {account.description && (
          <div className="card p-4 mb-4">
            <h2 className="text-xs font-black uppercase text-[#8b92b8] mb-2">{t('account.description')}</h2>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{account.description}</p>
          </div>
        )}

        {/* Escrow Info */}
        <div className="card p-4 mb-4 border border-[#6366f1]/20 bg-[#6366f1]/5">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#6366f1]/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="#6366f1"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold">Himoyalangan xarid</p>
              <p className="text-[#8b92b8] text-xs mt-1">Admin to'lovni tasdiqlagach, akkaunt ma'lumotlarini 5 daqiqa ichida sizga yuboradi.</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {purchaseError && (
          <div className="card p-3 border border-red-500/30 bg-red-500/10 mb-4 text-center">
            <p className="text-red-400 text-sm font-medium">{purchaseError}</p>
          </div>
        )}

        {/* Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#12132b] border-t border-white/10 z-50">
          {!hasEnoughBalance ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3 flex flex-col justify-center">
                <span className="text-red-400 text-xs font-bold uppercase flex items-center justify-center gap-1">
                  <AlertCircle size={14}/> Balans yetarli emas
                </span>
                <span className="text-white font-medium text-xs mt-0.5">Kamida {formatPrice((Number(account.price) - Number(user?.balance || 0)).toString())} yetmayapti</span>
              </div>
              <button
                onClick={() => navigate('/balance')}
                className="btn-yellow px-6 flex-shrink-0"
              >
                + To'ldirish
              </button>
            </div>
          ) : (
            <button
              id="buy-btn"
              onClick={handleBuy}
              disabled={isPurchasing || account.status !== 'AVAILABLE'}
              className="btn-primary animate-pulse-glow"
            >
              {isPurchasing ? 'Kuting...' : t('account.buyNow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;
