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
    <div className="page-container relative pb-24" style={{ background: '#181927' }}>
      {/* Back Button */}
      <button
        onClick={() => { triggerHaptic(); navigate(-1); }}
        style={{ color: '#737DE4', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: '16px', fontSize: '0.88rem' }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-bold">Orqaga</span>
      </button>

      {/* Image Carousel */}
      {account.images.length > 0 ? (
        <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-6" style={{ background: '#1e1f3a', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
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
        <div className="w-full h-48 rounded-3xl flex items-center justify-center mb-6" style={{ background: '#1e1f3a', border: '1.5px solid #3C4172', margin: '0 16px 24px' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ opacity: 0.2, color: 'white' }}>
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}

      {/* Title & SKU */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, padding: '0 16px' }} className="animate-fade-in-up">
        <div style={{ flex: 1, marginRight: 12 }}>
          <h1 style={{ color: '#F5F5F8', fontWeight: 900, fontSize: '1.3rem', marginBottom: 6, lineHeight: 1.2 }}>{account.title}</h1>
          <code style={{ color: '#858BB8', fontSize: '0.72rem', background: '#1e1f3a', padding: '3px 8px', borderRadius: 8, border: '1px solid #3C4172', fontFamily: 'monospace' }}>{account.sku}</code>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: '#737DE4', fontSize: '1.3rem', fontWeight: 900 }}>{formatPrice(account.price)}</p>
          <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, marginTop: 4, display: 'inline-block' }}>
            {t('account.escrowProtected', 'Xavfsiz bitim')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, padding: '0 16px' }}>
        {statItems.map(item => (
          <div key={item.label} style={{ background: '#252642', border: '1.5px solid #3C4172', borderRadius: 20, padding: '14px 16px' }}>
            <p style={{ color: '#858BB8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{item.label}</p>
            <p style={{ color: '#F5F5F8', fontWeight: 900, fontSize: '1.05rem' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {account.description && (
        <div style={{ background: '#252642', border: '1.5px solid #3C4172', borderRadius: 22, padding: '16px 18px', marginBottom: 16, marginLeft: 16, marginRight: 16 }}>
          <h2 style={{ color: '#F5F5F8', fontWeight: 800, fontSize: '0.88rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: '#737DE4' }}>
              <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Tavsif
          </h2>
          <p style={{ color: '#858BB8', fontSize: '0.82rem', lineHeight: 1.6 }}>{account.description}</p>
        </div>
      )}

      {/* Escrow Info */}
      <div style={{ background: 'rgba(115,125,228,0.08)', border: '1px solid rgba(115,125,228,0.2)', borderRadius: 22, padding: '16px 18px', marginBottom: 16, marginLeft: 16, marginRight: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(115,125,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#737DE4' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#F5F5F8', fontWeight: 800, fontSize: '0.88rem', marginBottom: 4 }}>{t('account.escrowProtected', 'Xavfsiz bitim kafolati')}</p>
            <p style={{ color: '#858BB8', fontSize: '0.75rem', lineHeight: 1.6 }}>
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
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 20px', background: 'linear-gradient(to top, #181927 0%, rgba(24,25,39,0.95) 60%, transparent 100%)', zIndex: 40 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button
            onClick={handleBuy}
            disabled={isPurchasing || account.status !== 'AVAILABLE'}
            style={{ width: '100%', background: '#737DE4', color: '#fff', fontWeight: 800, padding: '16px', borderRadius: 16, border: 'none', cursor: isPurchasing || account.status !== 'AVAILABLE' ? 'not-allowed' : 'pointer', opacity: isPurchasing || account.status !== 'AVAILABLE' ? 0.5 : 1, fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(115,125,228,0.3)' }}
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
