import React, { useState, useEffect } from 'react';

const C = { bg: '#0d0f1e', card: '#161830', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0', green: '#22c55e', red: '#f43f5e' };

interface AdminAccountsPageProps { adminApi: any; }

const AdminAccountsPage: React.FC<AdminAccountsPageProps> = ({ adminApi }) => {
  const [data, setData] = useState<any>({ accounts: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ title: '', price: '', loginMethod: '', loginData: '', passwordData: '', rank: '', level: '', rpStatus: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/admin/accounts?page=${page}&limit=20`);
      setData(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.post('/admin/accounts', { ...newAcc, price: Number(newAcc.price), level: Number(newAcc.level) });
      setShowAdd(false);
      setNewAcc({ title: '', price: '', loginMethod: '', loginData: '', passwordData: '', rank: '', level: '', rpStatus: '' });
      load();
    } catch (e: any) { alert(e.response?.data?.message || 'Xatolik'); }
    finally { setActionLoading(false); }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Akkauntni o'chirib tashlaysizmi?")) return;
    try { await adminApi.delete(`/admin/accounts/${id}`); load(); }
    catch (e) { alert('Xatolik'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>PUBG Akkauntlar</h1>
          <p style={{ color: C.muted, fontSize: '0.82rem' }}>Sotuvdagi akkauntlarni boshqarish</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: 'linear-gradient(135deg, #6F78F0, #5a63c8)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>+</span> Yangi qo'shish
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {data.accounts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Akkauntlar yo'q</div>
          ) : data.accounts.map((acc: any, idx: number) => (
            <div key={acc.id} style={{ padding: '14px 20px', borderBottom: idx < data.accounts.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: '#1a1d38', border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}>
                  🎮
                </div>
                <div>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: '0.95rem' }}>{acc.title}</p>
                  <p style={{ color: C.muted, fontSize: '0.72rem' }}>{Number(acc.price).toLocaleString()} UZS • {acc.status}</p>
                </div>
              </div>
              <button onClick={() => deleteAccount(acc.id)} style={{ background: 'transparent', color: C.red, border: 'none', cursor: 'pointer', padding: 8, fontSize: '1rem' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 450 }}>
            <h3 style={{ color: C.text, fontWeight: 900, fontSize: '1.2rem', marginBottom: 20 }}>Yangi Akkaunt Qo'shish</h3>
            <form onSubmit={addAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Sarlavha (Title)</label>
                <input required value={newAcc.title} onChange={e => setNewAcc({...newAcc, title: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Narxi (UZS)</label>
                  <input type="number" required value={newAcc.price} onChange={e => setNewAcc({...newAcc, price: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Daraja (Level)</label>
                  <input type="number" value={newAcc.level} onChange={e => setNewAcc({...newAcc, level: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Rank</label>
                  <input value={newAcc.rank} onChange={e => setNewAcc({...newAcc, rank: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>RP Status</label>
                  <input value={newAcc.rpStatus} onChange={e => setNewAcc({...newAcc, rpStatus: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Ulanish (Login Method - Ex: Twitter)</label>
                <input required value={newAcc.loginMethod} onChange={e => setNewAcc({...newAcc, loginMethod: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Login (Yashirin)</label>
                  <input required value={newAcc.loginData} onChange={e => setNewAcc({...newAcc, loginData: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Parol (Yashirin)</label>
                  <input required type="password" value={newAcc.passwordData} onChange={e => setNewAcc({...newAcc, passwordData: e.target.value})} style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px', color: C.muted, fontWeight: 700, cursor: 'pointer' }}>Bekor</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, background: C.accent, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 800, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>{actionLoading ? 'Saqlanmoqda...' : 'Qo\'shish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminAccountsPage;
