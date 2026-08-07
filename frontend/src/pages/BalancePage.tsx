import React, { useState, useEffect, useRef } from 'react';

import Header from '../components/Header';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Copy, CheckCircle2, ChevronLeft, Wifi, Hourglass, ArrowUpRight, ArrowDownRight, Clock, Wallet } from 'lucide-react';

type Step = 'history' | 'method' | 'amount' | 'card' | 'done';

interface CardInfo {
  number: string;
  holder: string;
}

const ADMIN_CARD: CardInfo = {
  number: '8600 1234 5678 9012',
  holder: 'FASTPAY ADMIN',
};

const PAYMENT_DURATION = 10 * 60;

const BalancePage: React.FC = () => {
  const { user, photoUrl, refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<Step>('history');
  const [method, setMethod] = useState<'UZCARD_HUMO' | 'MANUAL'>('UZCARD_HUMO');
  const [amount, setAmount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(PAYMENT_DURATION);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.balance) {
      setBalance(Number(user.balance));
    }
  }, [user]);

  useEffect(() => {
    if (step === 'card') {
      setTimeLeft(PAYMENT_DURATION);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setStep('history');
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

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const copyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.number.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitTopup = async () => {
    if (!receiptUrl.trim()) {
      setError('Iltimos, to‘lov cheki ssilkasini kiriting!');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/payments/topup-requests', {
        amount: Number(amount),
        method,
        userComment: `Manual transfer ${Number(amount).toLocaleString()} UZS`,
        proofImageUrl: receiptUrl,
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
        <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />
        <div className="px-4 py-10 pb-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">So‘rov yuborildi</h1>
          <p className="text-[#8b92b8] mb-6">
            {Number(amount).toLocaleString()} UZS — admin chekni tasdiqlagach balansingiz to‘ldiriladi.
          </p>
          <button onClick={() => setStep('history')} className="btn-primary">
            Balans sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />
        <div className="px-4 py-4 pb-24">
          <button
            onClick={() => setStep('history')}
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
        <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />
        <div className="px-4 py-4 pb-24">
          <button onClick={() => setStep('method')} className="text-[#8b92b8] font-700 mb-6 flex items-center gap-1.5">
             <ChevronLeft size={20} /> Ortga
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

  if (step === 'card') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />
        <div className="px-4 py-4 pb-24">
          <button onClick={() => setStep('amount')} className="text-[#8b92b8] font-700 mb-4 flex items-center gap-1.5">
            <ChevronLeft size={20} /> Ortga
          </button>

          <div className="flex flex-col items-center mb-6">
            <p className="text-[#8b92b8] text-sm font-700 mb-2 flex items-center gap-1">
              <Hourglass size={16} /> To&apos;lov muddati
            </p>
            <div className={`text-4xl font-black ${timeLeft < 60 ? 'text-[#f43f5e]' : 'text-[#facc15]'}`}>
              {minutes}:{seconds}
            </div>
          </div>

          <div className="w-[90%] mx-auto relative aspect-[1.586/1] rounded-2xl p-4 text-white shadow-2xl mb-6 overflow-hidden bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] border border-white/10 group">
            {/* Card background glowing effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6366f1]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#facc15]/10 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/4"></div>

            {/* Top row: Chip and NFC */}
            <div className="flex justify-between items-start relative z-10">
              <svg width="32" height="22" viewBox="0 0 45 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="45" height="32" rx="6" fill="#FACC15" fillOpacity="0.8"/>
                <path d="M0 10H45M0 22H45M14 0V32M31 0V32" stroke="#B45309" strokeOpacity="0.3" strokeWidth="1.5"/>
              </svg>
              <Wifi className="text-white/80 rotate-90" size={20} />
            </div>

            {/* Middle row: Card Number & Copy */}
            <div className="mt-5 relative z-10">
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mb-1">Karta raqami</p>
              <div className="flex items-center justify-between">
                {/* Smaller text for card number */}
                <p className="font-mono text-base tracking-[0.1em] font-semibold drop-shadow-md">{ADMIN_CARD.number}</p>
                <button 
                  onClick={copyCard} 
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md border border-white/10"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Bottom row: Holder & Logo */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
              <div>
                <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider mb-0.5">Egasi</p>
                <p className="text-xs font-bold tracking-wide uppercase">{ADMIN_CARD.holder}</p>
              </div>
              
              {/* Custom generic card logo */}
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-red-500/80 mix-blend-screen"></div>
                <div className="w-5 h-5 rounded-full bg-yellow-500/80 mix-blend-screen"></div>
              </div>
            </div>
          </div>

          <div className="card p-3 border border-red-500/30 bg-red-500/10 mb-4 text-center">
            <p className="text-red-400 text-xs font-bold uppercase tracking-wide">
              Diqqat! Alif Mobi orqali to'lov taqiqlanadi, qabul qilinmaydi.
            </p>
          </div>

          <div className="card p-4 border border-white/10 mb-4">
            <p className="text-white/90 text-sm font-600 mb-3">
              To'lov qilinganligini tasdiqlovchi chek (skrinshot) ssilkasini kiriting:
            </p>
            <input
              type="url"
              className="input-field mb-2 text-sm"
              placeholder="https://... (Masalan, imgur ssilka)"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-[#f43f5e] text-sm text-center mb-3">{error}</p>}

          <button onClick={submitTopup} disabled={submitting} className="btn-primary">
            {submitting ? 'Yuborilmoqda...' : 'To‘lovni amalga oshirdim'}
          </button>
        </div>
      </div>
    );
  }

  // default step: history
  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />
      <div className="px-4 py-4 pb-24">
        
        {/* Balance Card at the top */}
        <div className="card-inner p-5 flex flex-col justify-between mb-6 shadow-lg bg-gradient-to-br from-[#1e2040] to-[#12132b] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#6366f1]/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[#8b92b8] text-xs font-700 uppercase tracking-wide">Joriy Hisobingiz</p>
                <p className="text-white font-black text-2xl leading-tight mt-0.5">{Number(balance).toLocaleString()} <span className="text-base text-[#8b92b8]">UZS</span></p>
              </div>
            </div>
          </div>
          <button onClick={() => setStep('method')} className="btn-yellow w-full py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(250,204,21,0.25)] relative z-10 flex items-center justify-center gap-2">
            + To'ldirish
          </button>
        </div>

        {/* Transaction History Placeholder */}
        <div className="flex flex-col gap-3">
          <h2 className="section-title mb-2">To'lovlar tarixi</h2>
          {/* Example Item 1 */}
          <div className="card-inner p-3.5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                 <ArrowDownRight size={20} />
               </div>
               <div>
                 <p className="text-white font-bold text-sm">Hisob to'ldirildi</p>
                 <p className="text-[#8b92b8] text-[11px] flex items-center gap-1 mt-0.5"><Clock size={10} /> 14 Apr 2026, 12:30</p>
               </div>
             </div>
             <p className="text-green-400 font-bold text-sm">+50,000 UZS</p>
          </div>
          
          {/* Example Item 2 */}
          <div className="card-inner p-3.5 flex items-center justify-between opacity-70">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                 <Hourglass size={20} />
               </div>
               <div>
                 <p className="text-white font-bold text-sm">To'lov kutilmoqda</p>
                 <p className="text-[#8b92b8] text-[11px] flex items-center gap-1 mt-0.5"><Clock size={10} /> 14 Apr 2026, 10:15</p>
               </div>
             </div>
             <p className="text-yellow-400 font-bold text-sm">+25,000 UZS</p>
          </div>

          {/* Example Item 3 */}
          <div className="card-inner p-3.5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                 <ArrowUpRight size={20} />
               </div>
               <div>
                 <p className="text-white font-bold text-sm">UC Xarid</p>
                 <p className="text-[#8b92b8] text-[11px] flex items-center gap-1 mt-0.5"><Clock size={10} /> 13 Apr 2026, 18:45</p>
               </div>
             </div>
             <p className="text-white font-bold text-sm">-15,000 UZS</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BalancePage;
