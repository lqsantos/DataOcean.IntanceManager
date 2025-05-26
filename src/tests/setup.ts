import { server } from '@/mocks/server';

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Add global mock for react-i18next before tests run
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'messages.requiredField': 'This field is required',
        'messages.invalidSlug': 'Invalid slug format',
        'messages.error': 'An error occurred',
        'messages.success': 'Operation successful',
      };

      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  I18nextProvider: ({ children }) => children,
}));

// Add a global mock for @radix-ui/react-slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children }) => children,
  createSlot:
    () =>
    ({ children }) =>
      children,
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
