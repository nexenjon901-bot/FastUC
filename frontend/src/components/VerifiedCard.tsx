import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  ok: boolean;
  title: string;
  subtitle: string;
  meta?: string;
  error?: string;
}

const VerifiedCard: React.FC<Props> = ({ ok, title, subtitle, meta, error }) => {
  if (!ok) {
    return (
      <div className="mt-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex gap-2.5 animate-fadeup">
        <XCircle size={20} className="text-rose-400 shrink-0" />
        <div>
          <p className="font-black text-rose-400 text-sm">{error || 'Topilmadi'}</p>
          <p className="text-xs text-[#8b92b8] mt-1">Ma'lumotni tekshirib, qayta urinib ko'ring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-fadeup">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={18} className="text-emerald-400" />
        <p className="text-sm font-black text-emerald-400">✓ {title}</p>
      </div>
      <p className="text-lg font-black text-white">{subtitle}</p>
      {meta && <p className="text-xs text-[#8b92b8] font-semibold mt-1">{meta}</p>}
    </div>
  );
};

export default VerifiedCard;
