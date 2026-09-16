import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const gameCategories = [
  { id: 'pubg', name: 'PUBG UC', image: '/card-pubg.png' },
  { id: 'standoff', name: 'STANDOFF 2', image: '/card-standoff.png' },
  { id: 'cod', name: 'CALL OF DUTY', image: '/card-cod.png' },
  { id: 'eafc', name: 'EAFC MOBILE', image: '/card-eafc.png' },
  { id: 'stars', name: 'TELEGRAM STARS', image: '/stars.png' },
];

const packagesMock = {
  pubg: [
    { id: 1, amount: '60 UC', price: 12000, icon: '/pubg-uc.png' },
    { id: 2, amount: '325 UC', price: 58000, icon: '/pubg-uc.png' },
    { id: 3, amount: '660 UC', price: 115000, icon: '/pubg-uc.png' },
    { id: 4, amount: '1800 UC', price: 290000, icon: '/pubg-uc.png' },
  ],
  stars: [
    { id: 5, amount: '50 Stars', price: 14000, icon: '/stars.png' },
    { id: 6, amount: '100 Stars', price: 28000, icon: '/stars.png' },
    { id: 7, amount: '250 Stars', price: 70000, icon: '/stars.png' },
  ],
  standoff: [
    { id: 8, amount: '100 Gold', price: 25000, icon: '/standoff-gold.png' },
    { id: 9, amount: '500 Gold', price: 120000, icon: '/standoff-gold.png' },
  ],
  cod: [
    { id: 10, amount: '80 CP', price: 14000, icon: '/cod-cp.png' },
    { id: 11, amount: '420 CP', price: 70000, icon: '/cod-cp.png' },
  ],
  eafc: [
    { id: 12, amount: '100 FC Points', price: 15000, icon: '/eafc-coin.png' },
    { id: 13, amount: '500 FC Points', price: 70000, icon: '/eafc-coin.png' },
  ]
};

const HomePage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState('pubg');

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    // mock fetch
    setBalance(25000); // Set mock balance
  }, []);

  const currentPackages = packagesMock[activeCategory as keyof typeof packagesMock] || [];

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Header balance={balance} />

      {/* Category Image Cards (Horizontal Scroll) */}
      <div className="flex overflow-x-auto gap-3 px-4 py-4 scrollbar-hide border-b border-[#333742]/50">
        {gameCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              triggerHaptic();
              setActiveCategory(cat.id);
            }}
            className={`relative flex-shrink-0 w-36 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
              activeCategory === cat.id 
                ? 'border-accent shadow-lg shadow-accent/40 scale-105' 
                : 'border-[#333742] opacity-75 hover:opacity-100'
            }`}
          >
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-lg">{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Packages Section */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg">{gameCategories.find(c => c.id === activeCategory)?.name} Paketlari</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {currentPackages.map(pkg => (
            <div key={pkg.id} className="bg-card border border-[#333742] rounded-2xl p-4 flex flex-col justify-between items-center text-center">
              
              {/* Package Icon — screen blend removes all dark/colored backgrounds */}
              <div className="w-20 h-20 mb-2 flex items-center justify-center">
                {pkg.icon.startsWith('/') ? (
                  <img
                    src={pkg.icon}
                    alt={pkg.amount}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                ) : (
                  <span className="text-3xl">{pkg.icon}</span>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-white font-black text-lg">{pkg.amount}</h3>
                <p className="text-warning font-bold text-sm">{pkg.price.toLocaleString()} UZS</p>
              </div>
              
              <button 
                onClick={() => {
                  triggerHaptic('heavy');
                  alert(`ID ni kiriting (${pkg.amount} sotib olish uchun)`);
                }}
                className="w-full bg-warning hover:bg-yellow-400 text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-warning/20"
              >
                Sotib olish
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
