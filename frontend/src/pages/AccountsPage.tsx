import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
}

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/accounts')
      .then(res => setAccounts(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = accounts.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.rank.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (p: string) =>
    Number(p).toLocaleString('uz-UZ') + ' UZS';

  return (
    <div className="page-container">
      {/* Escrow Banner */}
      <div className="mb-4 rounded-2xl p-4 bg-accent-gradient relative overflow-hidden animate-fade-in-up">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent_70%)]" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z"
                fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <p className="text-white text-sm font-semibold">{t('home.escrowBanner')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" width="18" height="18" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            id="account-search"
            type="text"
            className="input-field pl-10"
            placeholder={t('home.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Accounts Title */}
      <h1 className="section-title">{t('home.title')}</h1>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-secondary py-16">
          <svg className="mx-auto mb-3 opacity-30" width="48" height="48" fill="none" viewBox="0 0 24 24">
            <path d="M9.5 15.5L14.5 8.5M9 9.5h.01M15 14.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p>{t('home.noAccounts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((account, i) => (
            <button
              key={account.id}
              id={`account-card-${account.id}`}
              onClick={() => navigate(`/accounts/${account.id}`)}
              className="card text-left hover:border-accent-indigo/30 transition-all duration-200 active:scale-95 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <div className="w-full h-24 rounded-xl bg-bg-card2 mb-3 overflow-hidden">
                {account.images[0] ? (
                  <img src={account.images[0]} alt={account.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Rank Badge */}
              <div className="rank-badge mb-2 text-[10px]">{account.rank}</div>

              {/* Title */}
              <p className="text-primary font-bold text-sm truncate mb-1">{account.title}</p>

              {/* Stats */}
              <div className="flex items-center gap-2 text-secondary text-[11px] mb-3">
                <span>Lv.{account.level}</span>
                <span>·</span>
                <span>{account.skinsCount} skins</span>
              </div>

              {/* Price */}
              <p className="text-gradient font-extrabold text-sm">{formatPrice(account.price)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
