import React, { useState, useEffect } from 'react';

const C = { bg: '#0d0f1e', card: '#161830', border: '#2a2f5e', accent: '#6F78F0', text: '#F5F5FF', muted: '#7880b0', green: '#22c55e', yellow: '#facc15', red: '#f43f5e' };

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#facc15', CREDENTIALS_SENT: '#6F78F0', COMPLETED: '#22c55e', CANCELLED: '#f43f5e', DISPUTED: '#f97316'
};

interface AdminOrdersPageProps { adminApi: any; }

const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ adminApi }) => {
  const [data, setData] = useState<any>({ orders: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await adminApi.get(`/admin/orders?${params}`);
      setData(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const sendCreds = async (id: string) => {
    setActionLoading(id + '_creds');
    try { await adminApi.patch(`/admin/orders/${id}/send-credentials`); load(); }
    catch (e) { alert('Xatolik'); } finally { setActionLoading(null); }
  };

  const resolve = async (id: string) => {
    setActionLoading(id + '_resolve');
    try { await adminApi.patch(`/admin/orders/${id}/resolve`); load(); }
    catch (e) { alert('Xatolik'); } finally { setActionLoading(null); }
  };

  const statuses = ['', 'PENDING', 'CREDENTIALS_SENT', 'COMPLETED', 'CANCELLED', 'DISPUTED'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>Buyurtmalar</h1>
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
          {data.orders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Buyurtmalar yo'q</div>
          ) : data.orders.map((order: any, idx: number) => (
            <div key={order.id} style={{ padding: '16px 20px', borderBottom: idx < data.orders.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem' }}>{order.buyer?.firstName || 'Noma\'lum'}</span>
                    <span style={{ color: C.muted, fontSize: '0.72rem' }}>@{order.buyer?.username || order.buyer?.telegramId}</span>
                  </div>
                  <p style={{ color: C.muted, fontSize: '0.72rem', marginBottom: 8 }}>
                    {order.items?.[0]?.account?.title || 'Akkaunt'} • {new Date(order.createdAt).toLocaleString('uz-UZ')}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {order.status === 'PENDING' && (
                      <button onClick={() => sendCreds(order.id)} disabled={actionLoading === order.id + '_creds'} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {actionLoading === order.id + '_creds' ? '...' : '📤 Kredensialni yuborish'}
                      </button>
                    )}
                    {order.status === 'CREDENTIALS_SENT' && (
                      <button onClick={() => resolve(order.id)} disabled={actionLoading === order.id + '_resolve'} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {actionLoading === order.id + '_resolve' ? '...' : '✅ Yakunlash'}
                      </button>
                    )}
                  </div>
                </div>
                <span style={{ background: `${STATUS_COLORS[order.status] || C.muted}20`, color: STATUS_COLORS[order.status] || C.muted, padding: '4px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{order.status}</span>
              </div>
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
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminOrdersPage;
