import React, { useEffect, useState } from 'react';
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
  DISPUTED: 1,
  CREDENTIALS_SENT: 2,
  BUYER_CONFIRMED: 3,
  COMPLETED: 3,
  REFUNDED: 3,
};

const EscrowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [credTimer, setCredTimer] = useState(60);
  const [showCreds, setShowCreds] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  // Credentials 60-second timer
  useEffect(() => {
    if (!showCreds) return;
    if (credTimer <= 0) { setShowCreds(false); return; }
    const t = setInterval(() => setCredTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [showCreds, credTimer]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await api.post(`/orders/${id}/confirm`);
      setOrder(res.data);
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  };

  const handleDispute = async () => {
    const reason = prompt("Muammoni tushuntiring:");
    if (!reason) return;
    try {
      await api.post(`/orders/${id}/dispute`, { reason });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (e) { console.error(e); }
  };

  if (isLoading) return (
    <div className="page-container">
      <div className="shimmer h-48 w-full rounded-2xl" />
    </div>
  );

  if (!order) {
    return (
      <div className="page-container flex flex-col items-center justify-center h-screen">
        <h2 className="text-danger font-bold text-xl mb-2">Xatolik</h2>
        <p className="text-secondary text-sm mb-4">Buyurtma topilmadi yoki tarmoq xatosi.</p>
        <button onClick={() => navigate('/orders')} className="btn-secondary">Buyurtmalarga qaytish</button>
      </div>
    );
  }

  const step = STATUS_TO_STEP[order.status] ?? 0;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-secondary mb-4">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-sm font-medium">Buyurtmalar</span>
      </button>

      <h1 className="section-title">{t('escrow.title')}</h1>
      <code className="text-secondary text-xs font-mono mb-6 block">{order.orderNumber}</code>

      {/* Escrow Steps */}
      <div className="card mb-6">
        <div className="space-y-4">
          {STEPS.map((stepKey, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone ? 'bg-success' : isActive ? 'bg-accent-gradient animate-pulse-glow' : 'bg-bg-card2'}`}>
                  {isDone ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-secondary'}`}>{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isDone ? 'text-success' : isActive ? 'text-primary' : 'text-secondary'}`}>
                    {t(stepKey)}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(theme(spacing.4)+1rem)] mt-8 w-0.5 h-4 bg-white/10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credentials Section */}
      {order.status === 'CREDENTIALS_SENT' && (
        <div className="card border border-warning/30 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="#f59e0b"/>
            </svg>
            <h3 className="text-warning font-bold text-sm">{t('escrow.credentialsTitle')}</h3>
          </div>
          {!showCreds ? (
            <button
              id="show-creds-btn"
              onClick={() => { setShowCreds(true); setCredTimer(60); }}
              className="btn-secondary text-sm"
            >
              Ma'lumotlarni ko'rish
            </button>
          ) : (
            <>
              <p className="text-warning text-xs mb-3 font-semibold">⏳ {credTimer}s {t('escrow.credentialsWarning')}</p>
              <div className="bg-bg rounded-xl p-3 font-mono text-sm space-y-2 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-secondary text-xs">Login:</span>
                  <span className="text-primary">{order.credential?.login || '***'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary text-xs">Parol:</span>
                  <span className="text-primary">{order.credential?.password || '***'}</span>
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
            id="confirm-order-btn"
            onClick={handleConfirm}
            disabled={confirming}
            className="btn-primary"
          >
            {confirming ? 'Tasdiqlanmoqda...' : t('orders.confirm')}
          </button>
          <button
            id="dispute-btn"
            onClick={handleDispute}
            className="btn-danger"
          >
            {t('orders.dispute')}
          </button>
        </div>
      )}

      {order.status === 'DISPUTED' && (
        <div className="card border border-warning/30 text-center py-6 mb-4">
          <p className="text-warning font-bold">Nizo ochilgan — admin ko&apos;rib chiqmoqda</p>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <div className="card border border-success/30 text-center py-6 animate-fade-in-up">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-success font-bold">Xarid muvaffaqiyatli yakunlandi!</p>
        </div>
      )}
    </div>
  );
};

export default EscrowPage;
