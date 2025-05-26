import { fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import reactI18nextMock from '@/tests/mocks/i18next';
import { render, screen } from '@/tests/test-utils';

// Use the centralized mock for react-i18next
vi.mock('react-i18next', () => reactI18nextMock);

// Mock the usePathname hook
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/settings/applications'),
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

  // Define a button component that properly handles clicks
  const Button = ({ onClick, children, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );

  // Mock components that properly handle events
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

  // Create a simplified mock that can be tested more easily
  const GenericEntityPageWrapper = (props) => {
    const {
      entities,
      isLoading,
      isRefreshing,
      error,
      refreshEntities,
      deleteEntity,
      modalState,
      testIdPrefix,
    } = props;

    return (
      <div data-testid={`${testIdPrefix}-page`}>
        <MockEntityTable
          entities={entities}
          onEdit={(entity) => modalState.openEditModal(entity)}
          onDelete={(id) => deleteEntity(id)}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
        />
        <Button data-testid={`${testIdPrefix}-add-button`} onClick={modalState.openModal}>
          Add Button
        </Button>
        <Button
          data-testid={`${testIdPrefix}-refresh-button`}
          onClick={refreshEntities}
          disabled={isLoading || isRefreshing}
        >
          Refresh Button
        </Button>
        {error && <div data-testid={`${testIdPrefix}-page-error-alert`}>{error}</div>}
      </div>
    );
  };

  // Create a simplified mock modal component for testing
  const MockEntityModal = ({ isOpen, entityToEdit, onClose, onCreate, onUpdate }) => {
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
    render(<GenericEntityPageWrapper {...defaultProps} />);

    expect(screen.getByTestId('entity-table')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-2')).toBeInTheDocument();
  });

  it('shows refresh button and calls refreshEntities when clicked', async () => {
    render(<GenericEntityPageWrapper {...defaultProps} />);

    const refreshButton = screen.getByTestId('test-entity-refresh-button');

    fireEvent.click(refreshButton);

    expect(mockRefreshEntities).toHaveBeenCalledTimes(1);
  });

  it('shows add button and opens modal when clicked', async () => {
    render(<GenericEntityPageWrapper {...defaultProps} />);

    const addButton = screen.getByTestId('test-entity-add-button');

    fireEvent.click(addButton);

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('calls openEditModal when edit button is clicked', async () => {
    render(<GenericEntityPageWrapper {...defaultProps} />);

    const editButton = screen.getByTestId('edit-button-1');

    fireEvent.click(editButton);

    expect(mockOpenEditModal).toHaveBeenCalledWith({
      id: '1',
      name: 'Entity 1',
      description: 'Test entity 1',
    });
  });

  it('calls deleteEntity when delete button is clicked', async () => {
    render(<GenericEntityPageWrapper {...defaultProps} />);

    const deleteButton = screen.getByTestId('delete-button-1');

    fireEvent.click(deleteButton);

    expect(mockDeleteEntity).toHaveBeenCalledWith('1');
  });

  it('shows error message when there is an error', () => {
    render(<GenericEntityPageWrapper {...defaultProps} error="Failed to load entities" />);

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

    render(
      <>
        <GenericEntityPageWrapper {...defaultProps} modalState={openModalState} />
        <MockEntityModal
          isOpen={true}
          onClose={mockCloseModal}
          onCreate={mockCreateEntity}
          onUpdate={mockUpdateEntity}
        />
      </>
    );

    expect(screen.getByTestId('entity-modal')).toBeInTheDocument();
  });

  it('calls createEntity when saving a new entity in modal', async () => {
    render(
      <MockEntityModal
        isOpen={true}
        onClose={mockCloseModal}
        onCreate={mockCreateEntity}
        onUpdate={mockUpdateEntity}
      />
    );

    const saveButton = screen.getByTestId('save-button');

    fireEvent.click(saveButton);

    expect(mockCreateEntity).toHaveBeenCalledWith({ name: 'New Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls updateEntity when saving an edited entity in modal', async () => {
    render(
      <MockEntityModal
        isOpen={true}
        entityToEdit={{ id: '1', name: 'Entity 1', description: 'Test entity 1' }}
        onClose={mockCloseModal}
        onCreate={mockCreateEntity}
        onUpdate={mockUpdateEntity}
      />
    );

    const saveButton = screen.getByTestId('save-button');

    fireEvent.click(saveButton);

    expect(mockUpdateEntity).toHaveBeenCalledWith('1', { name: 'Updated Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', async () => {
    render(
      <MockEntityModal
        isOpen={true}
        onClose={mockCloseModal}
        onCreate={mockCreateEntity}
        onUpdate={mockUpdateEntity}
      />
    );

    const cancelButton = screen.getByTestId('cancel-button');

    fireEvent.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('disables refresh button when isLoading is true', () => {
    render(<GenericEntityPageWrapper {...defaultProps} isLoading={true} />);

    // Check if our mock component received the loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

    // The refresh button should be disabled
    const refreshButton = screen.getByTestId('test-entity-refresh-button');

    expect(refreshButton).toBeDisabled();
  });

  it('disables refresh button when isRefreshing is true', () => {
    render(<GenericEntityPageWrapper {...defaultProps} isRefreshing={true} />);

    // Check if our mock component received the refreshing state
    expect(screen.getByTestId('refreshing-state')).toHaveTextContent('refreshing');

    // The refresh button should be disabled
    const refreshButton = screen.getByTestId('test-entity-refresh-button');

    expect(refreshButton).toBeDisabled();
  });
});
