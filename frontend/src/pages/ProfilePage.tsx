import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api';

const ProfilePage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setBalance(res.data.balance || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="page-container flex flex-col" style={{ padding: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-8 flex flex-col items-center">
        {/* Large Avatar */}
        <div className="relative mb-4 mt-[-20px]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d946ef] to-[#c026d3] shadow-[0_0_30px_rgba(217,70,239,0.4)] flex items-center justify-center text-white text-3xl font-bold">
            {/* The user avatar from Telegram, fallback to H */}
            Hn
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#10b981] border-4 border-[#1b1d36] rounded-full"></div>
        </div>

        {/* Name and ID */}
        <h1 className="text-3xl font-black text-white mb-2">Hn</h1>
        <div className="px-4 py-1.5 bg-[#242746] border border-[#6366f1]/30 rounded-full mb-8 flex items-center justify-center">
          <span className="text-indigo-300 font-medium text-sm">ID: 8407085035</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-[#242746] rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 shadow-lg">
            <div className="w-12 h-12 bg-[#1c1d33] rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#94a3b8] text-[10px] font-bold tracking-wider mb-2 text-center h-8 flex items-center">BAJARILGAN<br/>BUYURTMALAR</p>
            <h2 className="text-2xl font-black text-white">0</h2>
          </div>
          
          <div className="bg-[#242746] rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 shadow-lg">
            <div className="w-12 h-12 bg-[#1c1d33] rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#94a3b8] text-[10px] font-bold tracking-wider mb-2 text-center h-8 flex items-center">RO'YXATDAN<br/>O'TGAN</p>
            <h2 className="text-lg font-black text-white">19.07.2026</h2>
          </div>
        </div>

        {/* Menu List */}
        <div className="w-full bg-[#242746] rounded-3xl border border-white/5 shadow-lg overflow-hidden flex flex-col">
          {/* Item 1 */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 cursor-pointer hover:bg-[#2c3053] transition-colors">
            <div className="flex items-center gap-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-indigo-400">
                <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 8h2a2 2 0 100-4h-2M2 9.424A11.966 11.966 0 0012 17.5a11.966 11.966 0 0010-8.076M2 9.424A11.966 11.966 0 0112 1.348a11.966 11.966 0 0110 8.076M2 9.424h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-bold text-lg">Yangiliklar kanali</span>
            </div>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white/30">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Item 2 */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 cursor-pointer hover:bg-[#2c3053] transition-colors">
            <div className="flex items-center gap-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white/60">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-bold text-lg">Qo'llab-Quvvatlash</span>
            </div>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white/30">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#2c3053] transition-colors">
            <div className="flex items-center gap-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white/60">
                <path d="M9 12h6M9 16h6M19 8.5V20a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2h6.5L19 8.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-bold text-lg">Ommaviy oferta</span>
            </div>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white/30">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
