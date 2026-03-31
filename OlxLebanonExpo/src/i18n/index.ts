import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import en from './en.json';
import ar from './ar.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const changeLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang);
  const isRTL = lang === 'ar';
  I18nManager.forceRTL(isRTL);
};

export default i18n;