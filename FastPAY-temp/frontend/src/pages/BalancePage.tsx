import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const C = {
  bg: '#181927', card: '#252642', card2: '#1e1f3a',
  border: '#3C4172', accent: '#737DE4', text: '#F5F5F8', muted: '#858BB8',
};

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
    if (selectedMethod === 'BANKOMAT') return `Bankomat orqali pul o'tkazmoqchi edim, adres bering ${num.toLocaleString('uz-UZ')} UZS`;
    return `Pul o'tkazmoqchi edim, karta raqam bering ${num.toLocaleString('uz-UZ')} UZS`;
  };

  const handleConfirm = () => {
    if (submitLock.current) return;
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount < 5000) { triggerHaptic('heavy'); alert("Eng kam to'lov miqdori 5,000 UZS"); return; }
    submitLock.current = true;
    triggerHaptic('medium');
    const url = `https://t.me/FastUC_support?text=${encodeURIComponent(buildMessage())}`;
    if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
    setShowModal(false); setAmount('');
    setTimeout(() => { submitLock.current = false; }, 2000);
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
      id: 'BANKOMAT', label: 'Bankomat', sub: "Naqd pul orqali",
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
    <div className="page-container" style={{ background: C.bg }}>
      <Header balance={balance} />

      <div style={{ padding: '16px' }}>
        {/* Back */}
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
              onClick={() => handleMethodClick(m.id)}
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

        {/* Info */}
        <div style={{ marginTop: 20, background: 'rgba(115,125,228,0.08)', border: `1px solid rgba(115,125,228,0.2)`, borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 12 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={{ color: C.muted, fontSize: '0.75rem', lineHeight: 1.6 }}>
            To'lov bossgandan so'ng admin bilan bog'lanasiz. Pul o'tkazilgandan keyin balans 5 daqiqa ichida to'ldiriladi.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setAmount(''); } }}
        >
          <div
            className="animate-fade-in-up"
            style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '28px 20px 24px', width: '100%', maxWidth: 420, position: 'relative' }}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 4, margin: '0 auto 20px' }}/>

            {/* Close */}
            <button
              onClick={() => { triggerHaptic(); setShowModal(false); setAmount(''); }}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>

            {/* Method badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(115,125,228,0.12)', border: `1px solid ${C.border}`, borderRadius: 9999, padding: '4px 12px', marginBottom: 16 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                {selectedMethod === 'BANKOMAT'
                  ? <><rect x="3" y="4" width="18" height="16" rx="2" stroke={C.accent} strokeWidth="2"/><path d="M7 12h6" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/></>
                  : <><rect x="2" y="6" width="20" height="14" rx="3" stroke={C.accent} strokeWidth="2"/><path d="M2 10h20" stroke={C.accent} strokeWidth="2"/></>
                }
              </svg>
              <span style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700 }}>
                {selectedMethod === 'BANKOMAT' ? 'Bankomat' : 'UZCARD / HUMO'}
              </span>
            </div>

            <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.25rem', marginBottom: 6 }}>Summani kiriting</h2>
            <p style={{ color: C.muted, fontSize: '0.78rem', marginBottom: 20 }}>
              Minimal miqdor: <strong style={{ color: C.text }}>5,000 UZS</strong>
            </p>

            {/* Amount input */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="5000"
                autoFocus
                style={{
                  width: '100%',
                  background: C.card2,
                  border: `2px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '16px 56px 16px 18px',
                  color: C.text,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = C.accent)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
              <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none' }}>UZS</span>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {[10000, 50000, 100000, 200000].map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  style={{
                    background: amount === String(q) ? C.accent : C.card2,
                    border: `1.5px solid ${amount === String(q) ? C.accent : C.border}`,
                    borderRadius: 10, padding: '7px 4px',
                    color: amount === String(q) ? '#fff' : C.muted,
                    fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {q >= 1000 ? `${q/1000}K` : q}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              style={{ width: '100%', background: C.accent, color: '#fff', fontWeight: 800, padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.95rem', letterSpacing: '0.3px' }}
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
