import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Wallet } from 'lucide-react';
import PageShell from '../components/PageShell';
import { useApp } from '../context/AppContext';
import { apiService, formatUzs } from '../api/services';
import type { Product } from '../types';
import { StarIcon, UcIcon } from '../components/icons';

interface CheckoutState {
  product: Product;
  targetId: string;
  targetName?: string;
}

const CheckoutPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser, refreshOrders, showToast } = useApp();
  const data = state as CheckoutState | null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!data?.product || !data.targetId) {
    navigate('/');
    return null;
  }

  const { product, targetId, targetName } = data;
  const isUC = product.type === 'UC';
  const hasBalance = (user?.balance || 0) >= product.price;

  const rows = useMemo(
    () => [
      ['Mahsulot', product.label],
      ['Platform', isUC ? 'PUBG MOBILE' : 'TELEGRAM STARS'],
      ['Player', targetName || '—'],
      [isUC ? 'Player ID' : 'Username', targetId],
      ['Narxi', formatUzs(product.price)],
      ['To\'lov', 'Balans'],
    ] as const,
    [product, isUC, targetId, targetName]
  );

  const handlePay = async () => {
    if (!hasBalance) {
      setError('Balansingiz yetarli emas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await apiService.createOrder({
        productId: product.id,
        targetId,
        targetName,
        paymentMethod: 'BALANCE',
      });
      await refreshUser();
      await refreshOrders();
      navigate('/order-success', { state: { orderId: order.id, status: order.status } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Xatolik yuz berdi';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Buyurtmani tasdiqlash" showBack>
      <div className="animate-fadeup space-y-4 pb-8">
        <div className="card p-4">
          <p className="section-label mb-3">Mahsulot</p>
          <div className="flex items-center gap-3">
            {isUC ? <UcIcon size={44} /> : <StarIcon size={44} />}
            <div className="flex-1">
              <p className="font-black text-white">{product.label}</p>
              <p className="text-xs text-[#8b92b8] font-semibold">
                {isUC ? 'PUBG MOBILE' : 'TELEGRAM STARS'}
              </p>
            </div>
            <p className="font-black text-indigo-300">{formatUzs(product.price)}</p>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-sm">
              <span className="text-[#8b92b8] font-semibold">{label}</span>
              <span className="font-bold text-white text-right">{value}</span>
            </div>
          ))}
        </div>

        {!hasBalance && (
          <div className="card p-3 flex gap-2.5 border-rose-500/30 bg-rose-500/10">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <div>
              <p className="text-rose-400 font-black text-sm">Balans yetarli emas</p>
              <p className="text-xs text-[#8b92b8] mt-1">
                Zarur: {formatUzs(product.price)} · Mavjud: {formatUzs(user?.balance || 0)}
              </p>
            </div>
          </div>
        )}

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Wallet size={18} className="text-indigo-300" />
          </div>
          <div>
            <p className="font-black text-white text-sm">Balansdan to'lash</p>
            <p className="text-xs text-[#8b92b8] font-semibold">{formatUzs(user?.balance || 0)} mavjud</p>
          </div>
        </div>

        {error && <p className="text-rose-400 text-sm font-bold text-center">{error}</p>}

        {hasBalance ? (
          <button className="btn-primary" disabled={loading} onClick={handlePay}>
            {loading ? 'Buyurtma yaratilmoqda...' : `To'lash — ${formatUzs(product.price)} →`}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate('/balance')}>
            Balansni to'ldirish →
          </button>
        )}
      </div>
    </PageShell>
  );
};

export default CheckoutPage;
