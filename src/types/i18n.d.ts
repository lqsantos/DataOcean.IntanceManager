import 'i18next';
import type common from '../locales/pt/common.json';
import type entityTable from '../locales/pt/entityTable.json';
import type pat from '../locales/pt/pat.json';
import type settings from '../locales/pt/settings.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      entityTable: typeof entityTable;
      settings: typeof settings;
      pat: typeof pat;
    };
  }
}
