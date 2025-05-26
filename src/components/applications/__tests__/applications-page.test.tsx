import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';

// Mock the components and hooks used in the ApplicationsPage
vi.mock('@/hooks/use-applications', () => ({
  useApplications: () => ({
    applications: [
      { id: '1', name: 'Application 1', slug: 'app-1', description: 'Test application 1' },
      { id: '2', name: 'Application 2', slug: 'app-2', description: 'Test application 2' },
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshApplications: vi.fn().mockResolvedValue(undefined),
    createApplication: vi.fn().mockResolvedValue({ id: '3', name: 'New Application' }),
    updateApplication: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Application' }),
    deleteApplication: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/contexts/modal-manager-context', () => ({
  useApplicationModal: vi.fn(() => ({
    isOpen: false,
    entityToEdit: null,
    openModal: vi.fn(),
    openEditModal: vi.fn(),
    closeModal: vi.fn(),
  })),
}));

// Mock the imported components
vi.mock('../application-form', () => ({
  ApplicationForm: vi.fn(() => <div data-testid="application-form">Application Form</div>),
}));

vi.mock('../applications-table', () => ({
  ApplicationsTable: vi.fn(({ entities }) => (
    <div data-testid="applications-table">
      {entities.map((app) => (
        <div key={app.id} data-testid={`application-${app.id}`}>
          {app.name}
        </div>
      ))}
    </div>
  )),
}));

// Mock GenericEntityPage component
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

// Import the component under test after all mocks are set up
import { ApplicationsPage } from '../applications-page';

describe('ApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the applications page with GenericEntityPage', () => {
    render(<ApplicationsPage />);

    expect(screen.getByTestId('applications-page')).toBeInTheDocument();
  });

  it('renders applications in the table', () => {
    render(<ApplicationsPage />);

    expect(screen.getByTestId('application-1')).toBeInTheDocument();
    expect(screen.getByTestId('application-2')).toBeInTheDocument();
    expect(screen.getByText('Application 1')).toBeInTheDocument();
    expect(screen.getByText('Application 2')).toBeInTheDocument();
  });

  it('renders the add and refresh buttons', () => {
    render(<ApplicationsPage />);

    expect(screen.getByTestId('applications-add-button')).toBeInTheDocument();
    expect(screen.getByTestId('applications-refresh-button')).toBeInTheDocument();
  });

  it('passes correct props to GenericEntityPage', () => {
    const { GenericEntityPage } = require('@/components/entities/generic-entity-page');

    render(<ApplicationsPage />);

    expect(GenericEntityPage).toHaveBeenCalledWith(
      expect.objectContaining({
        testIdPrefix: 'applications',
        entities: expect.arrayContaining([
          expect.objectContaining({ id: '1', name: 'Application 1' }),
          expect.objectContaining({ id: '2', name: 'Application 2' }),
        ]),
      }),
      expect.anything()
    );
  });
});
