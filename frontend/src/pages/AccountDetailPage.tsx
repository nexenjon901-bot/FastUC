import React, { useEffect, useState } from 'react';
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

  if (!account) return null;

  const formatPrice = (p: string) => Number(p).toLocaleString('uz-UZ') + ' UZS';

  const statItems = [
    { label: t('account.rank'), value: account.rank },
    { label: t('account.level'), value: `${account.level}` },
    { label: t('account.skins'), value: `${account.skinsCount}` },
    { label: t('account.uc'), value: `${account.ucBalance} UC` },
  ];

  return (
    <div className="page-container">
      {/* Back Button */}
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary mb-4 hover:text-primary transition-colors"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-medium">Orqaga</span>
      </button>

      {/* Image Carousel */}
      {account.images.length > 0 ? (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-bg-card2 mb-4">
          <img
            src={account.images[imgIndex]}
            alt={account.title}
            className="w-full h-full object-cover"
          />
          {account.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {account.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imgIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 rounded-2xl bg-bg-card2 flex items-center justify-center mb-4 opacity-30">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}

      {/* Title & SKU */}
      <div className="flex items-start justify-between mb-3 animate-fade-in-up">
        <div>
          <h1 className="text-xl font-extrabold text-primary mb-1">{account.title}</h1>
          <code className="text-secondary text-xs font-mono">{account.sku}</code>
        </div>
        <div className="text-right">
          <p className="text-gradient text-xl font-extrabold">{formatPrice(account.price)}</p>
          <span className="badge-success text-[11px]">{t('account.escrowProtected')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {statItems.map(item => (
          <div key={item.label} className="card py-3 text-center">
            <p className="text-secondary text-xs mb-1">{item.label}</p>
            <p className="text-primary font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {account.description && (
        <div className="card mb-4">
          <h2 className="text-sm font-bold text-secondary mb-2">{t('account.description')}</h2>
          <p className="text-primary text-sm leading-relaxed">{account.description}</p>
        </div>
      )}

      {/* Escrow Info */}
      <div className="card mb-4 border border-accent-indigo/20">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-accent-indigo/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="#6366f1"/>
            </svg>
          </div>
          <div>
            <p className="text-primary text-sm font-semibold">{t('account.escrowProtected')}</p>
            <p className="text-secondary text-xs mt-0.5">Login va parol faqat siz tasdiqlagan va mamnun bo'lganingizdan keyin beriladi.</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {purchaseError && (
        <div className="card border border-danger/30 mb-4">
          <p className="text-danger text-sm text-center">{purchaseError}</p>
        </div>
      )}

      {/* Buy Button */}
      <button
        id="buy-btn"
        onClick={handleBuy}
        disabled={isPurchasing || account.status !== 'AVAILABLE'}
        className="btn-primary animate-pulse-glow"
      >
        {isPurchasing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Kuting...
          </span>
        ) : t('account.buyNow')}
      </button>
    </div>
  );
};

export default AccountDetailPage;
