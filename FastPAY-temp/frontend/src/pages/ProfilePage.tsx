import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../api';

const ProfilePage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<{ firstName?: string; username?: string; telegramId?: string; createdAt?: string; } | null>(null);

  useEffect(() => {
    api.get('/users/me')
      .then(r => {
        setBalance(r.data?.balance || 0);
        setUser(r.data);
      })
      .catch(() => {});
  }, []);

  const displayName = user?.firstName || user?.username || 'Foydalanuvchi';
  const initials = displayName.charAt(0).toUpperCase();
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
    : new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  const menuItems = [
    {
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Yangiliklar kanali',
      action: () => window.open('https://t.me/fastpay_news', '_blank'),
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: "Qo'llab-Quvvatlash",
      action: () => window.open('https://t.me/fastpay_support', '_blank'),
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Ommaviy oferta',
      action: () => {},
    },
  ];

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} />

      <div className="px-4 py-8 pb-24 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            {initials}
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#10b981] border-4 border-[#12132b] rounded-full" />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-black text-white mb-2">{displayName}</h1>

        {/* ID badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e2040] rounded-full border border-[#6366f1]/20 mb-8">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-[#8b92b8]">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-[#8b92b8] font-800 text-sm">ID: {user?.telegramId || '—'}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="card-inner p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#12132b] flex items-center justify-center mb-3 text-[#818cf8]">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#8b92b8] text-[10px] font-800 uppercase tracking-wider leading-tight mb-2">
              Bajarilgan<br/>Buyurtmalar
            </p>
            <p className="text-white font-black text-2xl">0</p>
          </div>

          <div className="card-inner p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#12132b] flex items-center justify-center mb-3 text-[#818cf8]">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[#8b92b8] text-[10px] font-800 uppercase tracking-wider leading-tight mb-2">
              Ro'yxatdan<br/>O'tgan
            </p>
            <p className="text-white font-black text-lg">{joinDate}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="w-full card overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 hover:bg-white/4 active:bg-white/8 transition-colors ${
                i < menuItems.length - 1 ? 'border-b border-white/6' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-[#8b92b8]">{item.icon}</span>
                <span className="text-white font-800 text-base">{item.label}</span>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-white/25">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
