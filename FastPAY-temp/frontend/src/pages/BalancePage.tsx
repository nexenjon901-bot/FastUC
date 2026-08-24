import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const C = { bg: '#111321', card: '#202440', card2: '#1a1d36', border: '#3C4378', accent: '#6F78F0', text: '#F5F5FF', muted: '#9298C2' };

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get('/users/me');
        setBalance(Number(res.data.balance) || 0);
      } catch (e) {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMethodClick = (methodLabel: string) => {
    triggerHaptic('heavy');
    const msg = `Salom! Hisobni to'ldirmoqchiman.%0AUsul: ${methodLabel}`;
    const adminUrl = `https://t.me/FastUC_admin?text=${msg}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/FastUC_admin?text=${msg}`);
    } else {
      window.open(adminUrl, '_blank');
    }
  };

  const PAYMENT_METHODS = [
    {
      id: 'UZCARD_HUMO', label: 'UZCARD / HUMO', sub: 'Karta orqali',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="14" rx="3" stroke={C.accent} strokeWidth="2"/>
          <path d="M2 10h20" stroke={C.accent} strokeWidth="2"/>
          <rect x="5" y="13" width="5" height="2" rx="1" fill={C.accent}/>
        </svg>
      ),
    },
    {
      id: 'BANKOMAT', label: 'Bankomat', sub: 'Naqd pul orqali',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={C.accent} strokeWidth="2"/>
          <path d="M7 8h10M7 12h6M7 16h4" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="17" cy="15" r="2" stroke={C.accent} strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ background: C.bg, overflowY: 'auto' }}>
      <Header balance={balance} />

      <div style={{ padding: '16px' }}>
        <button
          onClick={() => { triggerHaptic(); navigate(-1); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0, fontSize: '0.88rem' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Ortga
        </button>

        <h1 style={{ color: C.text, fontWeight: 900, fontSize: '1.5rem', marginBottom: 4 }}>Hisobni to'ldirish</h1>
        <p style={{ color: C.muted, marginBottom: 24, fontSize: '0.88rem' }}>To'lov usulini tanlang</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.id}
              onClick={() => handleMethodClick(m.label)}
              style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ width: 52, height: 52, background: C.card2, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0, border: `1px solid ${C.border}` }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: C.text, fontWeight: 800, fontSize: '0.95rem', marginBottom: 2 }}>{m.label}</h3>
                <p style={{ color: C.muted, fontSize: '0.75rem' }}>{m.sub}</p>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, background: 'rgba(115,125,228,0.08)', border: `1px solid rgba(115,125,228,0.2)`, borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 12 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={{ color: C.muted, fontSize: '0.75rem', lineHeight: 1.6 }}>
            To'lov usulini bosishingiz bilan avtomatik ravishda admin profiliga yo'naltirilasiz. To'lovni o'sha yerda amalga oshirasiz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalancePage;
