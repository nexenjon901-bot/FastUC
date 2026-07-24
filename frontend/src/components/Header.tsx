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
      <a
        href="https://t.me/fastpay_isbotlar"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 py-1.5 px-3 text-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all duration-300 text-blue-400 font-medium"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
        Fikrlar
      </a>
    </div>
  );
};

export default Header;
