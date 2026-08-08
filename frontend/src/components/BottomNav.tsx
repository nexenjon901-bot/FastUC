import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', icon: HomeIcon, labelKey: 'nav.home' },
  { path: '/balance', icon: WalletIcon, labelKey: 'nav.balance' },
  { path: '/orders', icon: HistoryIcon, labelKey: 'nav.orders' },
  { path: '/profile', icon: UserIcon, labelKey: 'nav.profile' },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M3 12L12 3l9 9" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2"/>
      <path d="M16 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z" fill={active ? '#6366f1' : '#94a3b8'}/>
      <path d="M2 10V7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2"/>
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="4" rx="1" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2"/>
      <path d="M9 12h6M9 16h4" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav safe-area-bottom">
      {navItems.map(({ path, icon: Icon, labelKey }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-item flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`}
            id={`nav-${path.replace('/', '') || 'home'}`}
          >
            <Icon active={isActive} />
            <span className="font-medium text-[10px]">{t(labelKey)}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-indigo" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
