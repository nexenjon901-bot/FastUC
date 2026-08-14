import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    {
      path: '/',
      label: 'Bosh Sahifa',
      icon: (active: boolean) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      path: '/balance',
      label: 'Balans',
      icon: (active: boolean) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <rect
            x="2" y="7" width="20" height="14" rx="2"
            stroke="currentColor" strokeWidth="2.2"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M16 3H8L2 7h20l-6-4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
        </svg>
      ),
    },
    {
      path: '/orders',
      label: 'Tarix',
      icon: (active: boolean) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="2.2"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: (active: boolean) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12" cy="8" r="4"
            stroke="currentColor" strokeWidth="2.2"
            fill={active ? 'currentColor' : 'none'}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            {tab.icon(active)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
