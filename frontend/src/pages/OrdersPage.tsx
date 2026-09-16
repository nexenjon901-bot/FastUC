import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const C = {
  bg: '#111321',
  card: '#202440',
  card2: '#1a1d36',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const fetchData = useCallback(() => {
    setIsLoading(true); setError(null);
    Promise.all([api.get('/users/me'), api.get('/orders')])
      .then(([userRes, ordersRes]) => {
        setBalance(userRes.data.balance || 0);
        setOrders(ordersRes.data || []);
      })
      .catch(() => setError("Ma'lumotlarni yuklashda xatolik yuz berdi."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusInfo = (status: string) => {
    if (status === 'COMPLETED') return { label: 'Bajarildi', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' };
    if (status === 'CANCELLED') return { label: 'Bekor', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)' };
    return { label: 'Kutilmoqda', color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)' };
  };

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <Header balance={balance} />

      <div style={{ padding: '16px' }}>
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: '1.3rem', marginBottom: 20 }}>Buyurtmalar tarixi</h1>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 76, borderRadius: 18 }}/>)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(244,63,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p style={{ color: C.text, fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>Xatolik!</p>
            <p style={{ color: C.muted, fontSize: '0.82rem', marginBottom: 20 }}>{error}</p>
            <button onClick={() => { triggerHaptic(); fetchData(); }} style={{ background: C.accent, color: '#fff', fontWeight: 700, padding: '12px 28px', borderRadius: 14, border: 'none', cursor: 'pointer' }}>Qayta urinish</button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 80, height: 80, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke={C.muted} strokeWidth="2"/><path d="M9 12h6M9 16h4" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p style={{ color: C.text, fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>Buyurtmalar yo'q</p>
            <p style={{ color: C.muted, fontSize: '0.82rem' }}>Siz hali hech narsa xarid qilmadingiz.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => {
              const st = statusInfo(order.status);
              return (
                <div
                  key={order.id}
                  onClick={() => { triggerHaptic(); navigate(`/orders/${order.id}`); }}
                  className="animate-fade-in-up"
                  style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: '14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <div style={{ width: 46, height: 46, background: C.card2, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${C.border}` }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: '0.85rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Buyurtma #{order.orderNumber || order.id.slice(0, 8)}
                    </p>
                    <p style={{ color: C.muted, fontSize: '0.72rem' }}>{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 8, padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
