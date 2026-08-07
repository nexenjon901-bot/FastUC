import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Mail, Smartphone, AtSign, Globe } from 'lucide-react';
import Header from '../components/Header';
import ImageSlider from '../components/ImageSlider';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Account {
  id: string;
  sku: string;
  title: string;
  rank: string;
  level: number;
  skinsCount: number;
  ucBalance: number;
  price: string;
  images: string[];
  status: string;
  linkedAccounts?: string[];
}

interface Product {
  id: string;
  name: string;
  category: 'UC' | 'STARS';
  amount: number;
  price: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

const DEMO_ACCOUNTS: Account[] = [
  {
    id: '1', sku: 'PG-001',
    title: 'Conqueror Akkaunt — Oltin M416 Max',
    rank: 'Conqueror', level: 78, skinsCount: 142, ucBalance: 1200,
    price: '4500000',
    images: [
      'https://i.ytimg.com/vi/F2n1zB3OepA/maxresdefault.jpg',
      'https://i.ytimg.com/vi/h2ZlH6YvSBE/maxresdefault.jpg',
    ],
    status: 'AVAILABLE',
    linkedAccounts: ['Google', 'Twitter'],
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, photoUrl } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [ucProducts, setUcProducts] = useState<Product[]>([]);
  const [starsProducts, setStarsProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load PUBG accounts
    setLoading(true);
    api.get('/accounts')
      .then(res => { if (res.data?.length) setAccounts(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load UC products
    api.get('/products?category=UC')
      .then(res => setUcProducts(res.data || []))
      .catch(() => {});

    // Load Stars products
    api.get('/products?category=STARS')
      .then(res => setStarsProducts(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.balance) {
      setBalance(user.balance);
    }
  }, [user]);

  const renderLinkedIcon = (link: string) => {
    const l = link.toLowerCase();
    if (l.includes('google') || l.includes('gmail')) return <Mail size={16} className="text-red-400" />;
    if (l.includes('facebook')) return <Globe size={16} className="text-blue-500" />;
    if (l.includes('twitter') || l.includes('x')) return <AtSign size={16} className="text-blue-400" />;
    if (l.includes('apple')) return <Smartphone size={16} className="text-gray-300" />;
    return <Key size={16} className="text-gray-400" />;
  };

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />

      <div className="px-4 py-4 pb-24">
        {/* Section title */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="section-title">PUBG Akkauntlar</h2>
          <span className="badge badge-info">{accounts.length} ta</span>
        </div>

        {/* Accounts list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-[24px] aspect-[16/10] animate-pulse bg-[#1e2040]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {accounts.map((acc, idx) => (
              <div
                key={acc.id}
                onClick={() => navigate(`/accounts/${acc.id}`)}
                className="relative rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform aspect-[16/10] shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/5 group"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Background Image */}
                {acc.images?.[0] ? (
                  <img src={acc.images[0]} alt={acc.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-[#1e2040]" />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent opacity-95" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-[#12132b]/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase border border-white/10">
                    Level {acc.level}
                  </div>
                  {acc.linkedAccounts?.length && (
                    <div className="bg-[#12132b]/80 backdrop-blur-md flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10">
                      {acc.linkedAccounts.map((link, i) => (
                        <span key={i} title={link}>{renderLinkedIcon(link)}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 flex items-end justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg mb-1 line-clamp-2 uppercase tracking-wide">
                      {acc.title}
                    </h3>
                    <p className="text-white/80 font-bold text-sm drop-shadow-md">
                      {Number(acc.price).toLocaleString()} UZS
                    </p>
                  </div>
                  
                  <button className="bg-[#facc15] hover:bg-[#eab308] text-black font-black text-sm px-6 py-3 rounded-full transition-colors whitespace-nowrap shadow-[0_4px_14px_rgba(250,204,21,0.4)]">
                    Sotib olish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PUBG UC Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-white font-black text-lg text-center uppercase tracking-wide mb-5 drop-shadow-md">PUBG UC</h2>
          {ucProducts.length === 0 ? (
            <p className="text-[#8b92b8] text-sm text-center mt-4">Mahsulotlar yuklanmoqda...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {ucProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="relative rounded-[16px] overflow-hidden cursor-pointer active:scale-95 transition-transform aspect-[3/4] border border-white/5 group shadow-lg"
                >
                  {/* Background Image */}
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#1e2040] to-[#0a0a0f] flex items-center justify-center text-4xl opacity-80">
                      💎
                    </div>
                  )}
                  
                  {/* Gradient Overlay for Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent opacity-90" />
                  
                  {/* Text Content */}
                  <div className="absolute inset-0 p-2.5 flex flex-col justify-end text-center pb-3">
                    <h3 className="text-white font-black text-[13px] leading-tight drop-shadow-md">{product.name}</h3>
                    <p className="text-[#facc15] text-[11px] font-bold drop-shadow-md mt-0.5">{Number(product.price).toLocaleString()} UZS</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telegram Stars Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-white font-black text-lg text-center uppercase tracking-wide mb-5 drop-shadow-md">Telegram Stars</h2>
          {starsProducts.length === 0 ? (
            <p className="text-[#8b92b8] text-sm text-center mt-4">Mahsulotlar yuklanmoqda...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {starsProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="relative rounded-[16px] overflow-hidden cursor-pointer active:scale-95 transition-transform aspect-[3/4] border border-white/5 group shadow-lg"
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-900/40 to-[#0a0a0f] flex items-center justify-center text-4xl opacity-80">
                      ⭐
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent opacity-90" />
                  
                  <div className="absolute inset-0 p-2.5 flex flex-col justify-end text-center pb-3">
                    <h3 className="text-white font-black text-[13px] leading-tight drop-shadow-md">{product.name}</h3>
                    <p className="text-[#60a5fa] text-[11px] font-bold drop-shadow-md mt-0.5">{Number(product.price).toLocaleString()} UZS</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
