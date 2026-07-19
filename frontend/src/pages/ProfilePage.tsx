import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { initI18n } from '../i18n';

const LANGUAGES = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const tgUser = WebApp.initDataUnsafe?.user;

  const handleLangChange = async (code: string) => {
    await initI18n(code);
    setShowLangPicker(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="page-container">
      <h1 className="section-title">{t('profile.title')}</h1>

      {/* Avatar & Name */}
      <div className="card mb-4 flex items-center gap-4 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
          {tgUser?.first_name?.[0] || '?'}
        </div>
        <div>
          <p className="text-primary font-extrabold text-lg">
            {tgUser?.first_name || 'Foydalanuvchi'} {tgUser?.last_name || ''}
          </p>
          {tgUser?.username && (
            <p className="text-secondary text-sm">@{tgUser.username}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center animate-fade-in-up">
          <p className="text-secondary text-xs mb-1">{t('profile.id')}</p>
          <code className="text-primary font-mono text-sm font-bold">{tgUser?.id || '—'}</code>
        </div>
        <div className="card text-center animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <p className="text-secondary text-xs mb-1">{t('profile.balance')}</p>
          <p className="text-gradient font-extrabold">0 UZS</p>
        </div>
      </div>

      {/* Language */}
      <div className="card mb-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary text-xs mb-1">{t('profile.language')}</p>
            <p className="text-primary font-bold flex items-center gap-2">
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
            </p>
          </div>
          <button
            id="change-lang-btn"
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="badge-info cursor-pointer"
          >
            O'zgartirish
          </button>
        </div>

        {showLangPicker && (
          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                id={`lang-${lang.code}`}
                onClick={() => handleLangChange(lang.code)}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${i18n.language === lang.code ? 'border-accent-indigo bg-accent-indigo/10 text-accent-indigo' : 'border-white/10 text-secondary'}`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* App info */}
      <div className="card text-center animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <p className="text-gradient font-extrabold text-lg mb-1">FastPAY</p>
        <p className="text-secondary text-xs">v1.0.0 · PUBG Account Marketplace</p>
        <p className="text-secondary text-xs mt-1">🛡️ Escrow himoyasi bilan xavfsiz xarid</p>
      </div>
    </div>
  );
};

export default ProfilePage;
