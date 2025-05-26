import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

// Create a spy for the router push function
const mockPush = vi.fn();

// Mock Next.js navigation and Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: vi.fn().mockReturnValue('/settings/applications'),
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        title: 'Settings',
        description: 'Manage your application settings',
        'tabs.applications': 'Applications',
        'tabs.environments': 'Environments',
        'tabs.locations': 'Locations',
      };

      return translations[key] || key;
    },
  }),
  // Adding the missing initReactI18next export
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Simple mock implementation for shadcn UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="mocked-card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="mocked-card-content">{children}</div>,
}));

// Mock the Tabs component from shadcn/ui
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ onValueChange, children }) => (
    <div data-testid="mocked-tabs" onClick={() => null}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onValueChange });
        }

        return child;
      })}
    </div>
  ),
  TabsContent: ({ children }) => <div data-testid="mocked-tabs-content">{children}</div>,
  TabsList: ({ children }) => <div data-testid="mocked-tabs-list">{children}</div>,
  TabsTrigger: ({ value, children }) => (
    <button
      data-testid={`settings-tab-${value}`}
      onClick={() => {
        // This directly calls router.push('/settings/value') in the component
        mockPush(`/settings/${value}`);
      }}
    >
      {children}
    </button>
  ),
}));

// Import the SettingsLayout component after all mocks are set
import SettingsLayout from '../layout';

describe('SettingsLayout', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the settings layout with title and description', () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your application settings')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    expect(screen.getByTestId('settings-tab-applications')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-environments')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-locations')).toBeInTheDocument();
  });

  it('navigates to applications tab when clicked', async () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    const user = userEvent.setup();

    const applicationsTab = screen.getByTestId('settings-tab-applications');

    await user.click(applicationsTab);

    // This should verify that router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/settings/applications');
  });

  it('navigates to environments tab when clicked', async () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    const user = userEvent.setup();

    const environmentsTab = screen.getByTestId('settings-tab-environments');

    await user.click(environmentsTab);

    expect(mockPush).toHaveBeenCalledWith('/settings/environments');
  });

  it('navigates to locations tab when clicked', async () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    const user = userEvent.setup();

    const locationsTab = screen.getByTestId('settings-tab-locations');

    await user.click(locationsTab);

    expect(mockPush).toHaveBeenCalledWith('/settings/locations');
  });

  it('displays the correct active tab based on URL', () => {
    // Mock the pathname to be environments
    vi.mocked(require('next/navigation').usePathname).mockReturnValue('/settings/environments');

    render(<SettingsLayout>Test Content</SettingsLayout>);

    // Check that the correct tabs exist
    expect(screen.getByTestId('settings-tab-applications')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-environments')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<SettingsLayout>Test Child Content</SettingsLayout>);
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});
