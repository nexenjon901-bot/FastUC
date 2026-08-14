import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api';

const tabs = ['Hammasi', 'Kutilmoqda', 'Muvaffaqiyatli', 'Bekor'];

const OrdersPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('Hammasi');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/users/me').then(r => setBalance(r.data?.balance || 0)).catch(() => {});
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-4 pb-24">
        <h1 className="text-xl font-black text-white text-center mb-5">Buyurtmalar tarixi</h1>

        {/* Search */}
        <div className="relative mb-4">
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b92b8]">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buyurtma ID yoki akkaunt bo'yicha qidirish..."
            className="input-field pl-11"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 mb-8">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-800 border transition-all ${
                activeTab === t
                  ? 'bg-[#6366f1] text-white border-[#6366f1] shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                  : 'bg-[#1e2040] text-[#8b92b8] border-white/8 hover:bg-[#242746]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center mt-16 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-[#1e2040] border border-white/6 flex items-center justify-center mb-6 shadow-xl">
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" className="text-[#8b92b8]">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Buyurtmalar hali yo'q</h2>
          <p className="text-[#8b92b8] text-center text-sm font-600 leading-relaxed max-w-[260px]">
            Buyurtmalar tarixingiz birinchi xaridingizdan keyin shu yerda ko'rinadi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
