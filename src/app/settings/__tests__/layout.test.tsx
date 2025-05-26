import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import SettingsLayout from '../layout';

// Mock the next/navigation hooks
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
  usePathname: vi.fn(),
}));

describe('SettingsLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockImplementation(() => '/settings/applications');
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

    const applicationsTab = screen.getByTestId('settings-tab-applications');

    await user.click(applicationsTab);

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
    (usePathname as ReturnType<typeof vi.fn>).mockImplementation(() => '/settings/environments');

    render(<SettingsLayout>Test Content</SettingsLayout>);

    const environmentsTab = screen.getByTestId('settings-tab-environments');

    expect(environmentsTab).toHaveAttribute('data-state', 'active');
  });

  it('renders children content', () => {
    render(<SettingsLayout>Test Child Content</SettingsLayout>);

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});
