import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Mail, Smartphone, Twitter, Globe } from 'lucide-react';
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

  useEffect(() => {
    // Try to load real data, fallback to demo
    setLoading(true);
    api.get('/accounts')
      .then(res => { if (res.data?.length) setAccounts(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
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
    if (l.includes('twitter') || l.includes('x')) return <Twitter size={16} className="text-blue-400" />;
    if (l.includes('apple')) return <Smartphone size={16} className="text-gray-300" />;
    return <Key size={16} className="text-gray-400" />;
  };

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Header balance={balance} userName={user?.firstName || 'U'} photoUrl={photoUrl} />

      <div className="px-4 py-4 pb-24">
        {/* Balance card on home */}
        <div
          onClick={() => navigate('/balance')}
          className="card-inner p-4 flex items-center justify-between mb-6 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12132b] flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#facc15]">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3H8L2 7h20l-6-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="text-[#8b92b8] text-xs font-700">Hisobingiz</p>
              <p className="text-white font-black text-lg leading-tight">{Number(balance).toLocaleString()} UZS</p>
            </div>
          </div>
          <button className="btn-yellow text-sm px-4 py-2 rounded-xl">
            + To'ldirish
          </button>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">PUBG Akkauntlar</h2>
          <span className="badge badge-info">{accounts.length} ta</span>
        </div>

        {/* Accounts list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-64 animate-pulse bg-[#1e2040]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {accounts.map((acc, idx) => (
              <div
                key={acc.id}
                onClick={() => navigate(`/accounts/${acc.id}`)}
                className="card cursor-pointer active:scale-[0.98] transition-transform animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Image slider */}
                <ImageSlider images={acc.images} title={acc.title} />

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-white font-black text-base leading-snug flex-1">{acc.title}</h3>
                  </div>

                  {/* Stats row - Level & Privacy only */}
                  <div className="flex gap-2 mb-4">
                    <div className="bg-[#12132b] rounded-xl p-2.5 flex-1 flex flex-col items-center justify-center">
                      <p className="text-[#8b92b8] text-[10px] font-700 uppercase mb-0.5">Level</p>
                      <p className="text-white font-black text-base">{acc.level}</p>
                    </div>
                    <div className="bg-[#12132b] rounded-xl p-2.5 flex-1 flex flex-col items-center justify-center">
                      <p className="text-[#8b92b8] text-[10px] font-700 uppercase mb-0.5 flex items-center gap-1">
                        <Shield size={10} /> Privacy
                      </p>
                      <div className="flex gap-1.5 mt-1">
                        {acc.linkedAccounts?.length ? (
                          acc.linkedAccounts.map((link, i) => (
                            <span key={i} title={link}>{renderLinkedIcon(link)}</span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price + Buy */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8b92b8] text-xs">Narxi</p>
                      <p className="text-[#facc15] font-black text-xl">
                        {Number(acc.price).toLocaleString()} UZS
                      </p>
                    </div>
                    <button className="btn-yellow px-5 py-2.5 rounded-xl text-sm">
                      Sotib olish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
