import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const C = { bg: '#080912', card: '#161830', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0' };

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Buyurtmalar', icon: '🛍️' },
    { path: '/admin/topups', label: 'To\'lovlar', icon: '💰' },
    { path: '/admin/users', label: 'Foydalanuvchilar', icon: '👥' },
    { path: '/admin/accounts', label: 'Akkauntlar', icon: '🎮' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0, left: sidebarOpen ? 0 : -280, width: 260,
        background: C.card, borderRight: `1px solid ${C.border}`, zIndex: 50, transition: 'left 0.3s',
        display: 'flex', flexDirection: 'column',
        '@media (min-width: 768px)': { position: 'sticky', left: 0 } as any
      }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>F</div>
            <span style={{ color: C.text, fontWeight: 900, fontSize: '1.1rem' }}>FastUC Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '1.5rem', cursor: 'pointer', display: 'block' }}>×</button>
        </div>

        <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = location.pathname.includes(item.path);
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                background: active ? 'rgba(111,120,240,0.15)' : 'transparent', border: 'none',
                color: active ? C.accent : C.muted, fontWeight: active ? 800 : 600, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: 20, borderTop: `1px solid ${C.border}` }}>
          <button onClick={logout} style={{ width: '100%', padding: '12px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>🚪</span> Chiqish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header (Mobile toggle) */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', background: C.card }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: C.text, fontSize: '1.5rem', cursor: 'pointer', marginRight: 16 }}>☰</button>
          <span style={{ color: C.text, fontWeight: 800 }}>Admin Panel</span>
        </div>

        {/* Content area */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, background: C.bg }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
