import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from '../locales/en/common.json';
import enEntityTable from '../locales/en/entityTable.json';
import enSettings from '../locales/en/settings.json';
import ptCommon from '../locales/pt/common.json';
import ptEntityTable from '../locales/pt/entityTable.json';
import ptSettings from '../locales/pt/settings.json';

const resources = {
  pt: {
    common: ptCommon,
    settings: ptSettings,
    entityTable: ptEntityTable,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    entityTable: enEntityTable,
  },
};

i18n
  // load translation using http -> see /public/locales
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'pt',
    defaultNS: 'common',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
