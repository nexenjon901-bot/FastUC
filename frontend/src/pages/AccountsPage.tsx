import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const UC_PACKAGES = [
  { id: 1, uc: 60,   price: 12000  },
  { id: 2, uc: 325,  price: 58000  },
  { id: 3, uc: 660,  price: 115000 },
  { id: 4, uc: 1800, price: 290000 },
];

const STARS_PACKAGES = [
  { id: 1, stars: 50,  price: 15000  },
  { id: 2, stars: 100, price: 30000  },
  { id: 3, stars: 250, price: 75000  },
  { id: 4, stars: 500, price: 150000 },
];

// Simulate an actual PUBG ID lookup (demo: valid IDs start with 5)
const checkPubgId = (id: string): Promise<string | null> =>
  new Promise(resolve => setTimeout(() => {
    if (id.length >= 8 && id.startsWith('5')) resolve('Player_' + id.slice(-4));
    else resolve(null);
  }, 1200));

// Simulate a Telegram username lookup (demo: valid if no spaces and length >= 4)
const checkTgUsername = (username: string): Promise<boolean> =>
  new Promise(resolve => setTimeout(() => {
    const clean = username.replace('@', '').trim();
    resolve(clean.length >= 4 && !clean.includes(' '));
  }, 1200));

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'accounts' | 'uc' | 'stars'>('accounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // UC state
  const [playerId, setPlayerId] = useState('');
  const [isCheckingUC, setIsCheckingUC] = useState(false);
  const [ucPlayerName, setUcPlayerName] = useState<string | null>(null);
  const [ucCheckError, setUcCheckError] = useState<string | null>(null);

  // Stars state
  const [tgUsername, setTgUsername] = useState('');
  const [isCheckingStars, setIsCheckingStars] = useState(false);
  const [starsVerified, setStarsVerified] = useState<boolean | null>(null);
  const [starsCheckError, setStarsCheckError] = useState<string | null>(null);

  // Buy modal
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [buyType, setBuyType] = useState<'uc' | 'stars' | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const buyLock = useRef(false);

  useEffect(() => {
    if (activeTab === 'accounts') {
      setIsLoading(true);
      api.get('/accounts')
        .then(res => setAccounts(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleCheckUC = async () => {
    triggerHaptic();
    if (!playerId) return;
    setIsCheckingUC(true);
    setUcPlayerName(null);
    setUcCheckError(null);
    const name = await checkPubgId(playerId);
    if (name) {
      setUcPlayerName(name);
      triggerHaptic('medium');
    } else {
      setUcCheckError('Bu ID topilmadi. Tekshirib qayta kiriting.');
      triggerHaptic('heavy');
    }
    setIsCheckingUC(false);
  };

  const handleCheckStars = async () => {
    triggerHaptic();
    if (!tgUsername) return;
    setIsCheckingStars(true);
    setStarsVerified(null);
    setStarsCheckError(null);
    const found = await checkTgUsername(tgUsername);
    if (found) {
      setStarsVerified(true);
      triggerHaptic('medium');
    } else {
      setStarsVerified(false);
      setStarsCheckError('Bu username topilmadi. @ bilan to\'g\'ri kiriting.');
      triggerHaptic('heavy');
    }
    setIsCheckingStars(false);
  };

  const handleBuyPackage = async (pkg: any, type: 'uc' | 'stars') => {
    if (buyLock.current) return;
    triggerHaptic('heavy');
    setSelectedPkg(pkg);
    setBuyType(type);
  };

  const confirmBuy = () => {
    if (buyLock.current || !selectedPkg || !buyType) return;
    buyLock.current = true;
    setIsBuying(true);
    setTimeout(() => {
      triggerHaptic('heavy');
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('Buyurtma qabul qilindi! Tez orada hisobingizga tushadi ✅');
      } else {
        alert('Buyurtma qabul qilindi! Tez orada hisobingizga tushadi ✅');
      }
      setSelectedPkg(null);
      setBuyType(null);
      setIsBuying(false);
      buyLock.current = false;
    }, 1500);
  };

  const filtered = accounts.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.rank.toLowerCase().includes(search.toLowerCase())
  );

  const tabBtn = (tab: 'accounts' | 'uc' | 'stars', label: string) => (
    <button
      onClick={() => { triggerHaptic(); setActiveTab(tab); setUcPlayerName(null); setStarsVerified(null); setUcCheckError(null); setStarsCheckError(null); }}
      className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-[#5a67d8] text-white shadow-md' : 'text-[#94a3b8] hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="page-container">
      {/* Tab Header */}
      <div className="flex items-center justify-between gap-2 mb-6 bg-[#16192b] p-1.5 rounded-2xl shadow-sm border border-white/5 mt-2">
        {tabBtn('accounts', 'Akkauntlar')}
        {tabBtn('uc', 'PUBG UC')}
        {tabBtn('stars', 'Stars')}
      </div>

      {/* ── ACCOUNTS TAB ── */}
      {activeTab === 'accounts' && (
        <>
          <div className="mb-4 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" className="input-field pl-10" placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="shimmer h-48 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-[#94a3b8] py-16"><p>Akkauntlar topilmadi</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(account => (
                <button key={account.id} onClick={() => { triggerHaptic(); navigate(`/accounts/${account.id}`); }}
                  className="card text-left hover:border-[#5a67d8]/30 transition-all duration-200 active:scale-95 bg-[#1d2138]">
                  <div className="w-full h-24 rounded-xl bg-[#16192b] mb-3 overflow-hidden">
                    {account.images[0]
                      ? <img src={account.images[0]} alt={account.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center opacity-20">
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/></svg>
                        </div>
                    }
                  </div>
                  <div className="rank-badge mb-2 text-[10px]">{account.rank}</div>
                  <p className="text-white font-bold text-sm truncate mb-1">{account.title}</p>
                  <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] mb-3">
                    <span>Lv.{account.level}</span><span>·</span><span>{account.skinsCount} skins</span>
                  </div>
                  <p className="text-[#facc15] font-extrabold text-sm">{Number(account.price).toLocaleString('uz-UZ')} UZS</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── UC TAB ── */}
      {activeTab === 'uc' && (
        <div className="animate-fade-in-up">
          {/* ID Check Card */}
          <div className="bg-[#1d2138] rounded-2xl p-5 mb-5 border border-white/5 shadow-lg">
            <h2 className="text-white font-black text-lg mb-1">PUBG UC Xarid Qilish</h2>
            <p className="text-[#94a3b8] text-xs mb-4">Player ID ni kiriting va tekshiring, keyin miqdorni tanlang.</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={playerId}
                onChange={e => { setPlayerId(e.target.value); setUcPlayerName(null); setUcCheckError(null); }}
                placeholder="Player ID (masalan: 51234567)"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleCheckUC}
                disabled={isCheckingUC || !playerId}
                className="bg-[#facc15] text-black font-black px-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform text-sm whitespace-nowrap"
              >
                {isCheckingUC ? '...' : 'Tekshirish'}
              </button>
            </div>

            {ucPlayerName && (
              <div className="mt-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#10b981] flex-shrink-0">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-[#10b981] text-[10px] font-bold uppercase">ID Topildi ✅</p>
                  <p className="text-white font-bold text-sm">{ucPlayerName}</p>
                </div>
              </div>
            )}

            {ucCheckError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-red-400 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="text-red-400 text-sm font-medium">{ucCheckError}</p>
              </div>
            )}
          </div>

          {/* Packages */}
          <div className={`grid grid-cols-2 gap-3 transition-opacity ${!ucPlayerName ? 'opacity-40 pointer-events-none' : ''}`}>
            {UC_PACKAGES.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => ucPlayerName && handleBuyPackage(pkg, 'uc')}
                className="bg-[#1d2138] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:border-[#facc15]/40 active:scale-95 transition-all shadow-md"
              >
                <div className="w-14 h-14 mx-auto mb-2 bg-[#facc15]/10 rounded-2xl flex items-center justify-center">
                  <span className="text-[#facc15] font-black text-xl">UC</span>
                </div>
                <h3 className="text-white font-black text-xl">{pkg.uc} <span className="text-[#facc15] text-sm">UC</span></h3>
                <div className="mt-2 bg-[#16192b] py-1.5 rounded-lg text-white font-bold text-xs">
                  {pkg.price.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
            ))}
          </div>
          {!ucPlayerName && (
            <p className="text-center text-[#94a3b8] text-xs mt-3">⬆️ Avval Player ID ni tekshiring</p>
          )}
        </div>
      )}

      {/* ── STARS TAB ── */}
      {activeTab === 'stars' && (
        <div className="animate-fade-in-up">
          {/* Username Check */}
          <div className="bg-[#1d2138] rounded-2xl p-5 mb-5 border border-white/5 shadow-lg">
            <h2 className="text-white font-black text-lg mb-1">Telegram Stars</h2>
            <p className="text-[#94a3b8] text-xs mb-4">Telegram username kiriting va tekshiring, keyin miqdorni tanlang.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tgUsername}
                onChange={e => { setTgUsername(e.target.value); setStarsVerified(null); setStarsCheckError(null); }}
                placeholder="@username"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleCheckStars}
                disabled={isCheckingStars || !tgUsername}
                className="bg-[#facc15] text-black font-black px-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform text-sm whitespace-nowrap"
              >
                {isCheckingStars ? '...' : 'Tekshirish'}
              </button>
            </div>

            {starsVerified && (
              <div className="mt-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#10b981] flex-shrink-0">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-[#10b981] text-[10px] font-bold uppercase">Username Topildi ✅</p>
                  <p className="text-white font-bold text-sm">{tgUsername.startsWith('@') ? tgUsername : '@' + tgUsername}</p>
                </div>
              </div>
            )}

            {starsCheckError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-red-400 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="text-red-400 text-sm font-medium">{starsCheckError}</p>
              </div>
            )}
          </div>

          {/* Packages */}
          <div className={`grid grid-cols-2 gap-3 transition-opacity ${!starsVerified ? 'opacity-40 pointer-events-none' : ''}`}>
            {STARS_PACKAGES.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => starsVerified && handleBuyPackage(pkg, 'stars')}
                className="bg-[#1d2138] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:border-[#5a67d8]/40 active:scale-95 transition-all shadow-md"
              >
                <div className="w-14 h-14 mx-auto mb-2 bg-[#5a67d8]/10 rounded-2xl flex items-center justify-center">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#5a67d8" strokeWidth="2" fill="#5a67d8" fillOpacity="0.3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-white font-black text-xl">{pkg.stars} <span className="text-[#5a67d8] text-sm">⭐</span></h3>
                <div className="mt-2 bg-[#16192b] py-1.5 rounded-lg text-white font-bold text-xs">
                  {pkg.price.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
            ))}
          </div>
          {!starsVerified && (
            <p className="text-center text-[#94a3b8] text-xs mt-3">⬆️ Avval Username ni tekshiring</p>
          )}
        </div>
      )}

      {/* ── BUY CONFIRM MODAL ── */}
      {selectedPkg && buyType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4 animate-fade-in-up">
          <div className="bg-[#1d2138] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-1">Xaridni tasdiqlang</h2>
            <p className="text-[#94a3b8] text-sm mb-6">
              {buyType === 'uc'
                ? `${selectedPkg.uc} UC → ${ucPlayerName}`
                : `${selectedPkg.stars} Stars → ${tgUsername}`}
            </p>
            <div className="bg-[#16192b] rounded-2xl p-4 mb-6 flex justify-between items-center">
              <span className="text-[#94a3b8] font-medium">Narxi</span>
              <span className="text-[#facc15] font-black text-xl">{selectedPkg.price.toLocaleString('uz-UZ')} so'm</span>
            </div>
            <button
              onClick={confirmBuy}
              disabled={isBuying}
              className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 mb-3"
            >
              {isBuying ? 'Yuklanmoqda...' : 'Ha, Xarid Qilish ✅'}
            </button>
            <button
              onClick={() => { setSelectedPkg(null); setBuyType(null); }}
              className="w-full text-[#94a3b8] font-bold py-2 text-sm"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
