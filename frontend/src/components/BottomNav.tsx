import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
            className={`nav-item relative ${active ? 'active' : ''}`}
          >
            <motion.div
              initial={false}
              animate={{ 
                scale: active ? 1.15 : 1, 
                y: active ? -4 : 0 
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
                mass: 0.8
              }}
            >
              <Icon 
                size={24} 
                strokeWidth={active ? 2.5 : 2} 
                className={active ? 'text-[#3b82f6]' : 'text-[#8b92b8]'}
                style={active ? { filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))' } : {}}
              />
            </motion.div>
            <motion.span
              initial={false}
              animate={{ 
                opacity: active ? 1 : 0.7,
                scale: active ? 1 : 0.9,
                y: active ? 2 : 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`text-[0.65rem] font-bold ${active ? 'text-white' : 'text-[#8b92b8]'}`}
            >
              {tab.label}
            </motion.span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
