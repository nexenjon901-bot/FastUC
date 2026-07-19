import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

const METHODS = [
  { value: 'UZCARD_HUMO', label: 'Uzcard / Humo' },
  { value: 'CLICK', label: 'Click' },
  { value: 'PAYME', label: 'Payme' },
];

const BalancePage: React.FC = () => {
  const { t } = useTranslation();
  const [balance] = useState<number>(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UZCARD_HUMO');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [reqRes] = await Promise.all([
        api.get('/payments/topup-requests/me'),
      ]);
      setRequests(reqRes.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!amount || !proofImageUrl) {
      setError('Summa va chek URL kiritilishi shart!');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/payments/topup-requests', {
        amount: parseFloat(amount),
        method,
        proofImageUrl,
        userComment,
      });
      setSuccess("So'rovingiz yuborildi! Admin tasdiqlashini kuting.");
      setAmount(''); setProofImageUrl(''); setUserComment('');
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'APPROVED') return <span className="badge-success">{t('balance.approved')}</span>;
    if (status === 'REJECTED') return <span className="badge-danger">{t('balance.rejected')}</span>;
    return <span className="badge-warning">{t('balance.pending')}</span>;
  };

  return (
    <div className="page-container">
      <h1 className="section-title">{t('balance.title')}</h1>

      {/* Balance Card */}
      <div className="rounded-3xl p-6 bg-accent-gradient mb-6 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-12 -translate-y-12" />
        <p className="text-white/70 text-sm mb-1">{t('balance.currentBalance')}</p>
        <p className="text-white text-4xl font-extrabold">
          {balance.toLocaleString('uz-UZ')} <span className="text-xl font-bold opacity-70">UZS</span>
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="card border border-success/30 mb-4 animate-fade-in-up">
          <p className="text-success text-sm text-center">{success}</p>
        </div>
      )}

      {/* Top Up Button */}
      {!showForm ? (
        <button
          id="topup-btn"
          onClick={() => setShowForm(true)}
          className="btn-primary mb-6 animate-fade-in-up"
        >
          {t('balance.topUp')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card mb-6 animate-fade-in-up space-y-4">
          <h2 className="text-primary font-bold">{t('balance.topUp')}</h2>

          {/* Method Select */}
          <div>
            <label className="text-secondary text-xs font-medium mb-2 block">{t('balance.method')}</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${method === m.value ? 'border-accent-indigo bg-accent-indigo/10 text-accent-indigo' : 'border-white/10 text-secondary'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-secondary text-xs font-medium mb-2 block">{t('balance.amount')}</label>
            <input
              id="topup-amount"
              type="number"
              className="input-field"
              placeholder={t('balance.amountPlaceholder')}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1000"
              required
            />
          </div>

          {/* Proof URL */}
          <div>
            <label className="text-secondary text-xs font-medium mb-2 block">{t('balance.proofImage')}</label>
            <input
              id="topup-proof"
              type="text"
              className="input-field"
              placeholder={t('balance.proofPlaceholder')}
              value={proofImageUrl}
              onChange={e => setProofImageUrl(e.target.value)}
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-secondary text-xs font-medium mb-2 block">Izoh (ixtiyoriy)</label>
            <textarea
              id="topup-comment"
              className="input-field min-h-16 resize-none"
              placeholder="Qo'shimcha izoh..."
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Bekor
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Yuborilmoqda...' : t('balance.submit')}
            </button>
          </div>
        </form>
      )}

      {/* Top Up Requests History */}
      <h2 className="section-title text-base">So'rovlar tarixi</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="shimmer h-16 rounded-2xl" />)}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-secondary text-center text-sm py-8">Hali so'rov yuborilmagan</p>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card flex items-center justify-between">
              <div>
                <p className="text-primary font-bold text-sm">{Number(req.amount).toLocaleString('uz-UZ')} UZS</p>
                <p className="text-secondary text-xs">{req.method} · {new Date(req.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              {statusBadge(req.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalancePage;
