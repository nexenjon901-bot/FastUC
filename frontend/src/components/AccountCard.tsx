import React from 'react';
import type { GameAccount } from '../types';
import { formatUzs } from '../api/services';
import { ChevronRight, Shield } from 'lucide-react';

interface Props {
  account: GameAccount;
  onClick: () => void;
}

const AccountCard: React.FC<Props> = ({ account, onClick }) => (
  <button
    onClick={onClick}
    className="card w-full text-left overflow-hidden active:scale-[0.98] transition-transform"
  >
    <div className="relative h-28 overflow-hidden">
      <img src={account.image} alt="" className="w-full h-full object-cover object-left" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#12132b] via-transparent to-transparent" />
      {account.badge && (
        <span className="absolute top-2 left-2 badge badge-warning">{account.badge}</span>
      )}
      <span className="absolute top-2 right-2 rank-badge">{account.rank}</span>
    </div>
    <div className="p-3.5">
      <p className="text-white font-black text-sm mb-1">{account.title}</p>
      <div className="flex items-center gap-3 text-[11px] text-[#8b92b8] font-semibold mb-2">
        <span>Lv {account.level}</span>
        <span>·</span>
        <span>{account.skins} skin</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[#818cf8] font-black text-sm">{formatUzs(account.price)}</p>
        <span className="w-7 h-7 rounded-full bg-[#6366f1]/15 flex items-center justify-center text-[#818cf8]">
          <ChevronRight size={14} />
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-bold">
        <Shield size={11} />
        Kafolat bilan
      </div>
    </div>
  </button>
);

export default AccountCard;
