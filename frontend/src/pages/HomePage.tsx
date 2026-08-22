import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { StarIcon, UcIcon } from '../components/icons';

const C = {
  bg: '#181927',
  card: '#252642',
  border: '#3C4172',
  accent: '#737DE4',
  text: '#F5F5F8',
  muted: '#858BB8',
};

const HomePage: React.FC = () => {
  const { refreshUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingBottom: 88 }}>
      <Header variant="home" showFeedback={false} />

      <div style={{ padding: '8px 16px 16px' }}>
        {/* AKKAUNTLAR banner */}
        <button
          onClick={() => navigate('/catalog/accounts')}
          style={{
            width: '100%',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'block',
            lineHeight: 0,
            position: 'relative',
          }}
        >
          <img
            src="/accounts-banner.jpg"
            alt="PUBG Akkauntlar"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 20,
            }}
          />
          {/* Ko'rish overlay */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            borderRadius: 20,
            padding: '4px 10px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#fff',
          }}>
            Ko'rish <ChevronRight size={12} strokeWidth={2.5} />
          </div>
        </button>

        {/* UC + Stars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <ServiceCard
            onClick={() => navigate('/catalog/uc')}
            icon={<UcIcon size={72} />}
            title="PUBG UC"
            desc="Tez va xavfsiz UC sotib oling"
          />
          <ServiceCard
            onClick={() => navigate('/catalog/stars')}
            icon={<StarIcon size={68} />}
            title="TELEGRAM STARS"
            desc="Telegram Stars tez yetkazamiz"
          />
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}> = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'relative',
      minHeight: 160,
      padding: '20px 14px 14px',
      borderRadius: 22,
      border: `1.5px solid ${C.border}`,
      background: C.card,
      cursor: 'pointer',
      textAlign: 'left',
      color: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      width: '100%',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 72 }}>
      {icon}
    </div>
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.2 }}>
        {title}
      </p>
      <p style={{ fontSize: '0.7rem', fontWeight: 400, color: C.muted, lineHeight: 1.4 }}>{desc}</p>
    </div>
    <span style={{ position: 'absolute', right: 10, bottom: 10, color: C.accent }}>
      <ChevronRight size={16} strokeWidth={2.5} />
    </span>
  </button>
);

export default HomePage;
