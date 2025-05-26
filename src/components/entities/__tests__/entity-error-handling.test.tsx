import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import reactI18nextMock from '@/tests/mocks/i18next';
import { render, screen } from '@/tests/test-utils';

// Use our centralized mock for react-i18next
vi.mock('react-i18next', () => reactI18nextMock);

// Mock the usePathname hook
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/settings/applications'),
}));

// Import the component after mocks
import { GenericEntityPage } from '../generic-entity-page';

// Setup MSW server with error responses using MSW v2 syntax
const server = setupServer(
  http.get('/api/test-entities', () => {
    return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }),
  http.post('/api/test-entities', () => {
    return HttpResponse.json({ message: 'Validation Error' }, { status: 422 });
  }),
  http.delete('/api/test-entities/:id', () => {
    return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
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

    // Verificamos apenas se o elemento de alerta de erro existe
    expect(screen.getByTestId('test-entity-page-error-alert')).toBeInTheDocument();
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

    // Verificamos apenas se o elemento de alerta de erro existe
    expect(screen.getByTestId('test-entity-page-error-alert')).toBeInTheDocument();

    // E também verificamos se a tabela ainda está visível
    expect(screen.getByTestId('entity-table')).toBeInTheDocument();
  });
});
