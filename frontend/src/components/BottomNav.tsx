import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ClipboardList, UserRound } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/balance', icon: Wallet, label: 'Balans' },
  { to: '/orders', icon: ClipboardList, label: 'Buyurtmalar' },
  { to: '/profile', icon: UserRound, label: 'Profil' },
];

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 'var(--max-w)',
        zIndex: 100,
        background: 'rgba(17, 19, 33, 0.96)',
        backdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(60,67,120,0.35)',
        paddingBottom: 'var(--safe-bottom)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
      }}
    >
      {tabs.map(({ to, icon: Icon, label }) => {
        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 4px 10px',
              color: active ? '#858CF5' : '#9298C2',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: active ? '#6F78F0' : 'transparent',
                marginTop: 1,
              }}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
