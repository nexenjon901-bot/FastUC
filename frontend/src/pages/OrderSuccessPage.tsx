import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import PageShell from '../components/PageShell';
import { statusLabel } from '../api/services';
import type { OrderStatus } from '../types';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const orderId = (state as { orderId?: string; status?: OrderStatus } | null)?.orderId || 'FU-10291';
  const status = (state as { status?: OrderStatus } | null)?.status || 'PAYMENT_CHECKING';

  return (
    <PageShell showBack={false} showFeedback={false}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fadeup px-2">
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <Check size={44} className="text-emerald-400" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Buyurtma qabul qilindi</h2>
        <p className="text-sm text-[#8b92b8] mb-1">#{orderId}</p>
        <p className="text-sm text-yellow-400 font-bold mb-7">{statusLabel(status)}</p>
        <button className="btn-primary max-w-xs" onClick={() => navigate(`/orders/${orderId}`)}>
          Buyurtmani ko'rish
        </button>
        <button className="btn-ghost max-w-xs mt-3" onClick={() => navigate('/orders')}>
          Buyurtmalarim
        </button>
      </div>
    </PageShell>
  );
};

export default OrderSuccessPage;
