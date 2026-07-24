import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const tabs = [
  { key: 'Hammasi', statuses: null as string[] | null },
  {
    key: 'Kutilmoqda',
    statuses: ['ESCROW_HELD', 'ADMIN_REVIEW', 'CREDENTIALS_SENT', 'DISPUTED', 'PENDING_PAYMENT'],
  },
  { key: 'Muvaffaqiyatli', statuses: ['COMPLETED', 'BUYER_CONFIRMED'] },
  { key: 'Bekor', statuses: ['CANCELLED', 'REFUNDED'] },
];

const statusLabel: Record<string, string> = {
  ESCROW_HELD: 'Escrow',
  ADMIN_REVIEW: 'Admin tekshiruv',
  CREDENTIALS_SENT: 'Login yuborildi',
  COMPLETED: 'Yakunlangan',
  DISPUTED: 'Nizo',
  CANCELLED: 'Bekor',
  REFUNDED: 'Qaytarilgan',
  PENDING_PAYMENT: 'To‘lov kutilmoqda',
  BUYER_CONFIRMED: 'Tasdiqlangan',
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('Hammasi');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me').then((r) => setBalance(Number(r.data?.balance) || 0)).catch(() => {});
    api
      .get('/orders')
      .then((r) => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const tab = tabs.find((t) => t.key === activeTab)!;
  const filtered = orders.filter((o) => {
    if (tab.statuses && !tab.statuses.includes(o.status)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.account?.title?.toLowerCase().includes(q) ||
      o.account?.sku?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-4 pb-24">
        <h1 className="text-xl font-black text-white text-center mb-5">Buyurtmalar tarixi</h1>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buyurtma ID yoki akkaunt..."
            className="input-field pl-4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-800 border transition-all ${
                activeTab === t.key
                  ? 'bg-[#6366f1] text-white border-[#6366f1]'
                  : 'bg-[#1e2040] text-[#8b92b8] border-white/8'
              }`}
            >
              {t.key}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16">
            <h2 className="text-2xl font-black text-white mb-3">Buyurtmalar hali yo&apos;q</h2>
            <p className="text-[#8b92b8] text-center text-sm max-w-[260px] mb-6">
              Birinchi xaridingizdan keyin shu yerda ko&apos;rinadi.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Akkauntlar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="card-inner p-4 w-full text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">{order.account?.title || 'Akkaunt'}</p>
                    <code className="text-[#8b92b8] text-xs">{order.orderNumber}</code>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#6366f1]/20 text-[#a5b4fc] font-bold">
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>
                <p className="text-[#facc15] font-black text-sm">
                  {Number(order.amount).toLocaleString()} UZS
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
