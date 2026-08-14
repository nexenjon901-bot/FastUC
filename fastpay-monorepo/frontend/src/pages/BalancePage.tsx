import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

type Step = 'method' | 'amount' | 'card';

interface CardInfo {
  number: string;
  holder: string;
}

// Admin card — bu admin panel orqali sozlanadi
const ADMIN_CARD: CardInfo = {
  number: '8600 1234 5678 9012',
  holder: 'FASTPAY ADMIN',
};

const PAYMENT_DURATION = 15 * 60; // 15 daqiqa soniyada

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'uzcard' | 'bankomat' | null>(null);
  const [amount, setAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(PAYMENT_DURATION);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 'card') {
      setTimeLeft(PAYMENT_DURATION);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); setStep('method'); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const copyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.number.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methods = [
    {
      id: 'uzcard' as const,
      name: 'UZCARD / HUMO',
      currency: "so'm",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Uzcard_logo.svg/320px-Uzcard_logo.svg.png"
          alt="Uzcard"
          className="w-8 h-8 object-contain"
          onError={e => {
            const t = e.target as HTMLImageElement;
            t.style.display = 'none';
            t.parentElement!.innerHTML = '<span class="text-blue-400 font-black text-xl">U</span>';
          }}
        />
      ),
    },
    {
      id: 'bankomat' as const,
      name: 'BANKOMAT',
      currency: "so'm",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/ATM_Logo.svg/200px-ATM_Logo.svg.png"
          alt="Bankomat"
          className="w-8 h-8 object-contain"
          onError={e => {
            const t = e.target as HTMLImageElement;
            t.style.display = 'none';
            t.parentElement!.innerHTML = `
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" class="text-green-400">
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2"/>
                <rect x="7" y="6" width="10" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
                <path d="M7 16h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M10 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>`;
          }}
        />
      ),
    },
  ];

  // --- STEP 1: METHOD SELECT ---
  if (step === 'method') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} />
        <div className="px-4 py-4 pb-24">
          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[#8b92b8] font-700 mb-6 hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ortga
          </button>

          <h1 className="text-2xl font-black text-white mb-1">Hisobni to'ldirish</h1>
          <p className="text-[#8b92b8] font-600 mb-8">To'lov usulini tanlang</p>

          <div className="flex flex-col gap-3">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id); setStep('amount'); }}
                className="card-inner p-4 flex items-center gap-4 text-left w-full hover:bg-[#2a2d50] active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-[#12132b] rounded-xl flex items-center justify-center flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-base">{m.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-secondary">{m.currency}</span>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#8b92b8]">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: AMOUNT ENTER ---
  if (step === 'amount') {
    return (
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Header balance={balance} />
        <div className="px-4 py-4 pb-24">
          <button onClick={() => setStep('method')} className="flex items-center gap-1.5 text-[#8b92b8] font-700 mb-6 hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ortga
          </button>

          <h1 className="text-2xl font-black text-white mb-1">To'ldirish</h1>
          <p className="text-[#8b92b8] font-600 mb-8">To'ldirmoqchi bo'lgan summani kiriting, men sizni adminga yo'naltiraman</p>

          <div className="mb-4">
            <label className="block text-[#8b92b8] text-sm font-700 mb-2">Summa (UZS)</label>
            <div className="relative">
              <input
                type="number"
                className="input-field pr-16"
                placeholder="Summani kiriting"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1000}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b92b8] text-sm font-700">UZS</span>
            </div>
            {amount && Number(amount) > 0 && (
              <p className="text-[#facc15] font-black text-sm mt-2">
                = {Number(amount).toLocaleString()} so'm
              </p>
            )}
          </div>

          <button
            onClick={() => { if (Number(amount) >= 1000) setStep('card'); }}
            disabled={!amount || Number(amount) < 1000}
            className="btn-primary"
          >
            Adminga yozish →
          </button>

          {Number(amount) > 0 && Number(amount) < 1000 && (
            <p className="text-[#f43f5e] text-sm font-700 text-center mt-3">Minimal summa: 1,000 UZS</p>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 3: CARD INFO + TIMER ---
  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} />
      <div className="px-4 py-4 pb-24">
        <button onClick={() => setStep('amount')} className="flex items-center gap-1.5 text-[#8b92b8] font-700 mb-4 hover:text-white transition-colors">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ortga
        </button>

        {/* Timer */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center">
            <p className="text-[#8b92b8] text-sm font-700 mb-2">To'lov muddati tugashiga</p>
            <div className={`text-5xl font-black tracking-widest ${timeLeft < 60 ? 'text-[#f43f5e]' : 'text-[#facc15]'}`}>
              {minutes}:{seconds}
            </div>
            <p className="text-[#8b92b8] text-xs font-600 mt-1">qoldi</p>
          </div>
        </div>

        {/* Plastic Card */}
        <div className="plastic-card mb-6">
          {/* Card type logo */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Uzcard_logo.svg/320px-Uzcard_logo.svg.png"
              alt="Uzcard"
              className="h-7 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded-full bg-[#f43f5e] opacity-80" />
              <div className="w-8 h-8 rounded-full bg-[#facc15] opacity-80 -ml-3" />
            </div>
          </div>

          {/* Chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 mb-4 relative z-10" />

          {/* Card number */}
          <div className="relative z-10 mb-4">
            <p className="text-white/60 text-xs font-700 mb-1 uppercase tracking-wider">Karta raqami</p>
            <div className="flex items-center gap-3">
              <p className="text-white font-black text-xl tracking-[0.15em]">{ADMIN_CARD.number}</p>
              <button
                onClick={copyCard}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-800 transition-colors ${
                  copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copied ? '✓ Nusxalandi' : 'Nusxa'}
              </button>
            </div>
          </div>

          {/* Card holder */}
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-700 mb-0.5 uppercase tracking-wider">Egasi</p>
            <p className="text-white font-black text-base tracking-wider">{ADMIN_CARD.holder}</p>
          </div>
        </div>

        {/* MUHIM eslatma */}
        <div className="card p-4 border border-[#f43f5e]/20 bg-[#f43f5e]/5 mb-6">
          <div className="flex items-start gap-2 mb-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#f43f5e] flex-shrink-0 mt-0.5">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#f43f5e] font-black text-base">MUHIM!</p>
          </div>
          <p className="text-white/90 text-sm font-600 mb-3">
            Quyida ko'rsatilgan summani to'lashingiz shart:{' '}
            <span className="text-[#facc15] font-black">{Number(amount).toLocaleString()} UZS</span>
          </p>
          <p className="text-[#8b92b8] text-sm font-600">
            Hatto 1 so'm kam yoki ko'p bo'lsa ham to'lov avtomatik qabul qilinmaydi.
          </p>
        </div>

        {/* Steps */}
        <div className="card p-4">
          <p className="text-white font-black mb-4">Qanday to'lash kerak</p>
          {[
            { n: '1', text: 'Karta raqamini nusxalang', sub: 'Yuqoridagi kartadagi nusxa olish tugmasini bosing' },
            { n: '2', text: 'Bank ilovasini oching', sub: 'Istalgan bank yoki to\'lov ilovasini tanlang' },
            { n: '3', text: "Ko'rsatilgan summani o'tkazing", sub: 'Ilova komissiyasi to\'lov summasiga kiritilmaydi' },
            { n: '4', text: 'Kutib turing', sub: 'To\'lov admin tekshiradi va balansingiz to\'ldiriladi' },
          ].map(step => (
            <div key={step.n} className="flex gap-3 mb-4 last:mb-0">
              <div className="w-7 h-7 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[#818cf8] font-black text-xs">{step.n}</span>
              </div>
              <div>
                <p className="text-white font-800 text-sm">{step.text}</p>
                <p className="text-[#8b92b8] text-xs font-600">{step.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalancePage;
