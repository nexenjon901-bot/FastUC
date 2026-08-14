import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import OrderCard from '../components/OrderCard';
import { useApp } from '../context/AppContext';

type Filter = 'ALL' | 'ACTIVE' | 'DONE';

const OrdersPage: React.FC = () => {
  const { orders, refreshOrders } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refreshOrders().finally(() => setLoading(false));
  }, [refreshOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'ALL') return true;
      if (filter === 'DONE') return o.status === 'COMPLETED';
      return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
    });
  }, [orders, filter]);

  return (
    <PageShell title="Buyurtmalarim" showBack>
      <div className="animate-fadeup">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(
            [
              ['ALL', 'Hammasi'],
              ['ACTIVE', 'Jarayonda'],
              ['DONE', 'Yakunlangan'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 12,
                border: `1.5px solid ${filter === key ? 'var(--primary)' : 'var(--border-subtle)'}`,
                background: filter === key ? 'var(--primary-soft)' : 'var(--card)',
                color: filter === key ? 'var(--text)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 84, borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Buyurtmalar hali yo'q</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Birinchi UC yoki Stars buyurtmangiz shu yerda ko'rinadi.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/catalog/uc')}>
              Sotib olish
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default OrdersPage;
