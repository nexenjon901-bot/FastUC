import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PageShell from '../components/PageShell';

const TopupSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageShell showBack={false} showFeedback={false}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fadeup px-2">
        <div className="w-[92px] h-[92px] rounded-full bg-emerald-500/15 border-2 border-emerald-500/35 flex items-center justify-center mb-5">
          <CheckCircle2 size={42} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">So'rov yaratildi</h2>
        <p className="text-sm text-[#8b92b8] leading-relaxed max-w-xs mb-2">
          So'rovingiz admin chatiga yuborildi.
        </p>
        <p className="text-xs text-[#8b92b8]/80 leading-relaxed max-w-xs mb-7">
          Balansingiz admin tasdiqlashidan keyin yangilanadi.
        </p>
        <button className="btn-primary max-w-xs" onClick={() => navigate('/topup/uzcard')}>
          Yangi so'rov yaratish
        </button>
        <button className="btn-ghost max-w-xs mt-3" onClick={() => navigate('/balance')}>
          Balansga qaytish
        </button>
      </div>
    </PageShell>
  );
};

export default TopupSuccessPage;
