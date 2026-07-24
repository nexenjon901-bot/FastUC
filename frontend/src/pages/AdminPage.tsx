import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';

type Tab = 'dashboard' | 'orders' | 'topups' | 'accounts';

const AdminPage: React.FC = () => {
  const [email, setEmail] = useState('admin@fastpay.uz');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState({
    sku: '',
    title: '',
    rank: 'Ace',
    level: 50,
    skinsCount: 20,
    ucBalance: 0,
    price: 100000,
    description: '',
    login: '',
    password: '',
  });

  const loadData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [o, t, s, a] = await Promise.all([
        adminApi.get('/admin/orders'),
        adminApi.get('/admin/topup-requests'),
        adminApi.get('/admin/stats'),
        adminApi.get('/admin/accounts') 
      ]);
      setOrders(o.data || []);
      setTopups(t.data || []);
      setStats(s.data || null);
      setAccounts(a.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Maʼlumot yuklanmadi');
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminApi.post('/admin/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.access_token);
      setToken(res.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email yoki parol xato');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const markReview = async (id: string) => {
    await adminApi.patch(`/admin/orders/${id}/mark-review`);
    setMsg('Tekshiruv holatiga o‘tkazildi');
    loadData();
  };

  const sendCreds = async (id: string) => {
    await adminApi.patch(`/admin/orders/${id}/send-credentials`);
    setMsg('Credential yuborildi');
    loadData();
  };

  const approveTopup = async (id: string) => {
    await adminApi.patch(`/admin/topup-requests/${id}/approve`);
    setMsg('To‘lov tasdiqlandi');
    loadData();
  };

  const rejectTopup = async (id: string, customReason?: string) => {
    const reason = customReason || prompt('Rad etish sababi:') || 'Rejected';
    if (!reason) return;
    await adminApi.patch(`/admin/topup-requests/${id}/reject`, { reason });
    setMsg('To‘lov rad etildi');
    loadData();
  };

  const resolveDispute = async (disputeId: string, refund: boolean) => {
    await adminApi.patch(`/admin/disputes/${disputeId}/resolve`, {
      resolutionNote: refund ? 'Refunded' : 'Resolved without refund',
      refund,
    });
    setMsg(refund ? 'Pul qaytarildi' : 'Nizo yopildi');
    loadData();
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingAccountId) {
        await adminApi.patch(`/admin/accounts/${editingAccountId}`, {
          ...accountForm,
          level: Number(accountForm.level),
          skinsCount: Number(accountForm.skinsCount),
          ucBalance: Number(accountForm.ucBalance),
          price: Number(accountForm.price),
        });
        setMsg('Akkaunt yangilandi');
      } else {
        await adminApi.post('/admin/accounts', {
          ...accountForm,
          level: Number(accountForm.level),
          skinsCount: Number(accountForm.skinsCount),
          ucBalance: Number(accountForm.ucBalance),
          price: Number(accountForm.price),
          images: [],
        });
        setMsg('Akkaunt qo‘shildi');
      }
      setEditingAccountId(null);
      setAccountForm({
        sku: '', title: '', rank: 'Ace', level: 50, skinsCount: 20,
        ucBalance: 0, price: 100000, description: '', login: '', password: '',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Akkaunt saqlanmadi');
    }
  };

  const startEditAccount = (acc: any) => {
    setAccountForm({
      sku: acc.sku || '',
      title: acc.title || '',
      rank: acc.rank || 'Ace',
      level: acc.level || 50,
      skinsCount: acc.skinsCount || 20,
      ucBalance: acc.ucBalance || 0,
      price: acc.price || 100000,
      description: acc.description || '',
      login: '', // We don't fetch login/pass for security, so we leave it empty.
      password: '',
    });
    setEditingAccountId(acc.id);
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Rostdan ham o‘chirmoqchimisiz?')) return;
    try {
      await adminApi.patch(`/admin/accounts/${id}/delete`);
      setMsg('Akkaunt o‘chirildi');
      loadData();
    } catch (e) {
      setError('O‘chirishda xatolik');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1020] px-4">
        <div className="bg-[#1a1c33] p-6 rounded-2xl w-full max-w-sm shadow-xl border border-white/5">
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Panel</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[#8b92b8] text-sm block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f1020] text-white px-4 py-3 rounded-xl border border-white/10 outline-none"
              />
            </div>
            <div>
              <label className="text-[#8b92b8] text-sm block mb-1">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1020] text-white px-4 py-3 rounded-xl border border-white/10 outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#6366f1] text-white font-medium py-3 rounded-xl"
            >
              Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0f1020] min-h-screen pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={loadData} className="text-sm text-[#a5b4fc] px-3 py-1.5">
            Yangilash
          </button>
          <button onClick={logout} className="text-sm text-red-300 px-3 py-1.5">
            Chiqish
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
        {(
          [
            ['dashboard', 'Dashboard'],
            ['orders', 'Buyurtmalar'],
            ['topups', 'To‘lovlar'],
            ['accounts', 'Akkaunt'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              tab === k ? 'bg-[#6366f1] text-white shadow-lg' : 'bg-[#1a1c33] text-[#8b92b8] hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm mb-4 font-semibold">{msg}</div>}
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-4 font-semibold">{error}</div>}
      {loading && <p className="text-[#8b92b8] text-sm mb-3">Yuklanmoqda...</p>}

      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1a1c33] p-4 rounded-2xl border border-white/5">
            <p className="text-[#8b92b8] text-xs font-bold uppercase mb-1">Jami Sotuvlar</p>
            <p className="text-[#facc15] text-xl font-black">{Number(stats.totalSales).toLocaleString()} UZS</p>
          </div>
          <div className="bg-[#1a1c33] p-4 rounded-2xl border border-white/5">
            <p className="text-[#8b92b8] text-xs font-bold uppercase mb-1">Foydalanuvchilar</p>
            <p className="text-white text-xl font-black">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#1a1c33] p-4 rounded-2xl border border-white/5">
            <p className="text-[#8b92b8] text-xs font-bold uppercase mb-1">Buyurtmalar</p>
            <p className="text-[#6366f1] text-xl font-black">{stats.totalOrders}</p>
          </div>
          <div className="bg-[#1a1c33] p-4 rounded-2xl border border-white/5">
            <p className="text-[#8b92b8] text-xs font-bold uppercase mb-1">Aktiv Akkauntlar</p>
            <p className="text-emerald-400 text-xl font-black">{stats.activeAccounts}</p>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <p className="text-[#8b92b8]">Buyurtmalar yo‘q</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="bg-[#1a1c33] rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-bold text-sm">{o.account?.title}</p>
                  <code className="text-[#8b92b8] text-xs">{o.orderNumber}</code>
                  <p className="text-[#8b92b8] text-xs mt-1">
                    {o.buyer?.firstName || o.buyer?.username} · TG {o.buyer?.telegramId}
                  </p>
                </div>
                <span className="text-[11px] text-[#a5b4fc] font-bold">{o.status}</span>
              </div>
              <p className="text-[#facc15] font-bold text-sm mb-3">
                {Number(o.amount).toLocaleString()} UZS
              </p>
              <div className="flex flex-wrap gap-2">
                {(o.status === 'ESCROW_HELD' || o.status === 'DISPUTED') && (
                  <button
                    onClick={() => markReview(o.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#334155] text-white text-xs"
                  >
                    Review
                  </button>
                )}
                {['ESCROW_HELD', 'ADMIN_REVIEW', 'DISPUTED'].includes(o.status) && (
                  <button
                    onClick={() => sendCreds(o.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#6366f1] text-white text-xs"
                  >
                    Send credentials
                  </button>
                )}
                {o.disputes?.[0] && (
                  <>
                    <button
                      onClick={() => resolveDispute(o.disputes[0].id, false)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => resolveDispute(o.disputes[0].id, true)}
                      className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs"
                    >
                      Refund
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'topups' && (
        <div className="space-y-3">
          {topups.length === 0 && <p className="text-[#8b92b8]">So‘rovlar yo‘q</p>}
          {topups.map((t) => (
            <div key={t.id} className="bg-[#1a1c33] rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-white font-bold">
                    {Number(t.amount).toLocaleString()} UZS
                  </p>
                  <p className="text-[#8b92b8] text-xs">
                    {t.user?.firstName || t.user?.username} · {t.method}
                  </p>
                  {t.userComment && (
                    <p className="text-[#8b92b8] text-xs mt-1">{t.userComment}</p>
                  )}
                </div>
                <span className="text-[11px] text-[#a5b4fc] font-bold">{t.status}</span>
              </div>
              {t.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => approveTopup(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Qabul qilish
                  </button>
                  <button
                    onClick={() => rejectTopup(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                  >
                    Rad etish
                  </button>
                  <button
                    onClick={() => rejectTopup(t.id, 'Soxta chek yuborildi')}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold"
                  >
                    Soxta chek
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'accounts' && (
                <div className="space-y-6">
                <form onSubmit={createAccount} className="bg-[#1a1c33] rounded-2xl p-4 space-y-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-white font-bold">{editingAccountId ? 'Akkauntni tahrirlash' : 'Yangi Akkaunt'}</h2>
                    {editingAccountId && (
                      <button type="button" onClick={() => {
                        setEditingAccountId(null);
                        setAccountForm({ sku: '', title: '', rank: 'Ace', level: 50, skinsCount: 20, ucBalance: 0, price: 100000, description: '', login: '', password: '' });
                      }} className="text-xs text-red-400">Bekor qilish</button>
                    )}
                  </div>
                  {(
                    [
                      ['sku', 'SKU'],
                      ['title', 'Title'],
                      ['rank', 'Rank'],
                      ['level', 'Level'],
                      ['skinsCount', 'Skins'],
                      ['ucBalance', 'UC'],
                      ['price', 'Price UZS'],
                      ['login', 'Login'],
                      ['password', 'Password'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="text-[#8b92b8] text-xs block mb-1">{label}</label>
                      <input
                        className="w-full bg-[#0f1020] text-white px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#6366f1]"
                        value={(accountForm as any)[key]}
                        onChange={(e) =>
                          setAccountForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        required={['sku', 'title', 'price'].includes(key) || (!editingAccountId && ['login', 'password'].includes(key))}
                        type={key === 'password' ? 'password' : 'text'}
                        placeholder={editingAccountId && ['login', 'password'].includes(key) ? 'O‘zgartirilmaydi (kiritmang)' : ''}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[#8b92b8] text-xs block mb-1">Description</label>
                    <textarea
                      className="w-full bg-[#0f1020] text-white px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#6366f1]"
                      value={accountForm.description}
                      onChange={(e) => setAccountForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#6366f1] text-white py-3 rounded-xl font-bold transition-all active:scale-95">
                    {editingAccountId ? 'Saqlash' : 'Qo‘shish'}
                  </button>
                </form>
      
                <div className="space-y-3">
                  <h3 className="text-white font-bold">Mavjud Akkauntlar</h3>
                  {accounts.map(acc => (
                    <div key={acc.id} className="bg-[#1a1c33] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{acc.title} <span className="text-[#8b92b8] text-xs">({acc.sku})</span></p>
                        <p className="text-[#facc15] font-black text-sm">{Number(acc.price).toLocaleString()} UZS</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditAccount(acc)} className="px-3 py-1.5 bg-[#334155] rounded-lg text-xs font-bold text-white">Edit</button>
                        <button onClick={() => deleteAccount(acc.id)} className="px-3 py-1.5 bg-red-900/50 text-red-400 rounded-lg text-xs font-bold border border-red-900/50">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
      )}
    </div>
  );
};

export default AdminPage;
