import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setBalance(res.data.balance || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-4">
        {/* Back and Help */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ortga
          </button>
          <button className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/50 text-xs font-bold hover:bg-white/10">
            ?
          </button>
        </div>

        <h1 className="text-3xl font-black text-white mb-1">Hisobni to'ldirish</h1>
        <p className="text-indigo-300/80 mb-8">To'lov usulini tanlang</p>

        <div className="flex flex-col gap-4">
          {/* UZCARD / HUMO */}
          <div 
            onClick={() => {}} 
            className="bg-[#242746] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#2c3053] transition-colors"
          >
            <div className="w-12 h-12 bg-[#1c1d33] rounded-xl flex items-center justify-center mr-4 p-2">
              <span className="text-blue-500 font-black italic text-xl">U</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">UZCARD / HUMO</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#2a2d4f] text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                so'm
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* SBP */}
          <div 
            onClick={() => {}} 
            className="bg-[#242746] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#2c3053] transition-colors"
          >
            <div className="w-12 h-12 bg-[#1c1d33] rounded-xl flex items-center justify-center mr-4 p-2 overflow-hidden">
              <div className="flex">
                <div className="w-3 h-3 bg-red-500 rounded-sm skew-x-12"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-sm -skew-x-12"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm skew-x-12"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">СБП</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#2a2d4f] text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                рубль
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* BANKOMAT */}
          <div 
            onClick={() => {}} 
            className="bg-[#242746] rounded-2xl p-4 flex items-center border border-white/5 cursor-pointer hover:bg-[#2c3053] transition-colors"
          >
            <div className="w-12 h-12 bg-[#1c1d33] rounded-xl flex items-center justify-center mr-4 text-green-500">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="8" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg uppercase">Bankomat</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#2a2d4f] text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
                so'm
              </span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/30">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BalancePage;
