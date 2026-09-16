import React from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

interface HeaderProps {
  balance?: number;
}

const Header: React.FC<HeaderProps> = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const user = WebApp.initDataUnsafe?.user;

  const triggerHaptic = () => {
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 sticky top-0 z-40 bg-bg border-b border-[#333742] h-[60px]">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-black text-base shadow-md">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.first_name?.charAt(0) || 'U'
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold leading-none">{user?.first_name || 'User'}</span>
          <span className="text-text-muted text-[10px] leading-tight">Welcome</span>
        </div>
      </div>

      {/* Right: Balance Chip */}
      <button
        onClick={() => { triggerHaptic(); navigate('/balance'); }}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-card border border-[#333742] cursor-pointer active:scale-95 transition-transform"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-warning">
          <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
        </svg>
        <span className="text-white text-xs font-bold">
          {balance.toLocaleString()} UZS
        </span>
        <div className="w-5 h-5 bg-warning rounded flex items-center justify-center ml-1">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" stroke="#000" strokeWidth="3" strokeLinecap="round"/></svg>
        </div>
      </button>
    </div>
  );
};

export default Header;
