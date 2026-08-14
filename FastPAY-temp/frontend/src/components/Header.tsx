import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  balance?: number;
}

const Header: React.FC<HeaderProps> = ({ balance = 0 }) => {
  const navigate = useNavigate();

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div
      style={{ background: '#181927', borderBottom: '1.5px solid #3C4172', height: 60 }}
      className="flex items-center justify-between px-4 sticky top-0 z-40"
    >
      {/* Left: Avatar + Balance */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div
          style={{ background: 'linear-gradient(135deg, #737DE4, #5a63c8)', width: 38, height: 38 }}
          className="rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md"
        >
          F
        </div>

        {/* Balance Chip */}
        <button
          onClick={() => { triggerHaptic(); navigate('/balance'); }}
          style={{ background: '#252642', border: '1.5px solid #3C4172' }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 cursor-pointer active:scale-95 transition-transform"
        >
          {/* Wallet icon */}
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ color: '#737DE4' }}>
            <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
          </svg>
          <span style={{ color: '#F5F5F8', fontSize: '0.8rem' }} className="font-bold">
            {balance.toLocaleString()} UZS
          </span>
        </button>
      </div>

      {/* Right: Fikrlar button */}
      <button
        onClick={() => {
          triggerHaptic();
          window.location.href = 'https://t.me/FastUC_reviews';
        }}
        style={{ background: '#252642', border: '1.5px solid #3C4172' }}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 active:scale-95 transition-all"
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#737DE4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ color: '#F5F5F8', fontSize: '0.8rem' }} className="font-bold">Fikrlar</span>
      </button>
    </div>
  );
};

export default Header;
