import React, { useState, useEffect } from 'react';

const C = { bg: '#0d0f1e', card: '#161830', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0', green: '#22c55e', yellow: '#facc15', red: '#f43f5e' };

interface AdminTopUpPageProps { adminApi: any; }

const AdminTopUpPage: React.FC<AdminTopUpPageProps> = ({ adminApi }) => {
  const [data, setData] = useState<any>({ requests: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await adminApi.get(`/admin/topup-requests?${params}`);
      setData(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const approve = async (id: string) => {
    setActionLoading(id + '_app');
    try { await adminApi.patch(`/admin/topup-requests/${id}/approve`); load(); }
    catch (e: any) { alert(e.response?.data?.message || 'Xatolik'); }
    finally { setActionLoading(null); }
  };

  const reject = async (id: string) => {
    if (!confirm("Rad etishni tasdiqlaysizmi?")) return;
    setActionLoading(id + '_rej');
    try { await adminApi.patch(`/admin/topup-requests/${id}/reject`); load(); }
    catch (e: any) { alert(e.response?.data?.message || 'Xatolik'); }
    finally { setActionLoading(null); }
  };

  const statuses = ['', 'PENDING', 'APPROVED', 'REJECTED'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>To'lov So'rovlari</h1>
          <p style={{ color: C.muted, fontSize: '0.82rem' }}>Jami: {data.total}</p>
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 14px', color: C.text, fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
          {statuses.map(s => <option key={s} value={s}>{s || 'Barchasi'}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {data.requests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>So'rovlar yo'q</div>
          ) : data.requests.map((req: any, idx: number) => (
            <div key={req.id} style={{ padding: '18px 20px', borderBottom: idx < data.requests.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>{req.user?.firstName || 'Noma\'lum'}</span>
                    <span style={{ color: C.muted, fontSize: '0.72rem' }}>@{req.user?.username || req.user?.telegramId}</span>
                    <span style={{
                      background: req.status === 'PENDING' ? 'rgba(250,204,21,0.15)' : req.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)',
                      color: req.status === 'PENDING' ? C.yellow : req.status === 'APPROVED' ? C.green : C.red,
                      padding: '2px 8px', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 700
                    }}>{req.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: req.status === 'PENDING' ? 12 : 0 }}>
                    <span style={{ color: C.green, fontWeight: 800, fontSize: '1.1rem' }}>{Number(req.amount).toLocaleString()} UZS</span>
                    <span style={{ color: C.muted, fontSize: '0.78rem', alignSelf: 'flex-end' }}>{req.method} • {new Date(req.createdAt).toLocaleString('uz-UZ')}</span>
                  </div>
                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button onClick={() => approve(req.id)} disabled={actionLoading === req.id + '_app'} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                        {actionLoading === req.id + '_app' ? '...' : '✅ Tasdiqlash'}
                      </button>
                      <button onClick={() => reject(req.id)} disabled={actionLoading === req.id + '_rej'} style={{ background: 'rgba(244,63,94,0.15)', color: C.red, border: `1px solid rgba(244,63,94,0.3)`, borderRadius: 10, padding: '8px 18px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                        {actionLoading === req.id + '_rej' ? '...' : '❌ Rad etish'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: page === 1 ? C.muted : C.text, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>← Oldingi</button>
          <span style={{ background: C.accent, color: '#fff', borderRadius: 10, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}>{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: page === data.totalPages ? C.muted : C.text, cursor: page === data.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>Keyingi →</button>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminTopUpPage;
