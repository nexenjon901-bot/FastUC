import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { links } from '../api/services';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  showFeedback?: boolean;
  variant?: 'default' | 'home' | 'legacy';
  balance?: number;
  userName?: string;
  photoUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  right,
  showFeedback = true,
  variant = 'default',
  balance: balanceProp,
  userName = 'U',
  photoUrl,
}) => {
  const navigate = useNavigate();
  const { user } = useApp();
  const balance = balanceProp ?? user?.balance ?? 0;
  const balanceText = Number(balance).toLocaleString('uz-UZ');

  if (variant === 'home') {
    return (
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '14px 16px 10px',
          background: '#181927',
          borderBottom: '1.5px solid #3C4172',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #737DE4, #5a63c8)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          F
        </div>

        <button
          onClick={() => window.open(links.feedback, '_blank')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            height: 42,
            padding: '0 14px',
            borderRadius: 12,
            border: '1.5px solid #3C4172',
            background: '#252642',
            color: '#F5F5F8',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <MessageCircle size={15} color="#737DE4" />
          Fikrlar
        </button>
      </header>
    );
  }

  if (variant === 'legacy') {
    return (
      <div className="app-header">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover shadow-lg cursor-pointer border border-white/10"
              onClick={() => navigate('/profile')}
            />
          ) : (
            <div
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-lg cursor-pointer select-none"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            onClick={() => navigate('/balance')}
            className="flex items-center gap-1.5 bg-[#1e2040] border border-white/8 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-[#252745] transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-[#8b92b8]">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" />
              <path d="M16 3H8L4 7h16l-4-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="17" cy="14" r="1" fill="currentColor" />
            </svg>
            <span className="text-white font-black text-sm">{balanceText} UZS</span>
          </div>
        </div>
        <a
          href={links.feedback}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 py-1 px-2.5 text-[11px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-[10px] transition-all duration-300 text-blue-400 font-bold"
        >
          <MessageCircle size={12} />
          Fikrlar
        </a>
      </div>
    );
  }

  return (
    <header className="app-header border-b border-white/5">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="w-10 h-10 rounded-xl bg-[#1e2040] border border-white/8 flex items-center justify-center text-white"
            aria-label="Orqaga"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {title && <h1 className="text-base font-black text-white truncate">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {showFeedback && (
          <button
            onClick={() => window.open(links.feedback, '_blank')}
            className="flex items-center gap-1 py-1.5 px-2.5 text-[11px] bg-[#1e2040] border border-white/8 rounded-[10px] text-[#8b92b8] font-bold"
          >
            <MessageCircle size={12} />
            Fikrlar
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
