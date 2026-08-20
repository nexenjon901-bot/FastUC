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
            border: `1.5px solid ${C.border}`,
            padding: 0,
            cursor: 'pointer',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#0d1020',
            display: 'block',
            lineHeight: 0,
          }}
        >
          <img
            src="/accounts-banner.png"
            alt="PUBG Akkauntlar"
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              objectPosition: 'left center',
              display: 'block',
            }}
          />
        </button>

        {/* UC + Stars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
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
      width: '100%',
      padding: '14px 16px',
      borderRadius: 18,
      border: `1.5px solid ${C.border}`,
      background: C.card,
      cursor: 'pointer',
      textAlign: 'left',
      color: 'inherit',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      boxShadow: 'none',
    }}
  >
    <div style={{ flexShrink: 0, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.2, textTransform: 'uppercase' }}>
        {title}
      </p>
      <p style={{ fontSize: '0.7rem', fontWeight: 400, color: C.muted, lineHeight: 1.4 }}>{desc}</p>
    </div>
    <ChevronRight size={18} strokeWidth={2.5} color={C.accent} style={{ flexShrink: 0 }} />
  </button>
);

export default HomePage;
