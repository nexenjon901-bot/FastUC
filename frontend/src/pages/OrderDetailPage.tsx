import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatusTimeline from '../components/StatusTimeline';
import StatusBadge from '../components/StatusBadge';
import { apiService, formatDate, formatUzs, statusLabel, statusTone } from '../api/services';
import type { Order } from '../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiService
      .getOrder(id)
      .then((o) => setOrder(o))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Buyurtma tafsilotlari" showBack>
        <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell title="Buyurtma tafsilotlari" showBack>
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontWeight: 800, marginBottom: 12 }}>Buyurtma topilmadi</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/orders')}>
            Buyurtmalarga qaytish
          </button>
        </div>
      </PageShell>
    );
  }

  const rows = [
    ['Order ID', `#${order.id}`],
    ['Mahsulot', order.productLabel],
    [order.productType === 'UC' ? 'Player ID' : 'Username', order.targetId],
    ['Miqdor', String(order.amount)],
    ['Narx', formatUzs(order.price)],
    ['To\'lov', order.paymentMethod === 'BALANCE' ? 'Balans' : 'UZCARD / HUMO'],
    ['Yaratilgan', formatDate(order.createdAt)],
  ] as const;

  return (
    <PageShell title="Buyurtma tafsilotlari" showBack>
      <div className="animate-fadeup">
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 18, fontWeight: 800 }}>#{order.id}</p>
            <StatusBadge tone={statusTone(order.status)} label={statusLabel(order.status)} />
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {rows.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <StatusTimeline status={order.status} />
      </div>
    </PageShell>
  );
};

export default OrderDetailPage;
