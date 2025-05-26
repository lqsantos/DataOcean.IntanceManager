import { describe, expect, it, vi } from 'vitest';

import { LocationsPage } from '@/components/locations/locations-page';
import { render, screen } from '@/tests/test-utils';

import SettingsLocationsPage from '../page';

// Mock the LocationsPage component
vi.mock('@/components/locations/locations-page', () => ({
  LocationsPage: vi.fn(() => <div data-testid="mocked-locations-page">Locations Page</div>),
}));

describe('SettingsLocationsPage', () => {
  it('renders the LocationsPage component', () => {
    render(<SettingsLocationsPage />);

    expect(screen.getByTestId('mocked-locations-page')).toBeInTheDocument();
    expect(LocationsPage).toHaveBeenCalled();
  });
});
