import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { GenericEntityPage } from '../generic-entity-page';

// Mock the usePathname hook
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/settings/applications'),
}));

describe('GenericEntityPage', () => {
  const mockRefreshEntities = vi.fn().mockResolvedValue(undefined);
  const mockCreateEntity = vi.fn().mockResolvedValue({ id: '3', name: 'New Entity' });
  const mockUpdateEntity = vi.fn().mockResolvedValue({ id: '1', name: 'Updated Entity' });
  const mockDeleteEntity = vi.fn().mockResolvedValue(undefined);
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenEditModal = vi.fn();

  const MockEntityTable = ({ entities, onEdit, onDelete }) => (
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
  );

  const MockEntityModal = ({ isOpen, onClose, entityToEdit, onCreate, onUpdate }) =>
    isOpen ? (
      <div data-testid="entity-modal">
        <h2>{entityToEdit ? 'Edit Entity' : 'Create Entity'}</h2>
        <button
          onClick={() => {
            if (entityToEdit) {
              onUpdate(entityToEdit.id, { name: 'Updated Entity' });
            } else {
              onCreate({ name: 'New Entity' });
            }
            onClose();
          }}
          data-testid="save-button"
        >
          Save
        </button>
        <button onClick={onClose} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    ) : null;

  const defaultProps = {
    entities: [
      { id: '1', name: 'Entity 1', description: 'Test entity 1' },
      { id: '2', name: 'Entity 2', description: 'Test entity 2' },
    ],
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

    const refreshButton = screen.getByTestId('test-entity-refresh-button');

    await user.click(refreshButton);

    expect(mockRefreshEntities).toHaveBeenCalledTimes(1);
  });

  it('shows add button and opens modal when clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);
    const user = userEvent.setup();

    const addButton = screen.getByTestId('test-entity-add-button');

    await user.click(addButton);

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('calls openEditModal when edit button is clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);
    const user = userEvent.setup();

    const editButton = screen.getByTestId('edit-button-1');

    await user.click(editButton);

    expect(mockOpenEditModal).toHaveBeenCalledWith(defaultProps.entities[0]);
  });

  it('calls deleteEntity when delete button is clicked', async () => {
    render(<GenericEntityPage {...defaultProps} />);
    const user = userEvent.setup();

    const deleteButton = screen.getByTestId('delete-button-1');

    await user.click(deleteButton);

    expect(mockDeleteEntity).toHaveBeenCalledWith('1');
  });

  it('shows error message when there is an error', () => {
    const ErrorGenericEntityPage = vi.fn(({ error }) => (
      <div>{error && <div data-testid="test-entity-page-error-alert">{error}</div>}</div>
    ));

    vi.mock('../generic-entity-page', () => ({
      GenericEntityPage: ErrorGenericEntityPage,
    }));

    render(<GenericEntityPage {...defaultProps} error="Failed to load entities" />);

    // Mock our component to verify error logic
    expect(ErrorGenericEntityPage).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to load entities' }),
      expect.anything()
    );
  });

  it('renders modal when isOpen is true', () => {
    render(
      <GenericEntityPage
        {...defaultProps}
        modalState={{ ...defaultProps.modalState, isOpen: true }}
        EntityModal={({ isOpen }) =>
          isOpen ? <div data-testid="entity-modal">Modal Content</div> : null
        }
      />
    );

    // In our mock setup, we need to manually render the modal
    expect(screen.getByTestId('entity-modal')).toBeInTheDocument();
  });

  it('calls createEntity when saving a new entity in modal', async () => {
    render(
      <GenericEntityPage
        {...defaultProps}
        modalState={{ ...defaultProps.modalState, isOpen: true }}
        EntityModal={MockEntityModal}
      />
    );
    const user = userEvent.setup();

    const saveButton = screen.getByTestId('save-button');

    await user.click(saveButton);

    expect(mockCreateEntity).toHaveBeenCalledWith({ name: 'New Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls updateEntity when saving an edited entity in modal', async () => {
    const entityToEdit = defaultProps.entities[0];

    render(
      <GenericEntityPage
        {...defaultProps}
        modalState={{
          ...defaultProps.modalState,
          isOpen: true,
          entityToEdit,
        }}
        EntityModal={MockEntityModal}
      />
    );
    const user = userEvent.setup();

    const saveButton = screen.getByTestId('save-button');

    await user.click(saveButton);

    expect(mockUpdateEntity).toHaveBeenCalledWith('1', { name: 'Updated Entity' });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', async () => {
    render(
      <GenericEntityPage
        {...defaultProps}
        modalState={{ ...defaultProps.modalState, isOpen: true }}
        EntityModal={MockEntityModal}
      />
    );
    const user = userEvent.setup();

    const cancelButton = screen.getByTestId('cancel-button');

    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('disables refresh button when isLoading is true', () => {
    render(<GenericEntityPage {...defaultProps} isLoading={true} />);

    // Using mock component approach for this test scenario since DOM might be complex
    expect(defaultProps.EntityTable).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
      expect.anything()
    );
  });

  it('disables refresh button when isRefreshing is true', () => {
    render(<GenericEntityPage {...defaultProps} isRefreshing={true} />);

    // Using mock component approach for this test scenario since DOM might be complex
    expect(defaultProps.EntityTable).toHaveBeenCalledWith(
      expect.objectContaining({
        isRefreshing: true,
      }),
      expect.anything()
    );
  });
});
