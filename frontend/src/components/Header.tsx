import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  balance?: number;
}

const Header: React.FC<HeaderProps> = ({ balance }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#0f111a]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* App Logo or Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a67d8] to-[#7c3aed] flex items-center justify-center text-white font-black text-lg shadow-lg">
          F
        </div>
        {!isHome && balance !== undefined && (
          <div 
            onClick={() => { triggerHaptic(); navigate('/balance'); }}
            className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-1.5 cursor-pointer bg-[#1d2138] hover:bg-[#16192b] transition-colors active:scale-95"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-[#5a67d8]">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-white font-bold text-sm">{balance.toLocaleString()} UZS</span>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => {
          triggerHaptic();
          window.location.href = 'https://t.me/FastUC_reviews'; // Just an example, assuming reviews channel
        }}
        className="flex items-center gap-2 border border-white/10 rounded-xl px-4 py-2 text-white/90 text-sm font-bold hover:bg-white/5 transition-all bg-[#16192b] shadow-sm active:scale-95"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Fikrlar
      </button>
    </div>
  );
};

export default Header;
