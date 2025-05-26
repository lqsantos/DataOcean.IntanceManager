import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { render, screen, userEvent } from '@/tests/test-utils';

import { GenericEntityPage } from '../generic-entity-page';

// Setup MSW server with error responses
const server = setupServer(
  rest.get('/api/test-entities', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
  }),
  rest.post('/api/test-entities', (req, res, ctx) => {
    return res(ctx.status(422), ctx.json({ message: 'Validation Error' }));
  }),
  rest.delete('/api/test-entities/:id', (req, res, ctx) => {
    return res(ctx.status(403), ctx.json({ message: 'Forbidden' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Entity Error Handling', () => {
  // Mock components
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

  // Test error scenarios
  it('displays an error message when entity data fails to load', async () => {
    const mockRefreshEntities = vi.fn().mockRejectedValue(new Error('Failed to load entities'));

    render(
      <GenericEntityPage
        entities={[]}
        isLoading={false}
        isRefreshing={false}
        error="Failed to load entities"
        refreshEntities={mockRefreshEntities}
        createEntity={vi.fn()}
        updateEntity={vi.fn()}
        deleteEntity={vi.fn()}
        EntityTable={MockEntityTable}
        EntityModal={MockEntityModal}
        entityName={{
          singular: 'Entity',
          plural: 'Entities',
          description: 'Manage your entities',
        }}
        modalState={{
          isOpen: false,
          entityToEdit: null,
          openModal: vi.fn(),
          openEditModal: vi.fn(),
          closeModal: vi.fn(),
        }}
        testIdPrefix="test-entity"
      />
    );

    expect(screen.getByTestId('test-entity-page-error-alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load entities')).toBeInTheDocument();
  });

  it('keeps the entity table visible even when there is an error', async () => {
    const entities = [
      { id: '1', name: 'Entity 1', description: 'Test entity 1' },
      { id: '2', name: 'Entity 2', description: 'Test entity 2' },
    ];

    render(
      <GenericEntityPage
        entities={entities}
        isLoading={false}
        isRefreshing={false}
        error="Failed to refresh entities"
        refreshEntities={vi.fn()}
        createEntity={vi.fn()}
        updateEntity={vi.fn()}
        deleteEntity={vi.fn()}
        EntityTable={MockEntityTable}
        EntityModal={MockEntityModal}
        entityName={{
          singular: 'Entity',
          plural: 'Entities',
          description: 'Manage your entities',
        }}
        modalState={{
          isOpen: false,
          entityToEdit: null,
          openModal: vi.fn(),
          openEditModal: vi.fn(),
          closeModal: vi.fn(),
        }}
        testIdPrefix="test-entity"
      />
    );

    expect(screen.getByTestId('test-entity-page-error-alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to refresh entities')).toBeInTheDocument();
    expect(screen.getByTestId('entity-table')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('entity-row-2')).toBeInTheDocument();
  });

  it('allows users to retry after an error occurs', async () => {
    const mockRefreshEntities = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <GenericEntityPage
        entities={[]}
        isLoading={false}
        isRefreshing={false}
        error="Failed to load entities"
        refreshEntities={mockRefreshEntities}
        createEntity={vi.fn()}
        updateEntity={vi.fn()}
        deleteEntity={vi.fn()}
        EntityTable={MockEntityTable}
        EntityModal={MockEntityModal}
        entityName={{
          singular: 'Entity',
          plural: 'Entities',
          description: 'Manage your entities',
        }}
        modalState={{
          isOpen: false,
          entityToEdit: null,
          openModal: vi.fn(),
          openEditModal: vi.fn(),
          closeModal: vi.fn(),
        }}
        testIdPrefix="test-entity"
      />
    );

    expect(screen.getByTestId('test-entity-page-error-alert')).toBeInTheDocument();

    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');
    const user = userEvent.setup();

    await user.click(refreshButton);

    expect(mockRefreshEntities).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during API calls', () => {
    render(
      <GenericEntityPage
        entities={[]}
        isLoading={true}
        isRefreshing={false}
        error={null}
        refreshEntities={vi.fn()}
        createEntity={vi.fn()}
        updateEntity={vi.fn()}
        deleteEntity={vi.fn()}
        EntityTable={MockEntityTable}
        EntityModal={MockEntityModal}
        entityName={{
          singular: 'Entity',
          plural: 'Entities',
          description: 'Manage your entities',
        }}
        modalState={{
          isOpen: false,
          entityToEdit: null,
          openModal: vi.fn(),
          openEditModal: vi.fn(),
          closeModal: vi.fn(),
        }}
        testIdPrefix="test-entity"
      />
    );

    // Verify refresh button is disabled during loading
    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');

    expect(refreshButton).toBeDisabled();
  });
});
