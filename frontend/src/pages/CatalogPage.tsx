import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import PageShell from '../components/PageShell';
import SegmentedNav from '../components/SegmentedNav';
import ProductCard from '../components/ProductCard';
import VerifiedCard from '../components/VerifiedCard';
import { apiService, formatUzs } from '../api/services';
import type { Product, VerifiedPlayer, VerifiedTelegram } from '../types';

const CatalogPage: React.FC = () => {
  const { type = 'uc' } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const isUC = type === 'uc';
  const isStars = type === 'stars';
  const isAccounts = type === 'accounts';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [target, setTarget] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<VerifiedPlayer | VerifiedTelegram | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    setSelected(null);
    setVerified(null);
    setVerifyError('');
    setTarget('');
    setFieldError('');
    setLoading(true);

    if (isAccounts) {
      setLoading(false);
      return;
    }

    apiService
      .getProducts(isUC ? 'UC' : 'STARS')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [type, isUC, isAccounts]);

  const title = isUC ? 'PUBG UC' : isStars ? 'Telegram Stars' : 'Akkauntlar';
  const subtitle = isUC
    ? 'Player ID ni kiriting va tekshiring'
    : isStars
      ? 'Telegram username ni kiriting va tekshiring'
      : 'PUBG Mobile tayyor akkauntlar';

  const canBuy = useMemo(() => Boolean(verified && selected), [verified, selected]);

  const handleVerify = async () => {
    if (isUC && !target.trim()) {
      setFieldError('Player ID kiriting');
      return;
    }
    if (isStars && !target.trim()) {
      setFieldError('Username kiriting');
      return;
    }

    setFieldError('');
    setVerifying(true);
    setVerified(null);
    setVerifyError('');

    try {
      const result = isUC
        ? await apiService.verifyPlayer(target)
        : await apiService.verifyTelegram(target);

      if (!result.ok) setVerifyError(result.message);
      else setVerified(result);
    } finally {
      setVerifying(false);
    }
  };

  const handleBuy = () => {
    if (!selected || !verified) return;
    navigate('/checkout', {
      state: {
        product: selected,
        targetId: 'playerId' in verified ? verified.playerId : verified.username,
        targetName: 'nickname' in verified ? verified.nickname : verified.displayName,
      },
    });
  };

  return (
    <PageShell title={title} showBack>
      <div className="animate-fadeup space-y-4 pb-28">
        <SegmentedNav />

        {isAccounts ? (
          <>
            <div>
              <h2 className="section-title text-lg">{title}</h2>
              <p className="text-sm text-[#8b92b8] font-semibold mt-1">{subtitle}</p>
            </div>
            
            <div className="card" style={{ padding: 32, textAlign: 'center', marginTop: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Tez kunda!</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Akkauntlar bo'limi ustida ish olib bormoqdamiz.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="section-title text-lg">{title}</h2>
              <p className="text-sm text-[#8b92b8] font-semibold mt-1">{subtitle}</p>
            </div>

            <div>
              <input
                className={`input ${fieldError ? 'input-error' : ''}`}
                placeholder={isUC ? 'Player ID' : '@username'}
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setFieldError('');
                  setVerifyError('');
                  setVerified(null);
                }}
              />
              {fieldError && <p className="text-rose-400 text-xs font-bold mt-2">{fieldError}</p>}
              <button className="btn-primary mt-3" onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Tekshirilmoqda...' : 'Tekshirish'}
              </button>
            </div>

            {verifying && <div className="shimmer h-20 rounded-2xl" />}
            {!verifying && verifyError && (
              <VerifiedCard ok={false} title="" subtitle="" error={verifyError} />
            )}
            {!verifying && verified && 'playerId' in verified && (
              <VerifiedCard
                ok
                title="Player topildi"
                subtitle={verified.nickname}
                meta={`${verified.platform} · ID ${verified.playerId}`}
              />
            )}
            {!verifying && verified && 'username' in verified && (
              <VerifiedCard
                ok
                title="Telegram account topildi"
                subtitle={verified.username}
                meta={verified.displayName}
              />
            )}

            <p className="section-label">{isUC ? 'UC paketlari' : 'Stars paketlari'}</p>
            <div className="grid grid-cols-2 gap-3.5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shimmer h-28 rounded-2xl" />
                  ))
                : products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      selected={selected?.id === p.id}
                      onSelect={setSelected}
                    />
                  ))}
            </div>

            <div className="fixed-bottom-bar flex items-center gap-3">
              <div className="min-w-[90px]">
                <p className="text-[11px] text-[#8b92b8] font-bold">Jami</p>
                <p className="text-base font-black text-white">{formatUzs(selected?.price || 0)}</p>
              </div>
              <button className="btn-primary flex-1 !flex items-center justify-center gap-2" disabled={!canBuy} onClick={handleBuy}>
                <ShoppingCart size={16} />
                Sotib olish
              </button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default CatalogPage;
