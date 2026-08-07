import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, History, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    {
      path: '/',
      label: 'Asosiy',
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
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#12132b]/95 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = pathname === tab.path || (pathname.startsWith('/orders') && tab.path === '/orders');
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-[#3b82f6]' : 'text-[#8b92b8] hover:text-[#a5b4fc]'}`}
            >
              <Icon 
                size={22} 
                strokeWidth={active ? 2.5 : 2} 
                className={active ? 'text-[#3b82f6]' : 'text-[#8b92b8]'}
              />
              <span className={`text-[10px] font-bold ${active ? 'text-[#3b82f6]' : 'text-[#8b92b8]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
