import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  balance?: number;
}

const Header: React.FC<HeaderProps> = ({ balance }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex items-center justify-between p-4 bg-bg border-b border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#d946ef] flex items-center justify-center text-white font-bold text-sm shadow-md">
          H
        </div>
        {!isHome && balance !== undefined && (
          <div 
            onClick={() => navigate('/balance')}
            className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-1.5 cursor-pointer bg-[#242746] hover:bg-[#2c3053] transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-white/70">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-white font-bold text-sm">{balance.toLocaleString()} UZS</span>
          </div>
        )}
      </div>
      
      <button className="flex items-center gap-2 border border-white/10 rounded-xl px-4 py-1.5 text-white/90 text-sm font-medium hover:bg-white/5 transition-colors bg-transparent">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fikrlar
      </button>
    </div>
  );
};

export default Header;
