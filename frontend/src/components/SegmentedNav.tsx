import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const items = [
  { key: 'uc', label: 'PUBG UC', path: '/catalog/uc' },
  { key: 'stars', label: 'Telegram Stars', path: '/catalog/stars' },
] as const;

const SegmentedNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#242746] border border-white/6">
      {items.map((item) => {
        const active = pathname.includes(item.key);
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`rounded-lg py-2.5 text-xs font-black transition-all ${
              active
                ? 'bg-indigo-500 text-white shadow-[0_6px_16px_rgba(99,102,241,0.35)]'
                : 'text-[#8b92b8]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedNav;
