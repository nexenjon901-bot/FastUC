import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Landmark } from 'lucide-react';
import PageShell from '../components/PageShell';
import { useApp } from '../context/AppContext';
import { formatUzs } from '../api/services';

const BalancePage: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
    <PageShell title="Balans">
      <div className="animate-fadeup space-y-5">
        <div className="plastic-card">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Balans</p>
          <p className="text-3xl font-black text-white">{formatUzs(user?.balance || 0)}</p>
          <button className="btn-yellow w-full mt-5 py-3 text-sm" onClick={() => navigate('/topup/uzcard')}>
            Balansni to'ldirish
          </button>
        </div>

        <div>
          <p className="section-label mb-3">To'lov usullari</p>
          <div className="space-y-2.5">
            <MethodRow
              icon={<CreditCard size={20} className="text-indigo-300" />}
              title="UZCARD / HUMO"
              desc="Karta orqali balans to'ldirish"
              onClick={() => navigate('/topup/uzcard')}
            />
            <MethodRow
              icon={<Landmark size={20} className="text-emerald-400" />}
              title="BANKOMAT"
              desc="Naqd pul orqali balans to'ldirish"
              onClick={() => navigate('/topup/bankomat')}
            />
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-black text-white mb-1">Qanday ishlaydi?</p>
          <p className="text-xs text-[#8b92b8] leading-relaxed font-medium">
            Summani kiriting, admin chatiga yo‘naltirilasiz. Tasdiqlangandan keyin balans avtomatik yangilanadi va UC, Stars yoki akkaunt sotib olishingiz mumkin.
          </p>
        </div>
      </div>
    </PageShell>
  );
};

const MethodRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}> = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="card w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform">
    <div className="w-11 h-11 rounded-xl bg-[#242746] flex items-center justify-center">{icon}</div>
    <div className="flex-1">
      <p className="font-black text-white text-sm">{title}</p>
      <p className="text-xs text-[#8b92b8] font-semibold">{desc}</p>
    </div>
    <ChevronRight size={18} className="text-[#8b92b8]" />
  </button>
);

export default BalancePage;
