import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/eng/translation.json';
import ukTranslation from '../locales/ukr/translation.json';

const resources = {
  eng: { translation: enTranslation },
  ukr: { translation: ukTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // lng: 'ukr',
    fallbackLng: 'eng',
    interpolation: { escapeValue: false },

    detection: {
      order: ['cookie', 'navigator'], 
      caches: ['cookie'],           
      lookupCookie: 'i18nextLng'
    },
  }, (err, t) => {
    if (err) {
      console.error('i18next init error:', err);
    } else {
      console.log('i18next initialized, current language:', i18n.language);
    }
  });

export default i18n;