import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, User2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Product {
  id: string;
  name: string;
  category: 'UC' | 'STARS';
  amount: number;
  price: string;
  imageUrl?: string;
}

const ProductPurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, photoUrl, refreshUser } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [playerIdOrUsername, setPlayerIdOrUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user?.balance) setBalance(Number(user.balance));
  }, [user]);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const totalPrice = product ? Number(product.price) * quantity : 0;
  const isUC = product?.category === 'UC';

  const handlePurchase = async () => {
    if (!playerIdOrUsername.trim()) {
      setError(isUC ? 'PUBG Player ID kiriting!' : 'Telegram username kiriting!');
      return;
    }
    if (totalPrice > balance) {
      setError('Balans yetarli emas. Avval hisobingizni to\'ldiring!');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/product-orders', {
        productId: id,
        quantity,
        playerIdOrUsername: playerIdOrUsername.trim(),
      });
      await refreshUser();
      navigate('/orders', { state: { successProduct: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C7FF5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />

      <div className="px-4 py-4 pb-28">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#8b92b8] font-bold mb-6 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} /> Ortga
        </button>

        {/* Product card */}
        <div className="card p-5 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-[#a78bfa]/5" />
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-2xl mx-auto mb-4 shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl bg-[#12132b]">
              {isUC ? '💎' : '⭐'}
            </div>
          )}
          <h1 className="text-xl font-black text-white mb-1">{product.name}</h1>
          <p className="text-[#8b92b8] text-sm mb-3">
            {isUC ? 'PUBG Mobile UC' : 'Telegram Stars'}
          </p>
          <div className="inline-flex items-center gap-2 bg-[#12132b] rounded-xl px-4 py-2">
            <span className="text-[#facc15] font-black text-lg">
              {Number(product.price).toLocaleString()} UZS
            </span>
            <span className="text-[#8b92b8] text-xs">/ dona</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="card-inner p-4 mb-4">
          <p className="text-[#8b92b8] text-xs font-bold uppercase tracking-wide mb-3">Miqdor</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl bg-[#12132b] flex items-center justify-center text-white font-black text-xl hover:bg-[#1e2040] transition-colors"
            >
              −
            </button>
            <span className="text-white font-black text-xl flex-1 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 rounded-xl bg-[#12132b] flex items-center justify-center text-white font-black text-xl hover:bg-[#1e2040] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Player ID / Username input */}
        <div className="card-inner p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User2 size={16} className="text-[#7C7FF5]" />
            <p className="text-[#8b92b8] text-xs font-bold uppercase tracking-wide">
              {isUC ? 'PUBG Player ID' : 'Telegram Username'}
            </p>
          </div>
          <input
            type="text"
            className="input-field"
            placeholder={isUC ? 'Masalan: 5123456789' : '@username'}
            value={playerIdOrUsername}
            onChange={e => {
              setPlayerIdOrUsername(e.target.value);
              setError('');
            }}
          />
          <p className="text-[#8b92b8] text-xs mt-2">
            {isUC
              ? 'PUBG Mobile o\'yinidagi 9-10 xonali Player ID ni kiriting'
              : 'Telegram username yoki ID raqamingizni kiriting'}
          </p>
        </div>

        {/* Balance check */}
        {totalPrice > balance && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs font-semibold">
              Balans yetarli emas. Kerak: {totalPrice.toLocaleString()} UZS, Mavjud: {balance.toLocaleString()} UZS
            </p>
          </div>
        )}

        {error && (
          <p className="text-[#f43f5e] text-sm text-center mb-4">{error}</p>
        )}

        {/* Total + Buy button */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#12132b]/95 backdrop-blur-xl border-t border-white/5 p-4 pb-safe z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#8b92b8] text-sm font-semibold">Jami:</span>
            <span className="text-[#facc15] font-black text-lg">{totalPrice.toLocaleString()} UZS</span>
          </div>
          <button
            onClick={handlePurchase}
            disabled={submitting || totalPrice > balance || !playerIdOrUsername.trim()}
            className="btn-yellow w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
            {submitting ? 'Sotib olinmoqda...' : 'Sotib olish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchasePage;
