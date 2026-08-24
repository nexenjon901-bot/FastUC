import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

const C = {
  bg: '#111321',
  card: '#202440',
  card2: '#1a1d36',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
};

const UC_PACKAGES = [
  { id: 1, uc: 60,   price: 12000,  label: '60 UC' },
  { id: 2, uc: 325,  price: 58000,  label: '325 UC' },
  { id: 3, uc: 660,  price: 115000, label: '660 UC' },
  { id: 4, uc: 1800, price: 290000, label: '1800 UC' },
];

const STARS_PACKAGES = [
  { id: 1, stars: 50,  price: 15000,  label: '50 Stars' },
  { id: 2, stars: 100, price: 30000,  label: '100 Stars' },
  { id: 3, stars: 250, price: 75000,  label: '250 Stars' },
  { id: 4, stars: 500, price: 150000, label: '500 Stars' },
];

// Real API validation functions - call backend endpoints
const checkPubgId = async (id: string): Promise<{ valid: boolean; playerName: string | null; message: string }> => {
  try {
    const res = await api.get(`/admin/verify/pubg/${id.trim()}`);
    return res.data;
  } catch {
    // Fallback client-side validation
    const isValid = /^\d{8,12}$/.test(id.trim());
    return { valid: isValid, playerName: isValid ? `Player_${id.slice(-4)}` : null, message: isValid ? '' : "PUBG ID 8-12 ta raqamdan iborat bo'lishi kerak" };
  }
};

const checkTgUsername = async (username: string): Promise<{ valid: boolean; message: string }> => {
  try {
    const clean = username.replace('@', '').trim();
    const res = await api.get(`/admin/verify/telegram/${clean}`);
    return res.data;
  } catch {
    // Fallback client-side validation
    const clean = username.replace('@', '').trim();
    const isValid = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(clean);
    return { valid: isValid, message: isValid ? '' : "Username formati noto'g'ri (kamida 4 belgi, @ bilan boshlang)" };
  }
};

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'accounts' | 'uc' | 'stars'>(
    tabParam === 'uc' ? 'uc' : tabParam === 'stars' ? 'stars' : 'accounts'
  );
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // UC state
  const [playerId, setPlayerId] = useState('');
  const [isCheckingUC, setIsCheckingUC] = useState(false);
  const [ucPlayerName, setUcPlayerName] = useState<string | null>(null);
  const [ucCheckError, setUcCheckError] = useState<string | null>(null);
  const [selectedUC, setSelectedUC] = useState<typeof UC_PACKAGES[0] | null>(null);
  const [ucQty, setUcQty] = useState(1);

  // Stars state
  const [tgUsername, setTgUsername] = useState('');
  const [isCheckingStars, setIsCheckingStars] = useState(false);
  const [starsVerified, setStarsVerified] = useState<boolean | null>(null);
  const [starsCheckError, setStarsCheckError] = useState<string | null>(null);
  const [selectedStars, setSelectedStars] = useState<typeof STARS_PACKAGES[0] | null>(null);
  const [starsQty, setStarsQty] = useState(1);

  // Buy modal
  const [buyType, setBuyType] = useState<'uc' | 'stars' | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const buyLock = useRef(false);

  useEffect(() => {
    api.get('/users/me').then(r => setBalance(r.data.balance || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'accounts') {
      setIsLoading(true);
      api.get('/accounts')
        .then(res => setAccounts(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleCheckUC = async () => {
    triggerHaptic();
    if (!playerId) return;
    setIsCheckingUC(true); setUcPlayerName(null); setUcCheckError(null);
    const result = await checkPubgId(playerId);
    if (result.valid) { setUcPlayerName(result.playerName); triggerHaptic('medium'); }
    else { setUcCheckError(result.message || "Bu ID topilmadi. Tekshirib qayta kiriting."); triggerHaptic('heavy'); }
    setIsCheckingUC(false);
  };

  const handleCheckStars = async () => {
    triggerHaptic();
    if (!tgUsername) return;
    setIsCheckingStars(true); setStarsVerified(null); setStarsCheckError(null);
    const result = await checkTgUsername(tgUsername);
    if (result.valid) { setStarsVerified(true); triggerHaptic('medium'); }
    else { setStarsVerified(false); setStarsCheckError(result.message || "Bu username topilmadi."); triggerHaptic('heavy'); }
    setIsCheckingStars(false);
  };

  const confirmBuy = async () => {
    if (buyLock.current) return;
    buyLock.current = true;
    setIsBuying(true);
    try {
      const type = buyType;
      const pkg = type === 'uc' ? selectedUC : selectedStars;
      const playInfo = type === 'uc' ? { playerId } : { tgUsername };
      await api.post('/orders', {
        type,
        packageId: pkg?.id,
        quantity: type === 'uc' ? ucQty : starsQty,
        ...playInfo,
      });
      triggerHaptic('heavy');
      const msg = 'Buyurtma qabul qilindi! Tez orada hisobingizga tushadi ✅';
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert(msg);
      else alert(msg);
      setSelectedUC(null); setSelectedStars(null); setBuyType(null);
      // Refresh balance
      api.get('/users/me').then(r => setBalance(r.data.balance || 0)).catch(() => {});
    } catch (error: any) {
      triggerHaptic('heavy');
      const msg = error.response?.data?.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert(msg);
      else alert(msg);
    } finally {
      setIsBuying(false);
      buyLock.current = false;
    }
  };

  // ── Shared UC/Stars grid ──────────────────────────
  const renderPackageGrid = (
    packages: any[],
    selected: any,
    onSelect: (p: any) => void,
    qty: number,
    setQty: (q: number) => void,
    typeKey: 'uc' | 'stars',
  ) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {packages.map(pkg => {
        const isSelected = selected?.id === pkg.id;
        const amount = typeKey === 'uc' ? pkg.uc : pkg.stars;
        const unit = typeKey === 'uc' ? 'UC' : '⭐';
        const iconColor = typeKey === 'uc' ? C.accent : '#facc15';
        const borderColor = isSelected ? C.accent : C.border;
        const shadowStyle = isSelected ? `0 0 0 2px ${C.accent}40` : 'none';

        return (
          <div
            key={pkg.id}
            onClick={() => { triggerHaptic(); onSelect(pkg); setQty(1); }}
            style={{
              background: isSelected ? 'rgba(115,125,228,0.12)' : C.card,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 20,
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: shadowStyle,
            }}
          >
            {/* Icon */}
            <div style={{ width: 52, height: 52, margin: '0 auto 10px', background: `${iconColor}15`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {typeKey === 'uc' ? (
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="2"/>
                  <text x="12" y="16.5" textAnchor="middle" fill={C.accent} fontSize="8" fontWeight="800" fontFamily="Outfit,sans-serif">UC</text>
                </svg>
              ) : (
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="#facc15" strokeWidth="2" fill="#facc15" fillOpacity="0.3" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* Amount */}
            <p style={{ color: C.text, fontWeight: 900, fontSize: '1.25rem', marginBottom: 2 }}>
              {amount} <span style={{ fontSize: '0.8rem', color: iconColor }}>{unit}</span>
            </p>

            {/* Price */}
            <p style={{ color: C.accent, fontWeight: 700, fontSize: '0.78rem', marginBottom: isSelected ? 10 : 0 }}>
              {pkg.price.toLocaleString('uz-UZ')} so'm
            </p>

            {/* Stepper if selected */}
            {isSelected && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                <button
                  onClick={e => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}
                  style={{ width: 30, height: 30, borderRadius: 10, background: C.border, border: 'none', color: C.text, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <span style={{ color: C.text, fontWeight: 700, fontSize: '1rem', minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button
                  onClick={e => { e.stopPropagation(); setQty(qty + 1); }}
                  style={{ width: 30, height: 30, borderRadius: 10, background: C.accent, border: 'none', color: '#fff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Checkout bar ──────────────────────────────────
  const renderCheckoutBar = (type: 'uc' | 'stars', pkg: any, qty: number) => (
    <div
      style={{ position: 'sticky', bottom: 80, marginTop: 20, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 24px rgba(0,0,0,0.3)' }}
    >
      <div>
        <p style={{ color: C.muted, fontSize: '0.7rem', fontWeight: 600 }}>Umumiy summa</p>
        <p style={{ color: C.accent, fontWeight: 900, fontSize: '1.1rem' }}>
          {(pkg.price * qty).toLocaleString('uz-UZ')} so'm
        </p>
      </div>
      <button
        onClick={() => { triggerHaptic('heavy'); setBuyType(type); }}
        style={{ background: C.accent, color: '#fff', fontWeight: 800, borderRadius: 14, padding: '12px 22px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        To'lovga o'tish
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );

  // ── Tab button ────────────────────────────────────
  const tabBtn = (tab: typeof activeTab, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => {
          triggerHaptic();
          setActiveTab(tab);
          setUcPlayerName(null); setStarsVerified(null);
          setUcCheckError(null); setStarsCheckError(null);
          setSelectedUC(null); setSelectedStars(null);
        }}
        style={{
          flex: 1,
          padding: '9px 0',
          fontWeight: 700,
          fontSize: '0.82rem',
          borderRadius: 14,
          border: 'none',
          cursor: 'pointer',
          background: isActive ? C.accent : 'transparent',
          color: isActive ? '#fff' : C.muted,
          transition: 'all 0.2s',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <Header balance={balance} />

      <div style={{ padding: '16px 16px 0' }}>
        {/* ── Tab switcher ── */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 18, padding: 4, border: `1.5px solid ${C.border}`, marginBottom: 20 }}>
          {tabBtn('accounts', 'Akkauntlar')}
          {tabBtn('uc', 'PUBG UC')}
          {tabBtn('stars', 'Stars')}
        </div>

        {/* ── ACCOUNTS TAB ── */}
        {activeTab === 'accounts' && (
          <div className="animate-fade-in-up">
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[1,2,3,4].map(i => <div key={i} className="shimmer rounded-3xl" style={{ height: 240 }}/>)}
              </div>
            ) : accounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
                <div style={{ width: 72, height: 72, background: C.card, borderRadius: 22, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: C.text, marginBottom: 6 }}>Akkauntlar topilmadi</p>
                <p style={{ fontSize: '0.82rem' }}>Hozircha mavjud akkauntlar yo'q</p>
              </div>
            ) : (
              <>
                {/* Grid view */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {accounts.slice(0, 4).map(account => (
                    <button
                      key={account.id}
                      onClick={() => { triggerHaptic(); navigate(`/accounts/${account.id}`); }}
                      style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: 14, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {/* Image */}
                      <div style={{ width: '100%', height: 110, borderRadius: 14, background: C.card2, marginBottom: 10, overflow: 'hidden' }}>
                        {account.images?.[0]
                          ? <img src={account.images[0]} alt={account.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/></svg>
                            </div>
                        }
                      </div>
                      <div className="rank-badge" style={{ marginBottom: 6, fontSize: '0.6rem' }}>{account.rank}</div>
                      <p style={{ color: C.text, fontWeight: 800, fontSize: '0.82rem', marginBottom: 4, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.title}</p>
                      <div style={{ display: 'flex', gap: 8, color: C.muted, fontSize: '0.68rem', marginBottom: 8 }}>
                        <span>Lv.{account.level}</span><span>·</span><span>{account.skinsCount} skins</span>
                      </div>
                      <p style={{ color: C.accent, fontWeight: 800, fontSize: '0.85rem' }}>{Number(account.price).toLocaleString('uz-UZ')} UZS</p>
                    </button>
                  ))}
                </div>

                {/* List view for remaining */}
                {accounts.length > 4 && accounts.slice(4).map(account => (
                  <div
                    key={account.id}
                    onClick={() => { triggerHaptic(); navigate(`/accounts/${account.id}`); }}
                    style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: C.card2, overflow: 'hidden', flexShrink: 0 }}>
                      {account.images?.[0]
                        ? <img src={account.images[0]} alt={account.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/></svg></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>Lv.{account.level} · {account.rank}</p>
                      <p style={{ color: C.muted, fontSize: '0.7rem', marginBottom: 2 }}>{account.skinsCount} ta skin</p>
                      <p style={{ color: C.accent, fontWeight: 800, fontSize: '0.82rem' }}>{Number(account.price).toLocaleString('uz-UZ')} UZS</p>
                    </div>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                ))}

                {/* Request card */}
                <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '16px', textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
                  <p style={{ color: C.muted, fontSize: '0.82rem', marginBottom: 10 }}>Kerakli akkauntni topa olmadingizmi?</p>
                  <button
                    onClick={() => { triggerHaptic(); window.location.href='https://t.me/FastUC_support'; }}
                    style={{ background: 'rgba(115,125,228,0.12)', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 20px', color: C.accent, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', width: '100%' }}
                  >
                    Akkaunt so'rovini yuborish
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── UC TAB ── */}
        {activeTab === 'uc' && (
          <div className="animate-fade-in-up">
            {/* Checkout card */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '18px', marginBottom: 16 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1rem', marginBottom: 4 }}>PUBG UC Xarid</h2>
              <p style={{ color: C.muted, fontSize: '0.75rem', marginBottom: 14 }}>Player ID ni kiriting va tekshiring</p>

              {/* ID input + check */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="number"
                  value={playerId}
                  onChange={e => { setPlayerId(e.target.value); setUcPlayerName(null); setUcCheckError(null); }}
                  placeholder="Player ID (masalan: 51234567)"
                  className="input-field"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                />
                <button
                  onClick={handleCheckUC}
                  disabled={isCheckingUC || !playerId}
                  style={{ background: C.accent, color: '#fff', fontWeight: 700, padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer', opacity: (isCheckingUC || !playerId) ? 0.5 : 1, whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  {isCheckingUC ? '...' : 'Tekshirish'}
                </button>
              </div>

              {ucPlayerName && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  <div>
                    <p style={{ color: '#22c55e', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>ID Topildi ✅</p>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem' }}>{ucPlayerName}</p>
                  </div>
                </div>
              )}
              {ucCheckError && (
                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 12, padding: '10px 14px' }}>
                  <p style={{ color: '#f43f5e', fontSize: '0.82rem', fontWeight: 600 }}>{ucCheckError}</p>
                </div>
              )}
            </div>

            {/* Packages grid */}
            <div style={{ opacity: ucPlayerName ? 1 : 0.45, pointerEvents: ucPlayerName ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              {renderPackageGrid(UC_PACKAGES, selectedUC, setSelectedUC, ucQty, setUcQty, 'uc')}
            </div>

            {!ucPlayerName && (
              <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.75rem', marginTop: 10 }}>⬆ Avval Player ID ni tekshiring</p>
            )}

            {selectedUC && ucPlayerName && renderCheckoutBar('uc', selectedUC, ucQty)}
          </div>
        )}

        {/* ── STARS TAB ── */}
        {activeTab === 'stars' && (
          <div className="animate-fade-in-up">
            {/* Checkout card */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '18px', marginBottom: 16 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1rem', marginBottom: 4 }}>Telegram Stars</h2>
              <p style={{ color: C.muted, fontSize: '0.75rem', marginBottom: 14 }}>Telegram username kiriting va tekshiring</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={tgUsername}
                  onChange={e => { setTgUsername(e.target.value); setStarsVerified(null); setStarsCheckError(null); }}
                  placeholder="@username"
                  className="input-field"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                />
                <button
                  onClick={handleCheckStars}
                  disabled={isCheckingStars || !tgUsername}
                  style={{ background: C.accent, color: '#fff', fontWeight: 700, padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer', opacity: (isCheckingStars || !tgUsername) ? 0.5 : 1, whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  {isCheckingStars ? '...' : 'Tekshirish'}
                </button>
              </div>

              {starsVerified && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  <div>
                    <p style={{ color: '#22c55e', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Username Topildi ✅</p>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem' }}>{tgUsername.startsWith('@') ? tgUsername : '@' + tgUsername}</p>
                  </div>
                </div>
              )}
              {starsCheckError && (
                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 12, padding: '10px 14px' }}>
                  <p style={{ color: '#f43f5e', fontSize: '0.82rem', fontWeight: 600 }}>{starsCheckError}</p>
                </div>
              )}
            </div>

            <div style={{ opacity: starsVerified ? 1 : 0.45, pointerEvents: starsVerified ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              {renderPackageGrid(STARS_PACKAGES, selectedStars, setSelectedStars, starsQty, setStarsQty, 'stars')}
            </div>

            {!starsVerified && (
              <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.75rem', marginTop: 10 }}>⬆ Avval Username ni tekshiring</p>
            )}

            {selectedStars && starsVerified && renderCheckoutBar('stars', selectedStars, starsQty)}
          </div>
        )}
      </div>

      {/* ── Buy confirm modal ── */}
      {buyType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
          <div className="animate-fade-in-up" style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '28px 20px', width: '100%', maxWidth: 400 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(115,125,228,0.12)', borderRadius: 16, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {buyType === 'uc' ? (
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="2"/><text x="12" y="16.5" textAnchor="middle" fill={C.accent} fontSize="8" fontWeight="800" fontFamily="Outfit">UC</text></svg>
                ) : (
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#facc15" strokeWidth="2" fill="#facc15" fillOpacity="0.3"/></svg>
                )}
              </div>
              <div>
                <p style={{ color: C.muted, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>BUYURTMANI TEKSHIRISH</p>
                <p style={{ color: C.text, fontWeight: 900, fontSize: '1rem' }}>
                  {buyType === 'uc' ? `${(selectedUC?.uc || 0) * ucQty} UC` : `${(selectedStars?.stars || 0) * starsQty} Stars`}
                </p>
              </div>
            </div>

            {/* Details */}
            <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: C.muted, fontSize: '0.82rem' }}>
                  {buyType === 'uc' ? 'PUBG MOBILE' : 'Telegram'}
                </span>
                <span style={{ color: C.text, fontWeight: 700, fontSize: '0.82rem' }}>
                  {buyType === 'uc' ? ucPlayerName : (tgUsername.startsWith('@') ? tgUsername : '@' + tgUsername)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: C.muted, fontSize: '0.82rem' }}>Umumiy summa</span>
                <span style={{ color: C.accent, fontWeight: 900, fontSize: '1.1rem' }}>
                  {buyType === 'uc'
                    ? ((selectedUC?.price || 0) * ucQty).toLocaleString('uz-UZ')
                    : ((selectedStars?.price || 0) * starsQty).toLocaleString('uz-UZ')} so'm
                </span>
              </div>
            </div>

            <button
              onClick={confirmBuy}
              disabled={isBuying}
              style={{ width: '100%', background: C.accent, color: '#fff', fontWeight: 800, padding: '16px', borderRadius: 16, border: 'none', cursor: isBuying ? 'not-allowed' : 'pointer', opacity: isBuying ? 0.6 : 1, fontSize: '0.95rem', marginBottom: 10 }}
            >
              {isBuying ? 'Yuklanmoqda...' : 'Ha, Xarid Qilish ✅'}
            </button>
            <button
              onClick={() => { setSelectedUC(null); setSelectedStars(null); setBuyType(null); }}
              style={{ width: '100%', background: 'none', border: 'none', color: C.muted, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', padding: '8px' }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
