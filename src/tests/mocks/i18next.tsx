import React from 'react';
import { vi } from 'vitest';

// Create a comprehensive mock for react-i18next
const reactI18nextMock = {
  // Mock useTranslation hook
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'messages.requiredField': 'This field is required',
        'common:messages.requiredField': 'This field is required',
        'messages.invalidSlug': 'Invalid slug format',
        'common:form.errors.invalidSlug': 'Invalid slug format',
        'messages.error': 'An error occurred',
        'messages.success': 'Operation successful',
        'settings.title': 'Settings',
        'settings.description': 'Manage your application settings',
        'settings.tabs.applications': 'Applications',
        'settings.tabs.environments': 'Environments',
        'settings.tabs.locations': 'Locations',
        title: 'Settings',
        description: 'Manage your application settings',
        'tabs.applications': 'Applications',
        'tabs.environments': 'Environments',
        'tabs.locations': 'Locations',
        // Adicionando mensagens de erro específicas para os testes
        'Failed to load entities': 'Failed to load entities',
        'Failed to refresh entities': 'Failed to refresh entities',
      };

      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
  }),

  // Mock initReactI18next
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },

  // Mock I18nextProvider
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
};

// Export the mock
export default reactI18nextMock;

// Function to automatically mock react-i18next in vitest
export function setupReactI18nextMock() {
  vi.mock('react-i18next', () => reactI18nextMock);
}
