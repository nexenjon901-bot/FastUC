import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'badge-warning',
  ESCROW_HELD: 'badge-info',
  ADMIN_REVIEW: 'badge-info',
  CREDENTIALS_SENT: 'badge-warning',
  BUYER_CONFIRMED: 'badge-success',
  COMPLETED: 'badge-success',
  DISPUTED: 'badge-danger',
  CANCELLED: 'badge-secondary',
  REFUNDED: 'badge-secondary',
};

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="section-title">{t('orders.title')}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-secondary py-16">
          <svg className="mx-auto mb-3 opacity-30" width="48" height="48" fill="none" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p>{t('orders.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <button
              key={order.id}
              id={`order-${order.id}`}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="card w-full text-left hover:border-accent-indigo/30 transition-all duration-200 active:scale-95 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-secondary text-xs font-mono">{order.orderNumber}</code>
                <span className={STATUS_COLORS[order.status] || 'badge-secondary'}>
                  {t(`orders.status.${order.status}`)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold">{Number(order.amount).toLocaleString('uz-UZ')} UZS</p>
                <p className="text-secondary text-xs">{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
