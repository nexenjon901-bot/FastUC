import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, History, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    {
      path: '/',
      label: 'Bosh Sahifa',
      icon: Home,
    },
    {
      path: '/balance',
      label: 'Balans',
      icon: Wallet,
    },
    {
      path: '/orders',
      label: 'Tarix',
      icon: History,
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = pathname === tab.path || (pathname.startsWith('/orders') && tab.path === '/orders');
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            <Icon 
              size={22} 
              strokeWidth={active ? 2.5 : 2} 
              className="transition-all duration-300"
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
