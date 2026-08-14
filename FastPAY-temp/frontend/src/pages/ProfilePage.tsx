import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api';

const C = {
  bg: '#181927', card: '#252642', card2: '#1e1f3a',
  border: '#3C4172', accent: '#737DE4', text: '#F5F5F8', muted: '#858BB8',
};

const ProfilePage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setBalance(Number(res.data.balance) || 0);
        setUser(res.data);
      } catch (e) {}
    };
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const openLink = (url: string) => {
    triggerHaptic();
    if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
    else window.location.href = url;
  };

  const menuItems = [
    {
      label: 'Yangiliklar kanali',
      sub: "So'nggi yangiliklar",
      action: () => openLink('https://t.me/FastUC_news'),
      iconColor: C.accent,
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 8h2a2 2 0 100-4h-2M2 9.424A11.966 11.966 0 0012 17.5a11.966 11.966 0 0010-8.076M2 9.424A11.966 11.966 0 0112 1.348a11.966 11.966 0 0110 8.076M2 9.424h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Qo'llab-quvvatlash",
      sub: "24/7 yordam",
      action: () => openLink('https://t.me/FastUC_support'),
      iconColor: '#22c55e',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Ommaviy oferta',
      sub: "Shartlar va qoidalar",
      action: () => { triggerHaptic(); alert("Tez kunda!"); },
      iconColor: C.muted,
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M9 12h6M9 16h6M19 8.5V20a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2h6.5L19 8.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <Header balance={balance} />

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #737DE4, #5a63c8)',
            boxShadow: '0 0 28px rgba(115,125,228,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '2rem', fontWeight: 900,
          }}>
            {user?.firstName?.charAt(0) || 'F'}
          </div>
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, background: '#22c55e', border: `3px solid ${C.bg}`, borderRadius: '50%' }}/>
        </div>

        <h1 style={{ color: C.text, fontWeight: 900, fontSize: '1.3rem', marginBottom: 6 }}>
          {user?.firstName || 'Foydalanuvchi'}
        </h1>
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9999, padding: '5px 16px', marginBottom: 28 }}>
          <span style={{ color: C.muted, fontSize: '0.78rem', fontWeight: 600 }}>
            ID: <span style={{ color: C.text }}>{user?.telegramId || '...'}</span>
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginBottom: 24 }}>
          <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(115,125,228,0.08) 0%, transparent 70%)' }}/>
            <div style={{ width: 44, height: 44, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, zIndex: 1, color: C.accent }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p style={{ color: C.muted, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', marginBottom: 6, zIndex: 1 }}>BAJARILGAN<br/>BUYURTMALAR</p>
            <h2 style={{ color: C.text, fontSize: '1.6rem', fontWeight: 900, zIndex: 1 }}>0</h2>
          </div>
          <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(115,125,228,0.05) 0%, transparent 70%)' }}/>
            <div style={{ width: 44, height: 44, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, zIndex: 1, color: C.accent }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p style={{ color: C.muted, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', marginBottom: 6, zIndex: 1 }}>RO'YXATDAN<br/>O'TGAN</p>
            <h2 style={{ color: C.text, fontSize: '0.82rem', fontWeight: 900, zIndex: 1 }}>
              {user ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : '...'}
            </h2>
          </div>
        </div>

        {/* Menu */}
        <div style={{ width: '100%', background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, overflow: 'hidden' }}>
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 18px', cursor: 'pointer',
                borderBottom: idx < menuItems.length - 1 ? `1px solid ${C.border}` : 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.iconColor }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem', marginBottom: 1 }}>{item.label}</p>
                  <p style={{ color: C.muted, fontSize: '0.7rem' }}>{item.sub}</p>
                </div>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
