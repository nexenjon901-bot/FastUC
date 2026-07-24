import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../api';
import {
  LayoutDashboard, ShoppingBag, CreditCard, Package,
  LogOut, RefreshCw, Plus, Pencil, Trash2, Check, X,
  ChevronRight, TrendingUp, Users, DollarSign, Boxes,
  Eye, EyeOff, ExternalLink, ImagePlus, AlertTriangle
} from 'lucide-react';

type Tab = 'dashboard' | 'orders' | 'topups' | 'accounts';

const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Ace Master', 'Ace Dominator', 'Conqueror'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  ESCROW_HELD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ADMIN_REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CREDENTIALS_SENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DISPUTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SOLD: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const AdminPage: React.FC = () => {
  const [email, setEmail] = useState('admin@fastpay.uz');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const [accountForm, setAccountForm] = useState({
    sku: '', title: '', rank: 'Ace', level: 50, skinsCount: 20,
    ucBalance: 0, price: 100000, description: '', login: '', password: '',
  });

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };
  const showErr = (e: string) => {
    setError(e);
    setTimeout(() => setError(''), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [o, t, s, a] = await Promise.all([
        adminApi.get('/admin/orders'),
        adminApi.get('/admin/topup-requests'),
        adminApi.get('/admin/stats'),
        adminApi.get('/admin/accounts'),
      ]);
      setOrders(o.data || []);
      setTopups(t.data || []);
      setStats(s.data || null);
      setAccounts(a.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) { localStorage.removeItem('admin_token'); setToken(null); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) loadData(); }, [token, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminApi.post('/admin/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.access_token);
      setToken(res.data.access_token);
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Email yoki parol xato');
    }
  };

  const logout = () => { localStorage.removeItem('admin_token'); setToken(null); };

  const markReview = async (id: string) => {
    try { await adminApi.patch(`/admin/orders/${id}/mark-review`); showMsg('Tekshiruv holatiga o\'tkazildi'); loadData(); }
    catch { showErr('Xatolik yuz berdi'); }
  };
  const sendCreds = async (id: string) => {
    try { await adminApi.patch(`/admin/orders/${id}/send-credentials`); showMsg('✅ Akkaunt ma\'lumotlari yuborildi'); loadData(); }
    catch { showErr('Xatolik yuz berdi'); }
  };
  const approveTopup = async (id: string) => {
    try { await adminApi.patch(`/admin/topup-requests/${id}/approve`); showMsg('✅ To\'lov tasdiqlandi'); loadData(); }
    catch { showErr('Xatolik yuz berdi'); }
  };
  const rejectTopup = async (id: string, reason?: string) => {
    const r = reason || prompt('Rad etish sababi:') || 'Rejected';
    try { await adminApi.patch(`/admin/topup-requests/${id}/reject`, { reason: r }); showMsg('To\'lov rad etildi'); loadData(); }
    catch { showErr('Xatolik yuz berdi'); }
  };
  const resolveDispute = async (disputeId: string, refund: boolean) => {
    try {
      await adminApi.patch(`/admin/disputes/${disputeId}/resolve`, {
        resolutionNote: refund ? 'Refunded' : 'Resolved without refund', refund,
      });
      showMsg(refund ? '💰 Pul qaytarildi' : '✅ Nizo yopildi');
      loadData();
    } catch { showErr('Xatolik yuz berdi'); }
  };

  const resetForm = () => {
    setAccountForm({ sku: '', title: '', rank: 'Ace', level: 50, skinsCount: 20, ucBalance: 0, price: 100000, description: '', login: '', password: '' });
    setImageUrls(['']);
    setEditingAccountId(null);
    setShowAccountForm(false);
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = imageUrls.filter(u => u.trim() !== '');
    try {
      if (editingAccountId) {
        await adminApi.patch(`/admin/accounts/${editingAccountId}`, {
          ...accountForm,
          level: Number(accountForm.level), skinsCount: Number(accountForm.skinsCount),
          ucBalance: Number(accountForm.ucBalance), price: Number(accountForm.price),
          ...(images.length ? { images } : {}),
        });
        showMsg('✅ Akkaunt yangilandi');
      } else {
        await adminApi.post('/admin/accounts', {
          ...accountForm,
          level: Number(accountForm.level), skinsCount: Number(accountForm.skinsCount),
          ucBalance: Number(accountForm.ucBalance), price: Number(accountForm.price),
          images,
        });
        showMsg('✅ Akkaunt qo\'shildi');
      }
      resetForm();
      loadData();
    } catch (err: any) {
      showErr(err.response?.data?.message || 'Akkaunt saqlanmadi');
    }
  };

  const startEdit = (acc: any) => {
    setAccountForm({
      sku: acc.sku || '', title: acc.title || '', rank: acc.rank || 'Ace',
      level: acc.level || 50, skinsCount: acc.skinsCount || 20, ucBalance: acc.ucBalance || 0,
      price: acc.price || 100000, description: acc.description || '', login: '', password: '',
    });
    setImageUrls(acc.images?.length ? acc.images : ['']);
    setEditingAccountId(acc.id);
    setShowAccountForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
    try { await adminApi.patch(`/admin/accounts/${id}/delete`); showMsg('Akkaunt o\'chirildi'); loadData(); }
    catch { showErr('O\'chirishda xatolik'); }
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders' as Tab, label: 'Buyurtmalar', icon: <ShoppingBag size={18} />, badge: orders.filter(o => ['ESCROW_HELD','ADMIN_REVIEW','DISPUTED'].includes(o.status)).length },
    { id: 'topups' as Tab, label: 'To\'lovlar', icon: <CreditCard size={18} />, badge: topups.filter(t => t.status === 'PENDING').length },
    { id: 'accounts' as Tab, label: 'Akkauntlar', icon: <Package size={18} /> },
  ];

  // LOGIN PAGE
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080a18] px-4" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.06) 0%, transparent 60%)' }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <span className="text-white font-black text-2xl">F</span>
            </div>
            <h1 className="text-white text-2xl font-black">FastPAY Admin</h1>
            <p className="text-[#6b7280] text-sm mt-1">Boshqaruv paneliga kirish</p>
          </div>

          <div className="bg-[#111827] rounded-2xl p-6 border border-white/5 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>
              <div>
                <label className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider block mb-2">Parol</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f172a] text-white px-4 py-3 pr-11 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors">
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0"/>
                  <p className="text-red-400 text-sm">{loginError}</p>
                </div>
              )}
              <button type="submit" className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                Kirish →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN PANEL
  return (
    <div className="min-h-screen bg-[#080a18] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#0d0f1e]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="text-white font-bold">FastPAY Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} disabled={loading} className="flex items-center gap-1.5 text-[#6b7280] hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
            <span className="hidden sm:inline">Yangilash</span>
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10">
            <LogOut size={15}/>
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[52px] z-30 bg-[#0d0f1e]/90 backdrop-blur-xl border-b border-white/5 px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all relative ${
                tab === item.id
                  ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20'
                  : 'text-[#6b7280] hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
              {(item.badge ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {(msg || error) && (
        <div className={`mx-4 mt-4 flex items-center gap-2 rounded-xl px-4 py-3 border text-sm font-semibold ${
          msg ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {msg ? <Check size={16}/> : <AlertTriangle size={16}/>}
          {msg || error}
        </div>
      )}

      <div className="p-4 pb-24 space-y-4">

        {/* ===== DASHBOARD ===== */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Jami Sotuvlar', value: `${Number(stats.totalSales||0).toLocaleString()} UZS`, icon: <DollarSign size={20}/>, color: 'text-[#facc15]', bg: 'bg-yellow-500/10' },
                { label: 'Foydalanuvchilar', value: stats.totalUsers || 0, icon: <Users size={20}/>, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Buyurtmalar', value: stats.totalOrders || 0, icon: <ShoppingBag size={20}/>, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Aktiv Akkauntlar', value: stats.activeAccounts || 0, icon: <Boxes size={20}/>, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((s, i) => (
                <div key={i} className="bg-[#111827] rounded-2xl p-4 border border-white/5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`${s.color} text-xl font-black`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="bg-[#111827] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#6366f1]"/>
                <h3 className="text-white font-bold text-sm">Kutilayotganlar</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[#9ca3af] text-sm">Kutilayotgan to'lovlar</span>
                  <span className="text-yellow-400 font-bold">{topups.filter(t => t.status === 'PENDING').length} ta</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[#9ca3af] text-sm">Aktiv buyurtmalar</span>
                  <span className="text-blue-400 font-bold">{orders.filter(o => !['COMPLETED','REFUNDED'].includes(o.status)).length} ta</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#9ca3af] text-sm">Nizolar</span>
                  <span className="text-red-400 font-bold">{orders.filter(o => o.status === 'DISPUTED').length} ta</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && !loading && (
              <div className="text-center py-16 text-[#6b7280]">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30"/>
                <p>Buyurtmalar yo'q</p>
              </div>
            )}
            {orders.map((o) => (
              <div key={o.id} className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{o.account?.title || 'Akkaunt'}</p>
                      <code className="text-[#6b7280] text-xs">{o.orderNumber}</code>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusColors[o.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-black">
                      {(o.buyer?.firstName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{o.buyer?.firstName || o.buyer?.username || 'Noma\'lum'}</p>
                      <p className="text-[#6b7280] text-xs">TG ID: {o.buyer?.telegramId}</p>
                    </div>
                    <p className="text-[#facc15] font-black text-base ml-auto">{Number(o.amount).toLocaleString()} UZS</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(o.status === 'ESCROW_HELD' || o.status === 'DISPUTED') && (
                      <button onClick={() => markReview(o.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] text-[#a5b4fc] text-xs font-bold border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors">
                        <Eye size={13}/> Review
                      </button>
                    )}
                    {['ESCROW_HELD', 'ADMIN_REVIEW', 'DISPUTED'].includes(o.status) && (
                      <button onClick={() => sendCreds(o.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] text-white text-xs font-bold hover:bg-[#4f46e5] transition-colors">
                        <ChevronRight size={13}/> Credentials Yuborish
                      </button>
                    )}
                    {o.disputes?.[0] && (
                      <>
                        <button onClick={() => resolveDispute(o.disputes[0].id, false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                          <Check size={13}/> Yopish
                        </button>
                        <button onClick={() => resolveDispute(o.disputes[0].id, true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">
                          <DollarSign size={13}/> Qaytarish
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== TOPUPS ===== */}
        {tab === 'topups' && (
          <div className="space-y-3">
            {topups.length === 0 && !loading && (
              <div className="text-center py-16 text-[#6b7280]">
                <CreditCard size={40} className="mx-auto mb-3 opacity-30"/>
                <p>To'lov so'rovlari yo'q</p>
              </div>
            )}
            {topups.map((t) => (
              <div key={t.id} className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[#facc15] font-black text-xl">{Number(t.amount).toLocaleString()} UZS</p>
                      <p className="text-[#9ca3af] text-xs mt-0.5">{t.method} · {new Date(t.createdAt).toLocaleString('uz-UZ')}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusColors[t.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-black">
                      {(t.user?.firstName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{t.user?.firstName || t.user?.username || 'Noma\'lum'}</p>
                      <p className="text-[#6b7280] text-xs">TG ID: {t.user?.telegramId}</p>
                    </div>
                  </div>

                  {t.userComment && (
                    <div className="bg-[#0f172a] rounded-xl px-3 py-2 mb-3 border border-white/5">
                      <p className="text-[#9ca3af] text-xs">{t.userComment}</p>
                    </div>
                  )}

                  {/* Proof image / link */}
                  {t.proofImageUrl && (
                    <div className="mb-3">
                      <p className="text-[#6b7280] text-xs mb-1.5 font-semibold uppercase tracking-wider">Chek (To'lov dalili)</p>
                      {t.proofImageUrl.startsWith('http') ? (
                        <a
                          href={t.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-[#1e293b] border border-blue-500/20 rounded-xl px-3 py-2.5 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors"
                        >
                          <ExternalLink size={14}/>
                          Chekni ko'rish
                        </a>
                      ) : (
                        <p className="text-[#9ca3af] text-xs bg-[#0f172a] rounded-xl px-3 py-2 border border-white/5 break-all">{t.proofImageUrl}</p>
                      )}
                    </div>
                  )}

                  {t.status === 'PENDING' && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => approveTopup(t.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors flex-1 justify-center">
                        <Check size={15}/> Tasdiqlash
                      </button>
                      <button onClick={() => rejectTopup(t.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors flex-1 justify-center">
                        <X size={15}/> Rad etish
                      </button>
                      <button onClick={() => rejectTopup(t.id, 'Soxta chek yuborildi')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600/80 text-white text-xs font-bold hover:bg-orange-500 transition-colors w-full justify-center">
                        <AlertTriangle size={13}/> Soxta chek
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== ACCOUNTS ===== */}
        {tab === 'accounts' && (
          <div className="space-y-4">
            {/* Toggle form button */}
            {!showAccountForm && (
              <button
                onClick={() => { resetForm(); setShowAccountForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#6366f1] text-white font-bold hover:bg-[#4f46e5] transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18}/> Yangi Akkaunt Qo'shish
              </button>
            )}

            {/* Account Form */}
            {showAccountForm && (
              <form onSubmit={createAccount} className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#0f172a]">
                  <h2 className="text-white font-bold">{editingAccountId ? '✏️ Akkauntni tahrirlash' : '➕ Yangi Akkaunt'}</h2>
                  <button type="button" onClick={resetForm} className="text-[#6b7280] hover:text-white transition-colors">
                    <X size={20}/>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {/* Basic info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">SKU *</label>
                      <input
                        className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                        value={accountForm.sku}
                        onChange={(e) => setAccountForm(f => ({...f, sku: e.target.value}))}
                        required placeholder="PG-001"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Narxi (UZS) *</label>
                      <input
                        type="number"
                        className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                        value={accountForm.price}
                        onChange={(e) => setAccountForm(f => ({...f, price: Number(e.target.value)}))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Sarlavha *</label>
                    <input
                      className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                      value={accountForm.title}
                      onChange={(e) => setAccountForm(f => ({...f, title: e.target.value}))}
                      required placeholder="Conqueror Akkaunt — M416 Max"
                    />
                  </div>

                  <div>
                    <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Rank</label>
                    <select
                      className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                      value={accountForm.rank}
                      onChange={(e) => setAccountForm(f => ({...f, rank: e.target.value}))}
                    >
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Level</label>
                      <input type="number" className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                        value={accountForm.level} onChange={(e) => setAccountForm(f => ({...f, level: Number(e.target.value)}))} />
                    </div>
                    <div>
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Skinlar</label>
                      <input type="number" className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                        value={accountForm.skinsCount} onChange={(e) => setAccountForm(f => ({...f, skinsCount: Number(e.target.value)}))} />
                    </div>
                    <div>
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">UC</label>
                      <input type="number" className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                        value={accountForm.ucBalance} onChange={(e) => setAccountForm(f => ({...f, ucBalance: Number(e.target.value)}))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider block mb-1.5">Tavsif</label>
                    <textarea
                      className="w-full bg-[#0f172a] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm resize-none"
                      value={accountForm.description}
                      onChange={(e) => setAccountForm(f => ({...f, description: e.target.value}))}
                      rows={3}
                      placeholder="Akkaunt haqida batafsil ma'lumot..."
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider">Rasm URL lari</label>
                      <button type="button" onClick={() => setImageUrls(u => [...u, ''])} className="text-[#6366f1] text-xs flex items-center gap-1 hover:text-[#a5b4fc] transition-colors">
                        <Plus size={12}/> Rasm qo'shish
                      </button>
                    </div>
                    {imageUrls.map((url, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <ImagePlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"/>
                          <input
                            type="url"
                            className="w-full bg-[#0f172a] text-white pl-8 pr-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                            value={url}
                            onChange={(e) => { const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u); }}
                            placeholder="https://..."
                          />
                        </div>
                        {imageUrls.length > 1 && (
                          <button type="button" onClick={() => setImageUrls(u => u.filter((_,j) => j !== i))} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex-shrink-0">
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    ))}
                    {imageUrls[0] && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {imageUrls.filter(u => u.trim()).map((u, i) => (
                          <img key={i} src={u} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Login/Password */}
                  <div className="bg-[#0f172a] rounded-xl p-3 border border-[#6366f1]/20 space-y-3">
                    <p className="text-[#6366f1] text-xs font-bold uppercase tracking-wider">🔐 Akkaunt kirish ma'lumotlari</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#6b7280] text-xs block mb-1.5">Login *</label>
                        <input
                          className="w-full bg-[#111827] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                          value={accountForm.login}
                          onChange={(e) => setAccountForm(f => ({...f, login: e.target.value}))}
                          required={!editingAccountId}
                          placeholder={editingAccountId ? 'O\'zgartirilmaydi' : 'Login...'}
                        />
                      </div>
                      <div>
                        <label className="text-[#6b7280] text-xs block mb-1.5">Parol *</label>
                        <input
                          type="password"
                          className="w-full bg-[#111827] text-white px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-[#6366f1] transition-colors text-sm"
                          value={accountForm.password}
                          onChange={(e) => setAccountForm(f => ({...f, password: e.target.value}))}
                          required={!editingAccountId}
                          placeholder={editingAccountId ? 'O\'zgartirilmaydi' : 'Parol...'}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-base shadow-lg shadow-indigo-500/20">
                    {editingAccountId ? '💾 Saqlash' : '➕ Qo\'shish'}
                  </button>
                </div>
              </form>
            )}

            {/* Accounts list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">Mavjud Akkauntlar ({accounts.length})</h3>
              </div>
              {accounts.length === 0 && !loading && (
                <div className="text-center py-12 text-[#6b7280]">
                  <Package size={40} className="mx-auto mb-3 opacity-30"/>
                  <p>Akkauntlar yo'q</p>
                </div>
              )}
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex gap-3 p-4">
                    {acc.images?.[0] ? (
                      <img src={acc.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10"/>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#1e293b] flex items-center justify-center flex-shrink-0 border border-white/5">
                        <Package size={24} className="text-[#6b7280]"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{acc.title}</p>
                      <p className="text-[#6b7280] text-xs mt-0.5">{acc.sku} · {acc.rank} · Lv.{acc.level}</p>
                      <p className="text-[#facc15] font-black text-base mt-1">{Number(acc.price).toLocaleString()} UZS</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border self-start ${statusColors[acc.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {acc.status}
                    </span>
                  </div>
                  <div className="flex border-t border-white/5">
                    <button onClick={() => startEdit(acc)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[#a5b4fc] text-sm font-semibold hover:bg-white/5 transition-colors">
                      <Pencil size={14}/> Tahrirlash
                    </button>
                    <div className="w-px bg-white/5"/>
                    <button onClick={() => deleteAccount(acc.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14}/> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
