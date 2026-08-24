import React, { useState, useEffect } from 'react';

const C = { bg: '#0d0f1e', card: '#161830', card2: '#1a1d38', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0', green: '#22c55e', yellow: '#facc15', red: '#f43f5e' };

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }> = ({ label, value, icon, color, sub }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '20px 20px 0 0' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    </div>
    <p style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</p>
    <h2 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 900, marginBottom: 2 }}>{value}</h2>
    {sub && <p style={{ color: C.muted, fontSize: '0.72rem' }}>{sub}</p>}
  </div>
);

interface AdminDashboardPageProps { adminApi: any; }

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ adminApi }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.get('/admin/dashboard');
        setStats(res.data);
      } catch (e) {} finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>;

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: C.muted, fontSize: '0.82rem', marginBottom: 24 }}>Tizim statistikasi</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Foydalanuvchilar" value={stats?.totalUsers ?? 0} color={C.accent} icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <StatCard label="Buyurtmalar" value={stats?.totalOrders ?? 0} color={C.green} icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <StatCard label="Kutilayotgan to'lovlar" value={stats?.pendingTopUps ?? 0} color={C.yellow} sub="Tasdiqlash kerak" icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <StatCard label="Akkauntlar" value={stats?.totalAccounts ?? 0} color="#a855f7" icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <StatCard label="Umumiy daromad" value={`${(Number(stats?.totalRevenue) || 0).toLocaleString('uz-UZ')} UZS`} color={C.green} icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ color: C.text, fontWeight: 800, fontSize: '0.95rem' }}>So'nggi buyurtmalar</h3>
          </div>
          {stats.recentOrders.map((order: any) => (
            <div key={order.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: C.text, fontWeight: 700, fontSize: '0.85rem' }}>{order.buyer?.firstName || 'Noma\'lum'}</p>
                <p style={{ color: C.muted, fontSize: '0.72rem' }}>ID: {order.buyer?.telegramId}</p>
              </div>
              <span style={{ background: order.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : order.status === 'PENDING' ? 'rgba(250,204,21,0.15)' : 'rgba(111,120,240,0.15)', color: order.status === 'COMPLETED' ? C.green : order.status === 'PENDING' ? C.yellow : C.accent, padding: '4px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700 }}>{order.status}</span>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboardPage;
