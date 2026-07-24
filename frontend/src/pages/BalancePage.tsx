import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Copy, CheckCircle2, ChevronLeft, Wifi } from 'lucide-react';

type Step = 'method' | 'amount' | 'card' | 'done';

interface CardInfo {
  number: string;
  holder: string;
}

const ADMIN_CARD: CardInfo = {
  number: '8600 1234 5678 9012',
  holder: 'FASTPAY ADMIN',
};

const PAYMENT_DURATION = 15 * 60;

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'UZCARD_HUMO' | 'MANUAL'>('UZCARD_HUMO');
  const [amount, setAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(PAYMENT_DURATION);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get('/users/me').then((r) => setBalance(Number(r.data?.balance) || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (step === 'card') {
      setTimeLeft(PAYMENT_DURATION);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setStep('method');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const copyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.number.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitTopup = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/payments/topup-requests', {
        amount: Number(amount),
        method,
        userComment: `Manual transfer ${Number(amount).toLocaleString()} UZS`,
        proofImageUrl: null,
      });
      await refreshUser();
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'So‘rov yuborilmadi');
    } finally {
      setSubmitting(false);
    }
  };

  const methods = [
    { id: 'UZCARD_HUMO' as const, name: 'UZCARD / HUMO', currency: "so'm" },
    { id: 'MANUAL' as const, name: 'BANKOMAT', currency: "so'm" },
  ];

  if (step === 'done') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} />
        <div className="px-4 py-10 pb-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">So‘rov yuborildi</h1>
          <p className="text-[#8b92b8] mb-6">
            {Number(amount).toLocaleString()} UZS — admin tasdiqlagach balansingiz to‘ldiriladi.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Bosh sahifa
          </button>
        </div>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} />
        <div className="px-4 py-4 pb-24">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#8b92b8] font-700 mb-6 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} /> Ortga
          </button>
          <h1 className="text-2xl font-black text-white mb-1">Hisobni to&apos;ldirish</h1>
          <p className="text-[#8b92b8] font-600 mb-8">To&apos;lov usulini tanlang</p>
          <div className="flex flex-col gap-3">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setStep('amount');
                }}
                className="card-inner p-4 flex items-center gap-4 text-left w-full hover:bg-white/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-[#a5b4fc]">
                  <CreditCard size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-base">{m.name}</p>
                </div>
                <span className="text-[#8b92b8] text-sm font-semibold">{m.currency}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'amount') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} />
        <div className="px-4 py-4 pb-24">
          <button onClick={() => setStep('method')} className="text-[#8b92b8] font-700 mb-6">
            Ortga
          </button>
          <h1 className="text-2xl font-black text-white mb-1">To&apos;ldirish</h1>
          <p className="text-[#8b92b8] font-600 mb-8">Summani kiriting</p>
          <input
            type="number"
            className="input-field mb-4"
            placeholder="Summani kiriting"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1000}
          />
          <button
            onClick={() => {
              if (Number(amount) >= 1000) setStep('card');
            }}
            disabled={!amount || Number(amount) < 1000}
            className="btn-primary"
          >
            Davom etish →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} />
      <div className="px-4 py-4 pb-24">
        <button onClick={() => setStep('amount')} className="text-[#8b92b8] font-700 mb-4">
          Ortga
        </button>

        <div className="flex flex-col items-center mb-6">
          <p className="text-[#8b92b8] text-sm font-700 mb-2">To&apos;lov muddati</p>
          <div className={`text-5xl font-black ${timeLeft < 60 ? 'text-[#f43f5e]' : 'text-[#facc15]'}`}>
            {minutes}:{seconds}
          </div>
        </div>

        <div className="relative w-full aspect-[1.586/1] rounded-[1.5rem] p-6 text-white shadow-2xl mb-6 overflow-hidden bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] border border-white/10 group">
          {/* Card background glowing effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#facc15]/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>

          {/* Top row: Chip and NFC */}
          <div className="flex justify-between items-start relative z-10">
            <svg width="45" height="32" viewBox="0 0 45 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="45" height="32" rx="6" fill="#FACC15" fillOpacity="0.8"/>
              <path d="M0 10H45M0 22H45M14 0V32M31 0V32" stroke="#B45309" strokeOpacity="0.3" strokeWidth="1.5"/>
            </svg>
            <Wifi className="text-white/80 rotate-90" size={28} />
          </div>

          {/* Middle row: Card Number & Copy */}
          <div className="mt-8 relative z-10">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Karta raqami</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-2xl tracking-[0.12em] font-medium drop-shadow-md">{ADMIN_CARD.number}</p>
              <button 
                onClick={copyCard} 
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md border border-white/10"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Bottom row: Holder & Logo */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">Egasi</p>
              <p className="font-bold tracking-wide uppercase">{ADMIN_CARD.holder}</p>
            </div>
            
            {/* Custom generic card logo */}
            <div className="flex -space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen"></div>
              <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-screen"></div>
            </div>
          </div>
        </div>

        <div className="card p-4 border border-[#f43f5e]/20 bg-[#f43f5e]/5 mb-4">
          <p className="text-white/90 text-sm font-600">
            Aniq{' '}
            <span className="text-[#facc15] font-black">{Number(amount).toLocaleString()} UZS</span>{' '}
            o&apos;tkazing, keyin pastdagi tugmani bosing.
          </p>
        </div>

        {error && <p className="text-[#f43f5e] text-sm text-center mb-3">{error}</p>}

        <button onClick={submitTopup} disabled={submitting} className="btn-primary">
          {submitting ? 'Yuborilmoqda...' : 'To‘lovni amalga oshirdim'}
        </button>
      </div>
    </div>
  );
};

export default BalancePage;
