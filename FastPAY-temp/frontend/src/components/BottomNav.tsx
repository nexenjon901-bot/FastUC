import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', labelKey: 'nav.home', label: 'Bosh sahifa', icon: HomeIcon },
  { path: '/balance', labelKey: 'nav.balance', label: 'Balans', icon: WalletIcon },
  { path: '/orders', labelKey: 'nav.orders', label: 'Tarix', icon: HistoryIcon },
  { path: '/profile', labelKey: 'nav.profile', label: 'Profil', icon: UserIcon },
];

const ACTIVE_COLOR = '#6F78F0';
const MUTED_COLOR = '#9298C2';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M3 12L12 3l9 9" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2"/>
      <circle cx="16" cy="14" r="1.5" fill={active ? ACTIVE_COLOR : MUTED_COLOR}/>
      <path d="M2 10V7a3 3 0 013-3h14a3 3 0 013 3v3" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2"/>
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="4" rx="1" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2"/>
      <path d="M9 12h6M9 16h4" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={active ? ACTIVE_COLOR : MUTED_COLOR} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, icon: Icon, labelKey, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${path.replace('/', '') || 'home'}`}
          >
            <Icon active={isActive} />
            <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2px' }}>
              {t(labelKey, label)}
            </span>
            {isActive && (
              <span
                style={{ background: '#6F78F0', width: 4, height: 4, borderRadius: '50%', position: 'absolute', bottom: 4 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
