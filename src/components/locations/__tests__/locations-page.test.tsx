import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

// Mock GenericEntityPage component first
vi.mock('@/components/entities/generic-entity-page', () => ({
  GenericEntityPage: vi.fn(({ entities, EntityTable, EntityModal, testIdPrefix }) => (
    <div data-testid={`${testIdPrefix}-page`}>
      <EntityTable entities={entities} />
      <div data-testid={`${testIdPrefix}-add-button`}>Add Button</div>
      <div data-testid={`${testIdPrefix}-refresh-button`}>Refresh Button</div>
    </div>
  )),
}));

// Mock GenericEntityModal component
vi.mock('@/components/entities/generic-entity-modal', () => ({
  GenericEntityModal: vi.fn(({ EntityForm, testId }) => (
    <div data-testid={testId}>
      <EntityForm />
    </div>
  )),
}));

// Mock the components and hooks used in the LocationsPage
vi.mock('@/hooks/use-locations', () => ({
  useLocations: () => ({
    locations: [
      { id: '1', name: 'Location 1', slug: 'loc-1', description: 'Test location 1' },
      { id: '2', name: 'Location 2', slug: 'loc-2', description: 'Test location 2' },
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshLocations: vi.fn().mockResolvedValue(undefined),
    createLocation: vi.fn().mockResolvedValue({ id: '3', name: 'New Location' }),
    updateLocation: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Location' }),
    deleteLocation: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/contexts/modal-manager-context', () => ({
  useLocationModal: vi.fn(() => ({
    isOpen: false,
    entityToEdit: null,
    openModal: vi.fn(),
    openEditModal: vi.fn(),
    closeModal: vi.fn(),
  })),
}));

// Mock the imported components
vi.mock('../location-form', () => ({
  LocationForm: vi.fn(() => <div data-testid="location-form">Location Form</div>),
}));

vi.mock('../locations-table', () => ({
  LocationsTable: vi.fn(({ entities }) => (
    <div data-testid="locations-table">
      {entities.map((loc) => (
        <div key={loc.id} data-testid={`location-${loc.id}`}>
          {loc.name}
        </div>
      ))}
    </div>
  )),
}));

// Import the component under test after all mocks are set up
import { LocationsPage } from '../locations-page';

// Import GenericEntityPage for mocking in the test
import * as genericEntityPageModule from '@/components/entities/generic-entity-page';

describe('LocationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the locations page with GenericEntityPage', () => {
    render(<LocationsPage />);
    expect(screen.getByTestId('locations-page')).toBeInTheDocument();
  });

  it('renders locations in the table', () => {
    render(<LocationsPage />);
    expect(screen.getByTestId('location-1')).toBeInTheDocument();
    expect(screen.getByTestId('location-2')).toBeInTheDocument();
    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
  });

  it('renders the add and refresh buttons', () => {
    render(<LocationsPage />);
    expect(screen.getByTestId('locations-add-button')).toBeInTheDocument();
    expect(screen.getByTestId('locations-refresh-button')).toBeInTheDocument();
  });

  it('passes correct props to GenericEntityPage', () => {
    // Get the mocked GenericEntityPage directly without await
    const { GenericEntityPage } = genericEntityPageModule as any;

    render(<LocationsPage />);

    // Check that GenericEntityPage was called
    expect(GenericEntityPage).toHaveBeenCalled();

    // Get the first call arguments
    const callArgs = GenericEntityPage.mock.calls[0][0];

    // Test specific properties instead of the entire object structure
    expect(callArgs.testIdPrefix).toBe('locations');
    expect(callArgs.entities).toHaveLength(2);
    expect(callArgs.entities[0].id).toBe('1');
    expect(callArgs.entities[0].name).toBe('Location 1');
    expect(callArgs.entities[1].id).toBe('2');
    expect(callArgs.entities[1].name).toBe('Location 2');
  });
});
