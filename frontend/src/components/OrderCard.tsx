import React from 'react';
import type { Order } from '../types';
import { formatUzs, statusLabel, statusTone } from '../api/services';
import StatusBadge from './StatusBadge';
import { StarIcon, UcIcon } from './icons';
import { Gamepad2 } from 'lucide-react';

interface Props {
  order: Order;
  onClick?: () => void;
}

const platformLabel = (type: Order['productType']) => {
  if (type === 'UC') return 'PUBG MOBILE';
  if (type === 'STARS') return 'TELEGRAM STARS';
  return 'PUBG AKKAUNT';
};

const OrderCard: React.FC<Props> = ({ order, onClick }) => (
  <button
    onClick={onClick}
    className="card w-full p-3.5 flex items-center justify-between gap-3 text-left active:scale-[0.98] transition-transform animate-fadeup"
  >
    <div className="flex items-center gap-3 min-w-0">
      {order.productType === 'UC' && <UcIcon size={40} />}
      {order.productType === 'STARS' && <StarIcon size={40} />}
      {order.productType === 'ACCOUNT' && (
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-300">
          <Gamepad2 size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-[#8b92b8] font-semibold">#{order.id}</p>
        <p className="text-sm font-black text-white truncate">{order.productLabel}</p>
        <p className="text-[11px] text-[#8b92b8] font-semibold">{platformLabel(order.productType)}</p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-black text-white mb-1.5">{formatUzs(order.price)}</p>
      <StatusBadge tone={statusTone(order.status)} label={statusLabel(order.status)} />
    </div>
  </button>
);

export default OrderCard;
