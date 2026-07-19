import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    // Fetch real balance if user is authenticated
    api.get('/users/me')
      .then(res => setBalance(res.data.balance || 0))
      .catch(() => {}); // ignore errors, might not be logged in yet
  }, []);

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 pb-24 mt-4">
        {/* Balance Card */}
        <div className="bg-[#242746] rounded-2xl p-5 flex items-center justify-between mb-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-indigo-400">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-white font-black text-2xl">{balance.toLocaleString()} UZS</span>
          </div>
          <button 
            onClick={() => navigate('/balance')}
            className="bg-[#facc15] hover:bg-[#eab308] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1 shadow-md"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            To'ldirish
          </button>
        </div>

        {/* PUBG MOBILE Banner */}
        <div 
          onClick={() => navigate('/accounts')}
          className="relative w-full h-52 rounded-2xl overflow-hidden mb-8 group cursor-pointer shadow-xl border border-white/10"
        >
          <img src="https://i.ytimg.com/vi/F2n1zB3OepA/maxresdefault.jpg" alt="PUBG" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <h2 className="text-white font-black text-3xl tracking-wide uppercase">PUBG MOBILE</h2>
            <button className="bg-[#facc15] text-black font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:scale-105 transition-transform">
              Sotib olish
            </button>
          </div>
        </div>

        {/* Boshqa o'yinlar */}
        <h3 className="text-white text-center font-bold text-lg mb-5 uppercase tracking-wider">Boshqa O'yinlar</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Free Fire */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-not-allowed border border-white/10 opacity-75 shadow-lg">
            <img src="https://wallpapercave.com/wp/wp8219808.jpg" alt="Free Fire" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute top-2 left-2 right-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Free_Fire_logo.png" alt="Free Fire Logo" className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
          
          {/* Telegram Premium */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-not-allowed border border-white/10 opacity-75 shadow-lg bg-gradient-to-b from-[#2AABEE] to-[#229ED9]">
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <svg width="56" height="56" fill="white" viewBox="0 0 24 24" className="drop-shadow-lg">
                <path d="M12 2L2 22l4-2 6-10-4 10 10-6-14-12z"/>
              </svg>
            </div>
          </div>
          
          {/* Mobile Legends */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-not-allowed border border-white/10 opacity-75 shadow-lg">
            <img src="https://i.pinimg.com/736x/8f/c9/77/8fc977cfb953d33306db30a21804f5e7.jpg" alt="MLBB" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
