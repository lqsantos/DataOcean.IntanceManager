// components/applications/applications-page.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as ApplicationsHook from '@/hooks/use-applications';
import { TestWrapper } from '@/tests/test-utils';

import { ApplicationsPage } from './applications-page';

// Mock hook and context functions
const createApplicationMock = vi.fn();
const updateApplicationMock = vi.fn();
const deleteApplicationMock = vi.fn();
const refreshApplicationsMock = vi.fn();
const mockOpenModal = vi.fn();
const mockOpenEditModal = vi.fn();
const mockCloseModal = vi.fn();

// Sample applications data
const mockApplications = [
  {
    id: '1',
    name: 'Frontend Web',
    slug: 'frontend-web',
    description: 'Main frontend application',
    createdAt: '2023-01-15T10:00:00.000Z',
    updatedAt: '2023-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'API Gateway',
    slug: 'api-gateway',
    description: 'API gateway service',
    createdAt: '2023-02-10T08:30:00.000Z',
    updatedAt: '2023-02-10T08:30:00.000Z',
  },
];

// Keep track of modal state to test modal rendering
let modalState = {
  isOpen: false,
  applicationToEdit: null,
};

// Mock the useApplications hook
vi.mock('@/hooks/use-applications', () => ({
  useApplications: vi.fn().mockImplementation(() => ({
    applications: mockApplications,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshApplications: refreshApplicationsMock,
    createApplication: createApplicationMock,
    updateApplication: updateApplicationMock,
    deleteApplication: deleteApplicationMock,
  })),
}));

// Mock the context
vi.mock('@/contexts/modal-manager-context', () => ({
  useApplicationModal: vi.fn().mockImplementation(() => ({
    isOpen: modalState.isOpen,
    applicationToEdit: modalState.applicationToEdit,
    openModal: mockOpenModal.mockImplementation(() => {
      modalState.isOpen = true;
      modalState.applicationToEdit = null;

      return true; // Return a value to indicate the function was called
    }),
    openEditModal: mockOpenEditModal.mockImplementation((app) => {
      modalState.isOpen = true;
      modalState.applicationToEdit = app;

      return true; // Return a value to indicate the function was called
    }),
    closeModal: mockCloseModal.mockImplementation(() => {
      modalState.isOpen = false;
      modalState.applicationToEdit = null;
    }),
  })),
}));

// Mock ApplicationsTable
vi.mock('./applications-table', () => ({
  ApplicationsTable: ({ onEdit, onDelete }) => (
    <div data-testid="applications-table">
      <div data-testid="applications-count">2</div>
      <button
        data-testid="mock-edit-button"
        onClick={() => onEdit(mockApplications[0])}
      >
        Edit
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete('1')}>
        Delete
      </button>
    </div>
  ),
}));

// Mock CreateApplicationModal
vi.mock('./create-application-modal', () => ({
  CreateApplicationModal: ({ isOpen, onClose, createApplication, updateApplication, applicationToEdit, onCreateSuccess }) => 
    isOpen ? (
      <div data-testid="create-application-modal">
        <div data-testid="modal-edit-mode">{applicationToEdit ? 'edit' : 'create'}</div>
        <button
          data-testid="modal-create-button"
          onClick={() => {
            const data = { name: 'New App', slug: 'new-app' };

            if (applicationToEdit) {
              updateApplication(applicationToEdit.id, data);
            } else {
              createApplication(data);
            }
            onClose();
            onCreateSuccess();
          }}
        >
          Submit
        </button>
      </div>
    ) : null,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  PlusCircle: () => <span data-testid="plus-circle-icon" />,
  RefreshCw: () => <span data-testid="refresh-icon" />,
}));

describe('ApplicationsPage', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    vi.clearAllMocks();
    modalState = {
      isOpen: false,
      applicationToEdit: null,
    };
  });
  
  afterEach(() => {
    cleanup();
  });

  it('should render applications page with title and table', () => {
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    expect(screen.getByText('Aplicações')).toBeInTheDocument();
    expect(screen.getByText('Gerencie suas aplicações')).toBeInTheDocument();
    expect(screen.getByTestId('applications-table')).toBeInTheDocument();
    expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
  });

  it('should call refreshApplications when refresh button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    await user.click(screen.getByTestId('applications-page-refresh-button'));
    
    expect(refreshApplicationsMock).toHaveBeenCalled();
  });

  it('should call deleteApplication when delete action is triggered', async () => {
    const user = userEvent.setup();
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    await user.click(screen.getByTestId('mock-delete-button'));
    
    expect(deleteApplicationMock).toHaveBeenCalledWith('1');
  });

  it('should open create modal when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // Click the Add button
    await user.click(screen.getByTestId('applications-page-add-button'));
    
    // Check that openModal was called
    expect(mockOpenModal).toHaveBeenCalled();
    
    // Update the modal state manually
    modalState.isOpen = true;
    modalState.applicationToEdit = null;
    
    // Rerender with updated modal state
    cleanup();
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // The modal should be visible now
    expect(screen.getByTestId('create-application-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-edit-mode')).toHaveTextContent('create');
  });

  it('should call createApplication when form is submitted', async () => {
    const user = userEvent.setup();
    
    // Set modal as open before rendering
    modalState.isOpen = true;
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // Modal should be visible
    expect(screen.getByTestId('create-application-modal')).toBeInTheDocument();
    
    // Click submit button
    await user.click(screen.getByTestId('modal-create-button'));
    
    // Verify create was called
    expect(createApplicationMock).toHaveBeenCalledWith({
      name: 'New App',
      slug: 'new-app',
    });
    
    // Modal should be closed
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should open edit modal when edit action is triggered', async () => {
    const user = userEvent.setup();
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // Click edit button
    await user.click(screen.getByTestId('mock-edit-button'));
    
    // Check that openEditModal was called
    expect(mockOpenEditModal).toHaveBeenCalled();
    
    // Update the modal state manually
    modalState.isOpen = true;
    modalState.applicationToEdit = mockApplications[0];
    
    // Rerender with updated modal state
    cleanup();
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // The modal should be visible now in edit mode
    expect(screen.getByTestId('create-application-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-edit-mode')).toHaveTextContent('edit');
  });

  it('should update application when edit form is submitted', async () => {
    const user = userEvent.setup();
    
    // Set modal as open in edit mode before rendering
    modalState.isOpen = true;
    modalState.applicationToEdit = mockApplications[0];
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    // Modal should be visible in edit mode
    expect(screen.getByTestId('create-application-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-edit-mode')).toHaveTextContent('edit');
    
    // Click submit button
    await user.click(screen.getByTestId('modal-create-button'));
    
    // Verify update was called
    expect(updateApplicationMock).toHaveBeenCalledWith('1', {
      name: 'New App',
      slug: 'new-app',
    });
    
    // Modal should be closed
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should display error alert when error is present', () => {
    // Override the mock implementation for this test only
    vi.mocked(ApplicationsHook.useApplications).mockImplementationOnce(() => ({
      applications: [],
      isLoading: false,
      isRefreshing: false,
      error: 'Falha ao carregar aplicações',
      refreshApplications: refreshApplicationsMock,
      createApplication: createApplicationMock,
      updateApplication: updateApplicationMock,
      deleteApplication: deleteApplicationMock,
    }));
    
    render(<ApplicationsPage />, { wrapper: TestWrapper });
    
    const errorAlert = screen.getByTestId('applications-page-error-alert');

    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Falha ao carregar aplicações');
  });
});
