import React, { useState, useEffect } from 'react';

const C = { bg: '#0d0f1e', card: '#161830', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0', green: '#22c55e', red: '#f43f5e' };

interface AdminUsersPageProps { adminApi: any; }

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ adminApi }) => {
  const [data, setData] = useState<any>({ users: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await adminApi.get(`/admin/users?${params}`);
      setData(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const updateBalance = async () => {
    if (!editUser || !editAmount) return;
    setActionLoading(true);
    try {
      await adminApi.patch(`/admin/users/${editUser.id}/balance`, { amount: Number(editAmount) });
      setEditUser(null); setEditAmount('');
      load();
    } catch (e: any) { alert(e.response?.data?.message || 'Xatolik'); }
    finally { setActionLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>Foydalanuvchilar</h1>
          <p style={{ color: C.muted, fontSize: '0.82rem' }}>Jami: {data.total}</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Qidirish..." style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 14px', color: C.text, fontSize: '0.82rem', outline: 'none', width: 200 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {data.users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Foydalanuvchilar yo'q</div>
          ) : data.users.map((user: any, idx: number) => (
            <div key={user.id} style={{ padding: '14px 20px', borderBottom: idx < data.users.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6F78F0, #5a63c8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                  {user.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem' }}>{user.firstName || 'Noma\'lum'}</p>
                  <p style={{ color: C.muted, fontSize: '0.72rem' }}>@{user.username || ''} • ID: {user.telegramId}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: C.green, fontWeight: 800, fontSize: '0.88rem' }}>{Number(user.balance).toLocaleString()} UZS</p>
                <p style={{ color: C.muted, fontSize: '0.7rem' }}>{user._count?.orders || 0} buyurtma</p>
              </div>
              <button onClick={() => { setEditUser(user); setEditAmount(''); }} style={{ background: 'rgba(111,120,240,0.15)', border: `1px solid ${C.accent}`, borderRadius: 10, padding: '6px 12px', color: C.accent, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                Balans
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: page === 1 ? C.muted : C.text, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>← Oldingi</button>
          <span style={{ background: C.accent, color: '#fff', borderRadius: 10, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}>{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: page === data.totalPages ? C.muted : C.text, cursor: page === data.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>Keyingi →</button>
        </div>
      )}

      {/* Balance Edit Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setEditUser(null); }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 380 }}>
            <h3 style={{ color: C.text, fontWeight: 900, fontSize: '1.1rem', marginBottom: 4 }}>Balansni o'zgartirish</h3>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginBottom: 20 }}>{editUser.firstName} • Hozirgi: {Number(editUser.balance).toLocaleString()} UZS</p>
            <label style={{ color: C.muted, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Miqdor (+ qo'shish, - ayirish)</label>
            <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Masalan: 50000 yoki -10000" style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', color: C.text, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }} onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px', color: C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>Bekor</button>
              <button onClick={updateBalance} disabled={actionLoading || !editAmount} style={{ flex: 2, background: actionLoading ? C.border : 'linear-gradient(135deg, #6F78F0, #5a63c8)', border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 800, cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '0.88rem' }}>
                {actionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminUsersPage;
