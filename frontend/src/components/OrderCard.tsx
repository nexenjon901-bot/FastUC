import React from 'react';
import type { Order } from '../types';
import { formatUzs, statusLabel } from '../api/services';
import { StarIcon, UcIcon } from './icons';
import { Gamepad2, ChevronRight } from 'lucide-react';

interface Props {
  order: Order;
  onClick?: () => void;
}

const statusColor = (status: Order['status']) => {
  if (status === 'COMPLETED') return '#10b981';
  if (status === 'CANCELLED') return '#f43f5e';
  return '#facc15';
};

const OrderCard: React.FC<Props> = ({ order, onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-3.5 flex items-center justify-between gap-3 text-left active:opacity-70 transition-opacity border-b border-white/5"
  >
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="w-12 h-12 rounded-2xl bg-[#1e2040] flex items-center justify-center shrink-0 border border-white/5">
        {order.productType === 'UC' && <UcIcon size={28} />}
        {order.productType === 'STARS' && <StarIcon size={28} />}
        {order.productType === 'ACCOUNT' && (
          <Gamepad2 size={24} className="text-indigo-400" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-white truncate mb-0.5">{order.productLabel}</p>
        <p className="text-[12px] text-[#8b92b8] font-medium truncate">ID: {order.id}</p>
      </div>
    </div>
    
    <div className="text-right shrink-0 flex items-center gap-2">
      <div>
        <p className="text-[14px] font-bold text-white mb-0.5">{formatUzs(order.price)}</p>
        <p 
          className="text-[11px] font-bold text-right" 
          style={{ color: statusColor(order.status) }}
        >
          {statusLabel(order.status)}
        </p>
      </div>
      <ChevronRight size={18} className="text-[#8b92b8] ml-1" />
    </div>
  </button>
);

export default OrderCard;
