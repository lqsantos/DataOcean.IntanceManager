import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import SettingsLayout from '../layout';

// Create a spy for the router push function
const mockPush = vi.fn();

// Mock the next/navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: vi.fn(),
}));

describe('SettingsLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to applications tab being active
    (usePathname as any).mockReturnValue('/settings/applications');
  });

  it('renders the settings layout with title and description', () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your application settings')).toBeInTheDocument();
    expect(screen.getByTestId('settings-layout')).toBeInTheDocument();
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

    const applicationsTab = screen.getByRole('tab', { name: /Applications/i });

    await user.click(applicationsTab);

    // Check if push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/settings/applications');
  });

  it('navigates to environments tab when clicked', async () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    const user = userEvent.setup();

    const environmentsTab = screen.getByRole('tab', { name: /Environments/i });

    await user.click(environmentsTab);

    expect(mockPush).toHaveBeenCalledWith('/settings/environments');
  });

  it('navigates to locations tab when clicked', async () => {
    render(<SettingsLayout>Test Content</SettingsLayout>);
    const user = userEvent.setup();

    const locationsTab = screen.getByRole('tab', { name: /Locations/i });

    await user.click(locationsTab);

    expect(mockPush).toHaveBeenCalledWith('/settings/locations');
  });

  it('displays the correct active tab based on URL', () => {
    // For this test, mock the pathname to be the environments path
    (usePathname as any).mockReturnValue('/settings/environments');

    render(<SettingsLayout>Test Content</SettingsLayout>);

    // When using the Tabs component from shadcn-ui, the active tab gets a data-state="active" attribute
    const applicationsTab = screen.getByRole('tab', { name: /Applications/i });
    const environmentsTab = screen.getByRole('tab', { name: /Environments/i });

    expect(environmentsTab).toHaveAttribute('data-state', 'active');
    expect(applicationsTab).toHaveAttribute('data-state', 'inactive');
  });

  it('renders children content', () => {
    render(<SettingsLayout>Test Child Content</SettingsLayout>);

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});
