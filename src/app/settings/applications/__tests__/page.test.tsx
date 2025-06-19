import { describe, expect, it, vi } from 'vitest';

import { ApplicationsPage } from '@/components/applications/applications-page';
import { render, screen } from '@/tests/test-utils';

import SettingsApplicationsPage from '../page';

// Mock the ApplicationsPage component
vi.mock('@/components/applications/applications-page', () => ({
  ApplicationsPage: vi.fn(() => (
    <div data-testid="mocked-applications-page">Applications Page</div>
  )),
}));

describe('SettingsApplicationsPage', () => {
  it('renders the ApplicationsPage component', () => {
    render(<SettingsApplicationsPage />);

    expect(screen.getByTestId('mocked-applications-page')).toBeInTheDocument();
    expect(ApplicationsPage).toHaveBeenCalled();
  });
});
