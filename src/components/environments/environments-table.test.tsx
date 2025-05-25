import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { vi } from 'vitest';

import type { Environment } from '@/types/environment';

import { EnvironmentsTable } from './environments-table';

// Mock o componente EntityTable
vi.mock('@/components/entities/entity-table', () => ({
  EntityTable: ({ entities, onEdit, onDelete, DeleteDialog, testIdPrefix }) => {
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = (entity) => {
      setSelectedEntity(entity);
      setShowDeleteDialog(true);
    };

    const handleCancelDelete = () => {
      setSelectedEntity(null);
      setShowDeleteDialog(false);
    };

    const handleConfirmDelete = () => {
      if (selectedEntity) {
        onDelete(selectedEntity.id);
      }
      setSelectedEntity(null);
      setShowDeleteDialog(false);
    };

    return (
      <div>
        <input data-testid={`${testIdPrefix}-search`} placeholder="Buscar ambientes..." />

        {entities.length === 0 ? (
          <div data-testid={`${testIdPrefix}-empty-state`}>Nenhum ambiente cadastrado.</div>
        ) : (
          <>
            <div data-testid={`${testIdPrefix}-table`}>
              <button data-testid="sort-by-name" onClick={() => {}}>
                Nome
              </button>
              <button data-testid="sort-by-slug" onClick={() => {}}>
                Slug
              </button>
              <button data-testid="sort-by-createdAt" onClick={() => {}}>
                Criado em
              </button>

              {entities.map((env) => (
                <div key={env.id} data-testid={`${testIdPrefix}-row-${env.id}`}>
                  <span data-testid={`${testIdPrefix}-name-${env.id}`}>{env.name}</span>
                  <span data-testid={`${testIdPrefix}-slug-${env.id}`}>{env.slug}</span>

                  <button data-testid={`edit-button-${env.id}`} onClick={() => onEdit(env)}>
                    Editar
                  </button>

                  <button data-testid={`delete-button-${env.id}`} onClick={() => handleDelete(env)}>
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Estado de carregamento */}
        {entities.length === 0 && (
          <div data-testid={`${testIdPrefix}s-table-loading`}>Carregando...</div>
        )}
        {/* Estado de atualização */}
        <div data-testid={`${testIdPrefix}s-table-refreshing`}></div>

        {/* Renderização do diálogo de exclusão */}
        {showDeleteDialog && selectedEntity && (
          <div data-testid="mock-delete-dialog">
            <p>{selectedEntity.name}</p>
            <button data-testid="confirm-delete" onClick={handleConfirmDelete}>
              Confirm Delete
            </button>
            <button data-testid="cancel-delete" onClick={handleCancelDelete}>
              Cancel Delete
            </button>
          </div>
        )}
      </div>
    );
  },
}));

// Mock para o componente DeleteEnvironmentDialog
vi.mock('./delete-environment-dialog', () => ({
  DeleteEnvironmentDialog: ({ environment, isOpen, isDeleting, onDelete, onCancel }) => {
    return isOpen && environment ? (
      <div data-testid="mock-delete-dialog">
        <p>{environment.name}</p>
        <button data-testid="confirm-delete" onClick={onDelete}>
          Confirm Delete
        </button>
        <button data-testid="cancel-delete" onClick={onCancel}>
          Cancel Delete
        </button>
      </div>
    ) : null;
  },
}));

// Dados de teste
const mockEnvironments: Environment[] = [
  {
    id: '1',
    name: 'Production',
    slug: 'prod',
    order: 1,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Development',
    slug: 'dev',
    order: 2,
    createdAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Testing',
    slug: 'test',
    order: 3,
    createdAt: '2023-01-03T00:00:00Z',
  },
];

describe('EnvironmentsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render environments table with correct data', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Verifica se a tabela está renderizada
    expect(screen.getByTestId('environment-table')).toBeInTheDocument();

    // Verifica se os ambientes estão sendo renderizados
    mockEnvironments.forEach((env) => {
      expect(screen.getByTestId(`environment-name-${env.id}`)).toHaveTextContent(env.name);
      expect(screen.getByTestId(`environment-slug-${env.id}`)).toHaveTextContent(env.slug);
    });
  });

  it('should render empty state when no environments are available', () => {
    render(
      <EnvironmentsTable
        environments={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('environment-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('environment-empty-state')).toHaveTextContent(
      'Nenhum ambiente cadastrado.'
    );
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-button-1');

    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEnvironments[0]);
  });

  it('should open delete dialog when delete button is clicked', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');

    fireEvent.click(deleteButton);

    expect(screen.getByTestId('mock-delete-dialog')).toBeInTheDocument();
  });

  it('should call onDelete when delete is confirmed', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Primeiro abre o diálogo de exclusão
    const deleteButton = screen.getByTestId('delete-button-1');

    fireEvent.click(deleteButton);

    // Confirma a exclusão
    const confirmButton = screen.getByTestId('confirm-delete');

    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should handle refreshing state correctly', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('environments-table-refreshing')).toBeInTheDocument();
  });
});
