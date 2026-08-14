import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Shield, Wallet } from 'lucide-react';
import PageShell from '../components/PageShell';
import { apiService, formatUzs } from '../api/services';
import { useApp } from '../context/AppContext';
import type { GameAccount, PaymentMethod } from '../types';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser, refreshOrders, showToast } = useApp();
  const [account, setAccount] = useState<GameAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('BALANCE');

  useEffect(() => {
    if (!id) return;
    apiService.getAccount(id).then(setAccount).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Akkaunt" showBack>
        <div className="shimmer h-64 rounded-2xl" />
      </PageShell>
    );
  }

  if (!account) {
    return (
      <PageShell title="Akkaunt" showBack>
        <div className="card p-6 text-center">
          <p className="font-black mb-3">Akkaunt topilmadi</p>
          <button className="btn-primary" onClick={() => navigate('/catalog/accounts')}>
            Orqaga
          </button>
        </div>
      </PageShell>
    );
  }

  const hasBalance = (user?.balance || 0) >= account.price;

  const handleBuy = async () => {
    if (method === 'BALANCE' && !hasBalance) {
      showToast('Balansingiz yetarli emas');
      return;
    }
    setPaying(true);
    try {
      const order = await apiService.createAccountOrder(account.id, method);
      await refreshUser();
      await refreshOrders();
      navigate('/order-success', { state: { orderId: order.id, status: order.status } });
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Xatolik yuz berdi');
    } finally {
      setPaying(false);
    }
  };

  return (
    <PageShell title="Akkaunt tafsilotlari" showBack>
      <div className="animate-fadeup space-y-4 pb-8">
        <div className="card overflow-hidden">
          <img src={account.image} alt="" className="w-full h-44 object-cover" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-xl font-black text-white">{account.title}</h2>
              <span className="rank-badge">{account.rank}</span>
            </div>
            <p className="text-sm text-[#8b92b8] leading-relaxed mb-3">{account.description}</p>
            <div className="flex gap-4 text-sm font-bold text-[#8b92b8]">
              <span>Lv {account.level}</span>
              <span>{account.skins} skin</span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="section-label mb-3">Xususiyatlar</p>
          <div className="space-y-2">
            {account.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm font-semibold text-white">
                <Check size={16} className="text-emerald-400" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
          <Shield size={16} />
          Xavfsiz o‘tkazish kafolati
        </div>

        <div className="card p-4">
          <p className="section-label mb-3">To'lov usuli</p>
          <button
            onClick={() => setMethod('BALANCE')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              method === 'BALANCE' ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/8 bg-[#242746]'
            }`}
          >
            <Wallet size={18} className="text-indigo-300" />
            <div className="text-left">
              <p className="font-black text-white text-sm">Balans</p>
              <p className="text-xs text-[#8b92b8] font-semibold">{formatUzs(user?.balance || 0)}</p>
            </div>
          </button>
        </div>

        {!hasBalance && method === 'BALANCE' && (
          <div className="card p-3 text-rose-400 text-sm font-bold text-center">
            Balans yetarli emas · {formatUzs(account.price)} kerak
          </div>
        )}

        {hasBalance || method !== 'BALANCE' ? (
          <button className="btn-primary" disabled={paying} onClick={handleBuy}>
            {paying ? 'Buyurtma yaratilmoqda...' : `Sotib olish — ${formatUzs(account.price)}`}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate('/balance')}>
            Balansni to'ldirish
          </button>
        )}
      </div>
    </PageShell>
  );
};

export default AccountDetailPage;
