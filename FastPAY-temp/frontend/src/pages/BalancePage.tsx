import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const C = {
  bg: '#111321',
  card: '#202440',
  card2: '#1a1d36',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
};

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Status tracking
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('IDLE');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

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
    
    // We only poll balance if not waiting for a specific request
    const interval = setInterval(() => {
      if (status !== 'PENDING') fetchBalance(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  // Polling logic when PENDING
  useEffect(() => {
    if (status !== 'PENDING' || !pendingRequestId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/payments/topup-requests/me');
        const req = res.data.find((r: any) => r.id === pendingRequestId);
        if (req) {
          if (req.status === 'APPROVED') {
            setStatus('APPROVED');
            triggerHaptic('heavy');
            // optionally refresh balance immediately
            api.get('/users/me').then(u => setBalance(Number(u.data.balance) || 0));
          } else if (req.status === 'REJECTED') {
            setStatus('REJECTED');
            triggerHaptic('heavy');
          }
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, pendingRequestId]);

  const handleMethodClick = (method: string) => {
    triggerHaptic();
    setSelectedMethod(method);
    setAmount('');
    setFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (submitLock.current) return;
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount < 5000) { 
      triggerHaptic('heavy'); 
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert("Eng kam to'lov miqdori 5,000 UZS");
      else alert("Eng kam to'lov miqdori 5,000 UZS");
      return; 
    }
    if (!file) {
      triggerHaptic('heavy'); 
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert("Iltimos, to'lov chekini yuklang");
      else alert("Iltimos, to'lov chekini yuklang");
      return;
    }

    submitLock.current = true;
    triggerHaptic('medium');
    
    try {
      const formData = new FormData();
      formData.append('amount', numAmount.toString());
      formData.append('method', selectedMethod);
      formData.append('receipt', file);

      const res = await api.post('/payments/topup-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowModal(false);
      setPendingRequestId(res.data.id);
      setStatus('PENDING');
    } catch (error: any) {
      const msg = error.response?.data?.message || "Xatolik yuz berdi";
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert(msg);
      else alert(msg);
    } finally {
      submitLock.current = false;
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

  if (status === 'PENDING') {
    return (
      <div className="page-container" style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin 1s linear infinite', marginBottom: 20 }} />
        <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.4rem', marginBottom: 10 }}>Tekshirilmoqda...</h2>
        <p style={{ color: C.muted, textAlign: 'center', fontSize: '0.9rem' }}>
          To'lovingiz adminlar tomonidan tekshirilmoqda. Iltimos kuting, bu bir necha daqiqa vaqt olishi mumkin.
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'APPROVED') {
    return (
      <div className="page-container" style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.4rem', marginBottom: 10 }}>Tasdiqlandi!</h2>
        <p style={{ color: C.muted, textAlign: 'center', fontSize: '0.9rem', marginBottom: 30 }}>
          Hisobingiz muvaffaqiyatli to'ldirildi. Yangi balans: <b>{balance.toLocaleString()} UZS</b>
        </p>
        <button onClick={() => { setStatus('IDLE'); setAmount(''); setFile(null); navigate(-1); }} style={{ background: C.accent, color: '#fff', fontWeight: 800, padding: '14px 30px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
          Davom etish
        </button>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="page-container" style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '2px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.4rem', marginBottom: 10 }}>Rad etildi</h2>
        <p style={{ color: C.muted, textAlign: 'center', fontSize: '0.9rem', marginBottom: 30 }}>
          To'lovingiz tasdiqlanmadi. Agar xatolik bo'lsa qullab quvvatlash xizmatiga murojaat qiling.
        </p>
        <button onClick={() => setStatus('IDLE')} style={{ background: C.accent, color: '#fff', fontWeight: 800, padding: '14px 30px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.95rem', marginBottom: 12 }}>
          Qayta urinish
        </button>
        <button onClick={() => window.open('https://t.me/FastUC_support', '_blank')} style={{ background: 'transparent', color: C.muted, fontWeight: 700, padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
          Supportga yozish
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ background: C.bg, overflowY: 'auto' }}>
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
            To'lov chekini yuklaganingizdan so'ng, u adminlar tomonidan tekshiriladi va tasdiqlanganda hisobingiz darhol to'ldiriladi.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setAmount(''); setFile(null); } }}
        >
          <div
            className="animate-fade-in-up"
            style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '28px 20px 24px', width: '100%', maxWidth: 420, position: 'relative', margin: 'auto' }}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 4, margin: '0 auto 20px' }}/>

            {/* Close */}
            <button
              onClick={() => { triggerHaptic(); setShowModal(false); setAmount(''); setFile(null); }}
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
            
            <p style={{ color: C.muted, fontSize: '0.8rem', marginBottom: 12 }}>
              Iltimos quyidagi raqamga to'lovni bajaring: <br />
              <b style={{ color: C.text, fontSize: '1.1rem' }}>
                {selectedMethod === 'BANKOMAT' ? '8600 0000 0000 0000' : '8600 0000 0000 0000'}
              </b>
            </p>

            <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.25rem', marginBottom: 6 }}>Summani kiriting</h2>
            <p style={{ color: C.muted, fontSize: '0.78rem', marginBottom: 12 }}>
              Minimal miqdor: <strong style={{ color: C.text }}>5,000 UZS</strong>
            </p>

            {/* Amount input */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="5000"
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
            
            <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.1rem', marginBottom: 6 }}>Chekni yuklang</h2>
            <div style={{ marginBottom: 20 }}>
              <label 
                htmlFor="receipt-upload" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: C.card2, 
                  border: `2px dashed ${file ? C.accent : C.border}`, 
                  borderRadius: 16, 
                  padding: '24px 16px', 
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  textAlign: 'center'
                }}
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 8, color: file ? C.accent : C.muted }}>
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {file ? (
                  <span style={{ color: C.accent, fontSize: '0.85rem', fontWeight: 700 }}>{file.name}</span>
                ) : (
                  <>
                    <span style={{ color: C.text, fontSize: '0.85rem', fontWeight: 700 }}>Rasm yuklash (skrinshot)</span>
                    <span style={{ color: C.muted, fontSize: '0.75rem', marginTop: 4 }}>JPEG, PNG (max 5MB)</span>
                  </>
                )}
              </label>
              <input 
                id="receipt-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </div>

            <button
              onClick={handleConfirm}
              style={{ width: '100%', background: C.accent, color: '#fff', fontWeight: 800, padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.95rem', letterSpacing: '0.3px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              Yuborish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancePage;

