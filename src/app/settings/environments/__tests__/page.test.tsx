import { describe, expect, it, vi } from 'vitest';

import { EnvironmentsPage } from '@/components/environments/environments-page';
import { render, screen } from '@/tests/test-utils';

import SettingsEnvironmentsPage from '../page';

// Mock the EnvironmentsPage component
vi.mock('@/components/environments/environments-page', () => ({
  EnvironmentsPage: vi.fn(() => (
    <div data-testid="mocked-environments-page">Environments Page</div>
  )),
}));

describe('SettingsEnvironmentsPage', () => {
  it('renders the EnvironmentsPage component', () => {
    render(<SettingsEnvironmentsPage />);

    expect(screen.getByTestId('mocked-environments-page')).toBeInTheDocument();
    expect(EnvironmentsPage).toHaveBeenCalled();
  });
});
