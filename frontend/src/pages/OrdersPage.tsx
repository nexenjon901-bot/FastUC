import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('Hammasi');

  const tabs = ['Hammasi', 'Kutilmoqda', 'Muvaffaqiyatli', 'Bekor qilingan'];

  useEffect(() => {
    api.get('/users/me')
      .then(res => setBalance(res.data.balance || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="page-container flex flex-col" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-6 flex-1 flex flex-col">
        <h1 className="text-xl font-black text-white text-center mb-6">Buyurtmalar tarixi</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/40">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Buyurtma ID yoki o'yin bo'yicha qidirish..."
            className="w-full bg-[#1c1d33] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                  : 'bg-[#242746] text-white/50 border-white/5 hover:bg-[#2c3053]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center mt-10">
          <div className="w-20 h-20 bg-[#242746] rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-white/5">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-white/80">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Buyurtmalar hali yo'q</h2>
          <p className="text-indigo-300/80 text-center text-sm leading-relaxed max-w-[280px]">
            Buyurtmalar tarixingiz birinchi xaridingizdan keyin shu yerda ko'rinadi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
