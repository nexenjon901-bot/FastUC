import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  balance?: number;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ balance = 0, userName = 'H' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-header">
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-lg cursor-pointer select-none"
        >
          {userName.charAt(0).toUpperCase()}
        </div>

        {!isHome && (
          <div
            onClick={() => navigate('/balance')}
            className="flex items-center gap-1.5 bg-[#1e2040] border border-white/8 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-[#252745] transition-colors"
          >
            {/* Wallet icon */}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-[#8b92b8]">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 3H8L4 7h16l-4-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="17" cy="14" r="1" fill="currentColor"/>
            </svg>
            <span className="text-white font-black text-sm">{Number(balance).toLocaleString()} UZS</span>
          </div>
        )}
      </div>

      {/* Feedback button */}
      <button className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-sm">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fikrlar
      </button>
    </div>
  );
};

export default Header;
