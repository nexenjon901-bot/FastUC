import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

const STEPS = [
  'escrow.step1',
  'escrow.step2',
  'escrow.step3',
  'escrow.step4',
];

const STATUS_TO_STEP: Record<string, number> = {
  ESCROW_HELD: 0,
  ADMIN_REVIEW: 1,
  CREDENTIALS_SENT: 2,
  BUYER_CONFIRMED: 3,
  COMPLETED: 3,
};

const EscrowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [credTimer, setCredTimer] = useState(60);
  const [showCreds, setShowCreds] = useState(false);

  const triggerHaptic = (style: 'light'|'medium'|'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const fetchOrder = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => {
        console.error(err);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Credentials 60-second timer
  useEffect(() => {
    if (!showCreds) return;
    if (credTimer <= 0) { setShowCreds(false); return; }
    const t = setInterval(() => setCredTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [showCreds, credTimer]);

  const handleConfirm = async () => {
    triggerHaptic('medium');
    setConfirming(true);
    try {
      const res = await api.post(`/orders/${id}/confirm`);
      setOrder(res.data);
      triggerHaptic('heavy');
    } catch (e) { 
      console.error(e);
      alert("Xatolik yuz berdi!");
    }
    finally { setConfirming(false); }
  };

  const handleDispute = async () => {
    triggerHaptic();
    const reason = prompt("Muammoni tushuntiring:");
    if (!reason) return;
    try {
      await api.post(`/orders/${id}/dispute`, { reason });
      fetchOrder();
    } catch (e) { console.error(e); }
  };

  if (isLoading) return (
    <div className="page-container flex justify-center items-center h-screen">
      <div className="w-10 h-10 border-4 border-[#5a67d8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="page-container flex flex-col items-center justify-center h-[80vh]">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-black text-white mb-2">Xatolik!</h2>
      <p className="text-[#94a3b8] text-center mb-8 px-4">{error}</p>
      <button 
        onClick={() => { triggerHaptic(); fetchOrder(); }}
        className="bg-[#5a67d8] text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform"
      >
        Qayta urinish
      </button>
    </div>
  );

  if (!order) return null;

  const step = STATUS_TO_STEP[order.status] ?? 0;

  return (
    <div className="page-container">
      <button onClick={() => { triggerHaptic(); navigate('/orders'); }} className="flex items-center gap-2 text-[#5a67d8] hover:text-[#7c3aed] mb-6 font-medium transition-colors">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Buyurtmalar</span>
      </button>

      <h1 className="text-2xl font-black text-white mb-2">{t('escrow.title', 'Xavfsiz bitim')}</h1>
      <code className="text-[#94a3b8] text-xs font-mono mb-8 block bg-[#16192b] px-3 py-1.5 rounded-lg w-fit border border-white/5">#{order.orderNumber || id}</code>

      {/* Escrow Steps */}
      <div className="bg-[#1d2138] rounded-3xl p-6 mb-6 shadow-lg border border-white/5">
        <div className="space-y-6 relative">
          {STEPS.map((stepKey, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div key={i} className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-md ${isDone ? 'bg-[#10b981]' : isActive ? 'bg-gradient-to-br from-[#5a67d8] to-[#7c3aed] animate-pulse' : 'bg-[#16192b]'}`}>
                  {isDone ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className={`text-sm font-black ${isActive ? 'text-white' : 'text-[#94a3b8]'}`}>{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isDone ? 'text-[#10b981]' : isActive ? 'text-white' : 'text-[#94a3b8]'}`}>
                    {t(stepKey, `Qadam ${i+1}`)}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-5 top-10 w-0.5 h-6 -ml-px ${isDone ? 'bg-[#10b981]' : 'bg-[#16192b]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credentials Section */}
      {order.status === 'CREDENTIALS_SENT' && (
        <div className="bg-[#1d2138] border border-[#f59e0b]/30 rounded-3xl p-6 mb-6 animate-fade-in-up shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="#f59e0b"/>
              </svg>
            </div>
            <h3 className="text-[#f59e0b] font-black text-lg">{t('escrow.credentialsTitle', 'Maxfiy ma\'lumotlar')}</h3>
          </div>
          {!showCreds ? (
            <button
              onClick={() => { triggerHaptic(); setShowCreds(true); setCredTimer(60); }}
              className="w-full bg-[#16192b] text-white font-bold py-3 rounded-xl hover:bg-[#2c3053] transition-colors active:scale-95 border border-white/5"
            >
              Ma'lumotlarni ko'rish
            </button>
          ) : (
            <>
              <p className="text-[#f59e0b] text-sm mb-4 font-bold flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {credTimer}s dan so'ng yopiladi
              </p>
              <div className="bg-[#16192b] rounded-2xl p-4 font-mono text-sm space-y-3 border border-[#f59e0b]/20 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8] font-semibold">Login:</span>
                  <span className="text-white font-bold select-all">{order.credential?.login || '***'}</span>
                </div>
                <div className="h-px w-full bg-white/5"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8] font-semibold">Parol:</span>
                  <span className="text-white font-bold select-all">{order.credential?.password || '***'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {order.status === 'CREDENTIALS_SENT' && (
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50"
          >
            {confirming ? 'Tasdiqlanmoqda...' : t('orders.confirm', 'Hammasi joyida, Tasdiqlayman')}
          </button>
          <button
            onClick={handleDispute}
            className="w-full bg-[#1d2138] text-red-500 font-bold py-4 rounded-2xl border border-red-500/20 active:scale-95 transition-all hover:bg-red-500/10"
          >
            {t('orders.dispute', 'Muammo bor (Shikoyat qilish)')}
          </button>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <div className="bg-[#1d2138] border border-[#10b981]/30 rounded-3xl text-center p-8 animate-fade-in-up shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-white font-black text-xl mb-2">Muvaffaqiyatli!</h2>
          <p className="text-[#10b981] font-bold text-sm">Xarid muvaffaqiyatli yakunlandi.</p>
        </div>
      )}
    </div>
  );
};

export default EscrowPage;
