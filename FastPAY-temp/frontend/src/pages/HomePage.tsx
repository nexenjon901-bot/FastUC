import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const C = {
  bg: '#181927',
  card: '#252642',
  border: '#3C4172',
  accent: '#737DE4',
  text: '#F5F5F8',
  muted: '#858BB8',
};

const categories = [
  {
    id: 'accounts',
    path: '/accounts',
    title: 'PUBG AKKAUNTLAR',
    sub: 'Tayyor akkauntlar sotiladi',
    color: '#737DE4',
    bg: 'rgba(115,125,228,0.1)',
    icon: (
      <svg width="38" height="38" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="#737DE4" strokeWidth="2"/>
        <circle cx="8" cy="12" r="2.5" fill="#737DE4" fillOpacity="0.4" stroke="#737DE4" strokeWidth="1.5"/>
        <path d="M14 9h4M14 12h3M14 15h2" stroke="#737DE4" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    bannerImg: 'https://wallpaperaccess.com/full/1636859.jpg',
    isBig: true,
  },
  {
    id: 'uc',
    path: '/accounts?tab=uc',
    title: 'PUBG UC',
    sub: 'Tez va xavfsiz UC sotib oling',
    color: '#737DE4',
    bg: 'rgba(115,125,228,0.08)',
    icon: (
      <svg width="38" height="38" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="#737DE4" strokeWidth="2"/>
        <text x="12" y="16.5" textAnchor="middle" fill="#737DE4" fontSize="8" fontWeight="800" fontFamily="Outfit,sans-serif">UC</text>
      </svg>
    ),
  },
  {
    id: 'stars',
    path: '/accounts?tab=stars',
    title: 'TELEGRAM STARS',
    sub: 'Telegram Stars tez yetkazamiz',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.08)',
    icon: (
      <svg width="38" height="38" fill="none" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="#facc15" strokeWidth="2" fill="#facc15" fillOpacity="0.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
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

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <Header balance={balance} />

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Big Banner Card (PUBG Akkauntlar) ── */}
        {isLoading ? (
          <div className="shimmer rounded-3xl mb-4" style={{ height: 180 }} />
        ) : (
          <div
            onClick={() => { triggerHaptic(); navigate('/accounts'); }}
            className="relative rounded-3xl overflow-hidden mb-4 cursor-pointer active:scale-[0.98] transition-transform shadow-xl"
            style={{ height: 180, border: `1.5px solid ${C.border}` }}
          >
            <img
              src="https://wallpaperaccess.com/full/1636859.jpg"
              alt="PUBG"
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,25,0.95) 0%, rgba(10,10,25,0.3) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: C.muted, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 4 }}>
                  Akkauntlar
                </span>
                <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                  PUBG MOBILE
                </h2>
              </div>
              <div
                style={{ background: C.accent, borderRadius: 14, padding: '8px 16px', color: '#fff', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Ko'rish
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
        )}

        {/* ── PUBG UC + Stars Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {categories.slice(1).map(cat => (
            isLoading ? (
              <div key={cat.id} className="shimmer rounded-3xl" style={{ height: 160 }} />
            ) : (
              <div
                key={cat.id}
                onClick={() => { triggerHaptic(); navigate(cat.path); }}
                className="cursor-pointer active:scale-95 transition-all"
                style={{
                  background: C.card,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 22,
                  padding: '18px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 160,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                {/* Icon bg */}
                <div style={{ background: cat.bg, borderRadius: 16, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  {cat.icon}
                </div>

                {/* Text */}
                <div>
                  <h3 style={{ color: C.text, fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4, lineHeight: 1.2 }}>
                    {cat.title}
                  </h3>
                  <p style={{ color: C.muted, fontSize: '0.7rem', fontWeight: 500, lineHeight: 1.4 }}>{cat.sub}</p>
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <div style={{ color: C.accent }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
