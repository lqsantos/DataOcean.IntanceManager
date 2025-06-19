import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enBlueprints from '../locales/en/blueprints.json';
import enCommon from '../locales/en/common.json';
import enEntityTable from '../locales/en/entityTable.json';
import enPat from '../locales/en/pat.json';
import enResources from '../locales/en/resources.json';
import enSettings from '../locales/en/settings.json';
import enTemplates from '../locales/en/templates.json';
import ptBlueprints from '../locales/pt/blueprints.json';
import ptCommon from '../locales/pt/common.json';
import ptEntityTable from '../locales/pt/entityTable.json';
import ptPat from '../locales/pt/pat.json';
import ptResources from '../locales/pt/resources.json';
import ptSettings from '../locales/pt/settings.json';
import ptTemplates from '../locales/pt/templates.json';

const resources = {
  pt: {
    common: ptCommon,
    settings: ptSettings,
    entityTable: ptEntityTable,
    pat: ptPat,
    templates: ptTemplates,
    blueprints: ptBlueprints,
    resources: ptResources,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    entityTable: enEntityTable,
    pat: enPat,
    templates: enTemplates,
    blueprints: enBlueprints,
    resources: enResources,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
