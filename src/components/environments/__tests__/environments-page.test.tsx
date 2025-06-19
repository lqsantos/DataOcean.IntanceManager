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

// Mock the components and hooks used in the EnvironmentsPage
vi.mock('@/hooks/use-environments', () => ({
  useEnvironments: () => ({
    environments: [
      { id: '1', name: 'Environment 1', slug: 'env-1', description: 'Test environment 1' },
      { id: '2', name: 'Environment 2', slug: 'env-2', description: 'Test environment 2' },
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshEnvironments: vi.fn().mockResolvedValue(undefined),
    createEnvironment: vi.fn().mockResolvedValue({ id: '3', name: 'New Environment' }),
    updateEnvironment: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Environment' }),
    deleteEnvironment: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/contexts/modal-manager-context', () => ({
  useEnvironmentModal: vi.fn(() => ({
    isOpen: false,
    entityToEdit: null,
    openModal: vi.fn(),
    openEditModal: vi.fn(),
    closeModal: vi.fn(),
  })),
}));

// Mock the imported components
vi.mock('../environment-form', () => ({
  EnvironmentForm: vi.fn(() => <div data-testid="environment-form">Environment Form</div>),
}));

vi.mock('../environments-table', () => ({
  EnvironmentsTable: vi.fn(({ entities }) => (
    <div data-testid="environments-table">
      {entities.map((env) => (
        <div key={env.id} data-testid={`environment-${env.id}`}>
          {env.name}
        </div>
      ))}
    </div>
  )),
}));

// Import the component under test after all mocks are set up
import { EnvironmentsPage } from '../environments-page';

// Import GenericEntityPage for mocking in the test
import * as genericEntityPageModule from '@/components/entities/generic-entity-page';

describe('EnvironmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the environments page with GenericEntityPage', () => {
    render(<EnvironmentsPage />);
    expect(screen.getByTestId('environments-page')).toBeInTheDocument();
  });

  it('renders environments in the table', () => {
    render(<EnvironmentsPage />);
    expect(screen.getByTestId('environment-1')).toBeInTheDocument();
    expect(screen.getByTestId('environment-2')).toBeInTheDocument();
    expect(screen.getByText('Environment 1')).toBeInTheDocument();
    expect(screen.getByText('Environment 2')).toBeInTheDocument();
  });

  it('renders the add and refresh buttons', () => {
    render(<EnvironmentsPage />);
    expect(screen.getByTestId('environments-add-button')).toBeInTheDocument();
    expect(screen.getByTestId('environments-refresh-button')).toBeInTheDocument();
  });

  it('passes correct props to GenericEntityPage', () => {
    // Get the mocked GenericEntityPage directly without await
    const { GenericEntityPage } = genericEntityPageModule as any;

    render(<EnvironmentsPage />);

    // Check that GenericEntityPage was called
    expect(GenericEntityPage).toHaveBeenCalled();

    // Get the first call arguments
    const callArgs = GenericEntityPage.mock.calls[0][0];

    // Test specific properties instead of the entire object structure
    expect(callArgs.testIdPrefix).toBe('environments');
    expect(callArgs.entities).toHaveLength(2);
    expect(callArgs.entities[0].id).toBe('1');
    expect(callArgs.entities[0].name).toBe('Environment 1');
    expect(callArgs.entities[1].id).toBe('2');
    expect(callArgs.entities[1].name).toBe('Environment 2');
  });
});
