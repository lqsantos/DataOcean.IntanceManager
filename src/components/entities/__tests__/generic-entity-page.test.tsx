import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { GenericEntityPage } from '../generic-entity-page';

// Mock the usePathname hook
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/settings/applications'),
}));

// Complete mock for react-i18next with initReactI18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => (key.includes(':') ? key.split(':')[1] : key),
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

describe('GenericEntityPage', () => {
  // Set up all the mocks
  const mockRefreshEntities = vi.fn().mockResolvedValue(undefined);
  const mockCreateEntity = vi.fn().mockResolvedValue({ id: '3', name: 'New Entity' });
  const mockUpdateEntity = vi.fn().mockResolvedValue({ id: '1', name: 'Updated Entity' });
  const mockDeleteEntity = vi.fn().mockResolvedValue(undefined);
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenEditModal = vi.fn();

  // Sample entities for testing
  const mockEntities = [
    { id: '1', name: 'Entity 1', description: 'Test entity 1' },
    { id: '2', name: 'Entity 2', description: 'Test entity 2' },
  ];

  // Mock a simple EntityTable component
  const MockEntityTable = ({ entities, onEdit, onDelete, isLoading, isRefreshing, error }) => (
    <>
      {error && <div data-testid="error-message">{error}</div>}
      <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="refreshing-state">{isRefreshing ? 'refreshing' : 'not-refreshing'}</div>
      <table data-testid="entity-table">
        <tbody>
          {entities.map((entity) => (
            <tr key={entity.id} data-testid={`entity-row-${entity.id}`}>
              <td>{entity.name}</td>
              <td>
                <button onClick={() => onEdit(entity)} data-testid={`edit-button-${entity.id}`}>
                  Edit
                </button>
                <button
                  onClick={() => onDelete(entity.id)}
                  data-testid={`delete-button-${entity.id}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  // Mock a simple EntityModal component
  // This is a controlled component that renders based on isOpen prop
  const MockEntityModal = ({ isOpen, onClose, entityToEdit, onCreate, onUpdate }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div data-testid="entity-modal">
        <h3>{entityToEdit ? 'Edit Entity' : 'Create Entity'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (entityToEdit) {
              onUpdate(entityToEdit.id, { name: 'Updated Entity' });
            } else {
              onCreate({ name: 'New Entity' });
            }
            onClose();
          }}
        >
          <input defaultValue={entityToEdit?.name || ''} data-testid="entity-name-input" />
          <button type="submit" data-testid="save-button">
            Save
          </button>
          <button type="button" onClick={onClose} data-testid="cancel-button">
            Cancel
          </button>
        </form>
      </div>
    );
  };

  const defaultProps = {
    entities: mockEntities,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshEntities: mockRefreshEntities,
    createEntity: mockCreateEntity,
    updateEntity: mockUpdateEntity,
    deleteEntity: mockDeleteEntity,
    EntityTable: MockEntityTable,
    EntityModal: MockEntityModal,
    entityName: {
      singular: 'Entity',
      plural: 'Entities',
      description: 'Manage your entities',
    },
    modalState: {
      isOpen: false,
      entityToEdit: null,
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    },
    testIdPrefix: 'test-entity',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the entity page with table', () => {
    render(<GenericEntityPage {...defaultProps} />);

    expect(screen.getByTestId('entity-table')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-2')).toBeInTheDocument();
  });

  it('shows refresh button and calls refreshEntities when clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);

    const user = userEvent.setup();
    // The button is provided by the GenericEntityPage component
    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');

    await user.click(refreshButton);

    expect(mockRefreshEntities).toHaveBeenCalledTimes(1);
  });

  it('shows add button and opens modal when clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);

    const user = userEvent.setup();
    // The button is provided by the GenericEntityPage component
    const addButton = screen.getByTestId('test-entity-page-add-button');

    await user.click(addButton);

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('calls openEditModal when edit button is clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);

    const user = userEvent.setup();
    const editButton = screen.getByTestId('edit-button-1');

    await user.click(editButton);

    expect(mockOpenEditModal).toHaveBeenCalledWith({
      id: '1',
      name: 'Entity 1',
      description: 'Test entity 1',
    });
  });

  it('calls deleteEntity when delete button is clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);

    const user = userEvent.setup();
    const deleteButton = screen.getByTestId('delete-button-1');

    await user.click(deleteButton);

    expect(mockDeleteEntity).toHaveBeenCalledWith('1');
  });

  it('shows error message when there is an error', () => {
    render(<GenericEntityPage {...defaultProps} error="Failed to load entities" />);

    // The error is passed directly to our mock component
    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load entities');
  });

  it('renders modal when isOpen is true', () => {
    // Create a custom modal state with isOpen=true
    const openModalState = {
      isOpen: true,
      entityToEdit: null,
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    };

    render(<GenericEntityPage {...defaultProps} modalState={openModalState} />);

    expect(screen.getByTestId('entity-modal')).toBeInTheDocument();
    expect(screen.getByText('Create Entity')).toBeInTheDocument();
  });

  it('calls createEntity when saving a new entity in modal', async () => {
    // Custom modal state with isOpen=true for creation
    const openModalState = {
      isOpen: true,
      entityToEdit: null,
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    };

    render(<GenericEntityPage {...defaultProps} modalState={openModalState} />);

    const user = userEvent.setup();
    const saveButton = screen.getByTestId('save-button');

    await user.click(saveButton);

    expect(mockCreateEntity).toHaveBeenCalledWith({ name: 'New Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls updateEntity when saving an edited entity in modal', async () => {
    // Custom modal state with isOpen=true and entityToEdit for editing
    const openModalState = {
      isOpen: true,
      entityToEdit: { id: '1', name: 'Entity 1', description: 'Test entity 1' },
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    };

    render(<GenericEntityPage {...defaultProps} modalState={openModalState} />);

    const user = userEvent.setup();
    const saveButton = screen.getByTestId('save-button');

    await user.click(saveButton);

    expect(mockUpdateEntity).toHaveBeenCalledWith('1', { name: 'Updated Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', async () => {
    // Custom modal state with isOpen=true
    const openModalState = {
      isOpen: true,
      entityToEdit: null,
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    };

    render(<GenericEntityPage {...defaultProps} modalState={openModalState} />);

    const user = userEvent.setup();
    const cancelButton = screen.getByTestId('cancel-button');

    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('disables refresh button when isLoading is true', () => {
    render(<GenericEntityPage {...defaultProps} isLoading={true} />);

    // Check if our mock component received the loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

    // The refresh button should be disabled
    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');

    expect(refreshButton).toBeDisabled();
  });

  it('disables refresh button when isRefreshing is true', () => {
    render(<GenericEntityPage {...defaultProps} isRefreshing={true} />);

    // Check if our mock component received the refreshing state
    expect(screen.getByTestId('refreshing-state')).toHaveTextContent('refreshing');

    // The refresh button should be disabled
    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');

    expect(refreshButton).toBeDisabled();
  });
});
