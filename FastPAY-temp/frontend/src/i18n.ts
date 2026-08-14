import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'uz',
  fallbackLng: 'uz',
  resources: {},
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Dynamically load locale files
const loadLocale = async (lang: string) => {
  const res = await fetch(`/locales/${lang}.json`);
  const data = await res.json();
  i18n.addResourceBundle(lang, 'translation', data, true, true);
};

export const initI18n = async (lang = 'uz') => {
  await loadLocale(lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
