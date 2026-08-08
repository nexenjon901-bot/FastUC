import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const UC_PACKAGES = [
  { id: 1, uc: 60, price: 12000, img: 'https://cdn-icons-png.flaticon.com/512/8254/8254641.png' },
  { id: 2, uc: 325, price: 58000, img: 'https://cdn-icons-png.flaticon.com/512/8254/8254641.png' },
  { id: 3, uc: 660, price: 115000, img: 'https://cdn-icons-png.flaticon.com/512/8254/8254641.png' },
  { id: 4, uc: 1800, price: 290000, img: 'https://cdn-icons-png.flaticon.com/512/8254/8254641.png' },
];

const STARS_PACKAGES = [
  { id: 1, stars: 50, price: 15000, img: 'https://telegram.org/img/t_logo.png' },
  { id: 2, stars: 100, price: 30000, img: 'https://telegram.org/img/t_logo.png' },
  { id: 3, stars: 250, price: 75000, img: 'https://telegram.org/img/t_logo.png' },
  { id: 4, stars: 500, price: 150000, img: 'https://telegram.org/img/t_logo.png' },
];

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'accounts' | 'uc' | 'stars'>('accounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // UC / Stars logic
  const [playerId, setPlayerId] = useState('');
  const [tgUsername, setTgUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkedName, setCheckedName] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'accounts') {
      setIsLoading(true);
      api.get('/accounts')
        .then(res => setAccounts(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const triggerHaptic = (style: 'light'|'medium'|'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleCheckUC = () => {
    triggerHaptic();
    if (!playerId) return;
    setIsChecking(true);
    // Simulate API check
    setTimeout(() => {
      setCheckedName('Player_' + playerId.slice(0, 4));
      setIsChecking(false);
      triggerHaptic('medium');
    }, 1500);
  };

  const handleCheckStars = () => {
    triggerHaptic();
    if (!tgUsername) return;
    setIsChecking(true);
    // Simulate API check
    setTimeout(() => {
      setCheckedName(tgUsername.replace('@', '') + ' (Mavjud)');
      setIsChecking(false);
      triggerHaptic('medium');
    }, 1500);
  };

  const handleBuyPackage = (pkg: any, type: string) => {
    triggerHaptic('heavy');
    if (window.confirm(`Haqiqatan ham ${type === 'uc' ? pkg.uc + ' UC' : pkg.stars + ' Stars'} ni ${pkg.price.toLocaleString('uz-UZ')} UZS ga xarid qilasizmi?`)) {
      alert("Buyurtma qabul qilindi. Tez orada hisobingizga tushadi!");
    }
  };

  const filtered = accounts.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.rank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header Tabs */}
      <div className="flex items-center justify-between gap-2 mb-6 bg-[#16192b] p-1.5 rounded-2xl shadow-sm border border-white/5 mt-2">
        <button 
          onClick={() => { triggerHaptic(); setActiveTab('accounts'); setCheckedName(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'accounts' ? 'bg-[#5a67d8] text-white shadow-md' : 'text-[#94a3b8] hover:text-white'}`}
        >
          Akkauntlar
        </button>
        <button 
          onClick={() => { triggerHaptic(); setActiveTab('uc'); setCheckedName(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'uc' ? 'bg-[#5a67d8] text-white shadow-md' : 'text-[#94a3b8] hover:text-white'}`}
        >
          UC
        </button>
        <button 
          onClick={() => { triggerHaptic(); setActiveTab('stars'); setCheckedName(null); }}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'stars' ? 'bg-[#5a67d8] text-white shadow-md' : 'text-[#94a3b8] hover:text-white'}`}
        >
          Stars
        </button>
      </div>

      {activeTab === 'accounts' && (
        <>
          <div className="mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="shimmer h-48 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-[#94a3b8] py-16">
              <p>Akkauntlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((account, i) => (
                <button
                  key={account.id}
                  onClick={() => { triggerHaptic(); navigate(`/accounts/${account.id}`); }}
                  className="card text-left hover:border-[#5a67d8]/30 transition-all duration-200 active:scale-95 bg-[#1d2138]"
                >
                  <div className="w-full h-24 rounded-xl bg-[#16192b] mb-3 overflow-hidden">
                    {account.images[0] ? (
                      <img src={account.images[0]} alt={account.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="rank-badge mb-2 text-[10px]">{account.rank}</div>
                  <p className="text-white font-bold text-sm truncate mb-1">{account.title}</p>
                  <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] mb-3">
                    <span>Lv.{account.level}</span>
                    <span>·</span>
                    <span>{account.skinsCount} skins</span>
                  </div>
                  <p className="text-[#facc15] font-extrabold text-sm">{Number(account.price).toLocaleString('uz-UZ')} UZS</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'uc' && (
        <div className="animate-fade-in-up">
          <div className="bg-[#1d2138] rounded-2xl p-5 mb-6 border border-white/5 shadow-lg">
            <h2 className="text-white font-black text-xl mb-2">PUBG UC Xarid Qilish</h2>
            <p className="text-[#94a3b8] text-sm mb-4">Player ID raqamingizni kiriting va tekshiring.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="number" 
                value={playerId}
                onChange={e => setPlayerId(e.target.value)}
                placeholder="Player ID"
                className="input-field flex-1"
              />
              <button 
                onClick={handleCheckUC}
                disabled={isChecking || !playerId}
                className="bg-[#5a67d8] text-white font-bold px-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                {isChecking ? '...' : 'Tekshirish'}
              </button>
            </div>

            {checkedName && (
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#10b981]">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-[#10b981] text-xs font-bold uppercase">Topildi</p>
                  <p className="text-white font-bold">{checkedName}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {UC_PACKAGES.map((pkg) => (
              <div key={pkg.id} onClick={() => { if(checkedName) handleBuyPackage(pkg, 'uc'); else { triggerHaptic(); alert('Avval ID ni tekshiring!'); } }} className={`bg-[#1d2138] border border-white/5 rounded-2xl p-4 text-center cursor-pointer transition-all ${checkedName ? 'hover:border-[#facc15]/50 active:scale-95' : 'opacity-50 grayscale'}`}>
                <img src={pkg.img} alt="UC" className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" />
                <h3 className="text-white font-black text-lg">{pkg.uc} <span className="text-[#facc15] text-sm">UC</span></h3>
                <div className="mt-2 bg-[#16192b] py-1.5 rounded-lg text-white font-bold text-sm">
                  {pkg.price.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stars' && (
        <div className="animate-fade-in-up">
          <div className="bg-[#1d2138] rounded-2xl p-5 mb-6 border border-white/5 shadow-lg">
            <h2 className="text-white font-black text-xl mb-2">Telegram Stars</h2>
            <p className="text-[#94a3b8] text-sm mb-4">Telegram username orqali Stars sotib oling.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={tgUsername}
                onChange={e => setTgUsername(e.target.value)}
                placeholder="@username"
                className="input-field flex-1"
              />
              <button 
                onClick={handleCheckStars}
                disabled={isChecking || !tgUsername}
                className="bg-[#5a67d8] text-white font-bold px-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                {isChecking ? '...' : 'Tekshirish'}
              </button>
            </div>

            {checkedName && (
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3 flex items-center gap-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#10b981]">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-[#10b981] text-xs font-bold uppercase">Topildi</p>
                  <p className="text-white font-bold">{checkedName}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STARS_PACKAGES.map((pkg) => (
              <div key={pkg.id} onClick={() => { if(checkedName) handleBuyPackage(pkg, 'stars'); else { triggerHaptic(); alert('Avval Username ni tekshiring!'); } }} className={`bg-[#1d2138] border border-white/5 rounded-2xl p-4 text-center cursor-pointer transition-all ${checkedName ? 'hover:border-[#5a67d8]/50 active:scale-95' : 'opacity-50 grayscale'}`}>
                <img src={pkg.img} alt="Stars" className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" />
                <h3 className="text-white font-black text-lg">{pkg.stars} <span className="text-[#5a67d8] text-sm">Stars</span></h3>
                <div className="mt-2 bg-[#16192b] py-1.5 rounded-lg text-white font-bold text-sm">
                  {pkg.price.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
