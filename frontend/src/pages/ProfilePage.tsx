import React, { useMemo } from 'react';
import { ChevronRight, FileText, Headphones, Megaphone, Shield } from 'lucide-react';
import PageShell from '../components/PageShell';
import { useApp } from '../context/AppContext';
import { links } from '../api/services';

const ProfilePage: React.FC = () => {
  const { user, orders } = useApp();
  const initials = (user?.firstName || user?.username || 'F').charAt(0).toUpperCase();
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

  const completed = useMemo(
    () => orders.filter((o) => o.status === 'COMPLETED').length || user?.completedOrders || 0,
    [orders, user?.completedOrders]
  );

  const menu = [
    { icon: Megaphone, label: 'Yangiliklar kanali', href: links.news },
    { icon: Headphones, label: "Qo'llab-quvvatlash", href: links.support },
    { icon: FileText, label: 'Foydalanish shartlari', href: links.terms },
    { icon: Shield, label: 'Maxfiylik siyosati', href: links.privacy },
  ];

  return (
    <PageShell title="Profil" showBack>
      <div className="animate-fadeup">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                border: '3px solid rgba(111,120,240,0.45)',
                background: 'var(--primary-soft)',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <span
              style={{
                position: 'absolute',
                right: 4,
                bottom: 6,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'var(--success)',
                border: '3px solid var(--bg)',
              }}
            />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>
            {user?.firstName || (user?.username ? `@${user.username}` : 'Foydalanuvchi')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>
            ID: {user?.telegramId || '—'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-light)' }}>{completed}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>
              Bajarilgan buyurtmalar
            </p>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 800 }}>{joinDate}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>
              Ro'yxatdan o'tgan
            </p>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {menu.map(({ icon: Icon, label, href }, i) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i < menu.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'rgba(99,102,241,0.15)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="#818cf8" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F8' }}>{label}</span>
              </div>
              <ChevronRight size={17} color="#8b92b8" />
            </a>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
