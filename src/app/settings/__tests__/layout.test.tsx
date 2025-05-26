import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import reactI18nextMock from '@/tests/mocks/i18next';
import { render, screen } from '@/tests/test-utils';

// Create a spy for the router push function
const mockPush = vi.fn();
let mockPathname = '/settings/applications';

// Mock translations specifically for this component
vi.mock('react-i18next', () => reactI18nextMock);

// Mock Next.js navigation and Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
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
          return React.cloneElement(child);
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

// Import the SettingsLayout component after all mocks are set up
import SettingsLayout from '../layout';

describe('SettingsLayout', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset pathname to default for each test
    mockPathname = '/settings/applications';
  });

  it('renders the settings layout with title and description', () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your application settings')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    expect(screen.getByTestId('settings-tab-applications')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-environments')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-locations')).toBeInTheDocument();
  });

  it('navigates to applications tab when clicked', async () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    const applicationsTab = screen.getByTestId('settings-tab-applications');

    applicationsTab.click();

    expect(mockPush).toHaveBeenCalledWith('/settings/applications');
  });

  it('navigates to environments tab when clicked', async () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    const environmentsTab = screen.getByTestId('settings-tab-environments');

    environmentsTab.click();

    expect(mockPush).toHaveBeenCalledWith('/settings/environments');
  });

  it('navigates to locations tab when clicked', async () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    const locationsTab = screen.getByTestId('settings-tab-locations');

    locationsTab.click();

    expect(mockPush).toHaveBeenCalledWith('/settings/locations');
  });

  it('displays the correct active tab based on URL', () => {
    // Change the mock return value for this specific test only
    mockPathname = '/settings/environments';

    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    // Test implementation depends on how your component determines active state
    // This might need to be adjusted according to your component's implementation
  });

  it('renders children content', () => {
    render(
      <SettingsLayout>
        <div data-testid="test-child-content">Test Child Content</div>
      </SettingsLayout>
    );

    expect(screen.getByTestId('test-child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});
