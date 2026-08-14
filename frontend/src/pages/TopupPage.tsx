import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { apiService, formatUzs } from '../api/services';
import { useApp } from '../context/AppContext';

const QUICK = [10000, 50000, 100000, 200000];
const MIN = 2000;

const TopupPage: React.FC = () => {
  const { method } = useParams<{ method: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const isUzcard = method === 'uzcard';
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const title = isUzcard ? 'UZCARD / HUMO' : 'BANKOMAT';
  const description = isUzcard
    ? "To'ldirmoqchi bo'lgan summani kiriting."
    : "Naqd pul orqali balansni to'ldirish";

  const submit = async () => {
    const value = Number(amount);
    if (!value || value < MIN) {
      setError(`Minimal summa ${formatUzs(MIN)}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiService.createTopup(value, isUzcard ? 'UZCARD_HUMO' : 'BANKOMAT');
      apiService.openAdminChat({
        kind: isUzcard ? 'UZCARD / HUMO top-up' : 'BANKOMAT top-up',
        amount: value,
      });
      navigate('/topup/success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Xatolik yuz berdi';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title={title} showBack>
      <div className="animate-fadeup space-y-4">
        <div className="card p-4">
          <p className="text-sm text-[#8b92b8] font-semibold leading-relaxed">{description}</p>
          <p className="text-xs text-[#8b92b8]/70 font-bold mt-2">Minimal: {formatUzs(MIN)}</p>
        </div>

        <div>
          <label className="section-label block mb-2">Summa</label>
          <input
            className={`input ${error ? 'input-error' : ''}`}
            type="number"
            inputMode="numeric"
            placeholder="Summa"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className={`py-3 rounded-xl text-sm font-black border transition-all ${
                amount === String(v)
                  ? 'border-indigo-400 bg-indigo-500/15 text-white'
                  : 'border-white/8 bg-[#1e2040] text-[#8b92b8]'
              }`}
            >
              {v.toLocaleString('uz-UZ')}
            </button>
          ))}
        </div>

        {error && <p className="text-rose-400 text-sm font-bold">{error}</p>}

        <button className="btn-primary" disabled={loading} onClick={submit}>
          {loading ? 'Yuborilmoqda...' : "Adminga yozish →"}
        </button>
      </div>
    </PageShell>
  );
};

export default TopupPage;
