import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@/tests/test-utils';
import type { Environment } from '@/types/environment';

import { EnvironmentsTable } from '../environments-table';

// Mock the EntityTable component
vi.mock('@/components/entities/entity-table', () => ({
  EntityTable: vi.fn(
    ({ entities, onEdit, onDelete, testIdPrefix, searchPlaceholder, isLoading }) => (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="relative flex-1">
            <span data-testid="search-icon" />
            <input placeholder={searchPlaceholder} data-testid={`${testIdPrefix}-search`} />
          </div>
        </div>
        <div className="rounded-md border">
          {isLoading ? (
            <div data-testid={`${testIdPrefix}s-table-loading`}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>
                    <button data-testid="sort-by-name">
                      Name
                      <span data-testid="chevron-up-icon" />
                    </button>
                  </th>
                  <th>
                    <button data-testid="sort-by-slug">
                      Slug
                      <span data-testid="arrow-up-down-icon" />
                    </button>
                  </th>
                  <th>Description</th>
                  <th>
                    <button data-testid="sort-by-createdAt">
                      columns.createdAt
                      <span data-testid="arrow-up-down-icon" />
                    </button>
                  </th>
                  <th className="w-14">Action Column</th>
                </tr>
              </thead>
              <tbody>
                {entities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      No environments found
                    </td>
                  </tr>
                ) : (
                  entities.map((env: Environment) => (
                    <tr key={env.id} data-testid={`${testIdPrefix}-row-${env.id}`}>
                      <td>{env.name}</td>
                      <td>{env.slug}</td>
                      <td>{env.description}</td>
                      <td>Created date</td>
                      <td>
                        <button
                          data-testid={`${testIdPrefix}-actions-${env.id}`}
                          onClick={() => onEdit(env)}
                        >
                          Action Button
                        </button>
                        <button
                          data-testid={`edit-button-${env.id}`}
                          onClick={() => onEdit(env)}
                          style={{ display: 'none' }}
                        >
                          Edit
                        </button>
                        <button
                          data-testid={`delete-button-${env.id}`}
                          onClick={() => {
                            const shouldDelete = window.confirm('Are you sure?');

                            if (shouldDelete) {
                              onDelete(env.id);
                            }
                          }}
                          style={{ display: 'none' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  ),
}));

// Mock the DeleteEnvironmentDialog
vi.mock('../delete-environment-dialog', () => ({
  DeleteEnvironmentDialog: vi.fn(() => null),
}));

// Mock confirm dialog
Object.assign(window, {
  confirm: vi.fn(),
});

const mockEnvironments: Environment[] = [
  {
    id: '1',
    name: 'Test environment 1',
    slug: 'test-env-1',
    description: 'Test environment description 1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test environment 2',
    slug: 'test-env-2',
    description: 'Test environment description 2',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('EnvironmentsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('renders the table with column headers', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Action Column')).toBeInTheDocument();
  });

  it('renders the environments data in the table', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test environment 1')).toBeInTheDocument();
    expect(screen.getByText('test-env-1')).toBeInTheDocument();
    expect(screen.getByText('Test environment description 1')).toBeInTheDocument();

    expect(screen.getByText('Test environment 2')).toBeInTheDocument();
    expect(screen.getByText('test-env-2')).toBeInTheDocument();
    expect(screen.getByText('Test environment description 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const user = userEvent.setup();
    const editButton = screen.getByTestId('edit-button-1');

    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEnvironments[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const user = userEvent.setup();
    const deleteButton = screen.getByTestId('delete-button-1');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    // Mock confirm to return false
    window.confirm = vi.fn().mockReturnValue(false);

    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const user = userEvent.setup();
    const deleteButton = screen.getByTestId('delete-button-1');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('environments-table-loading')).toBeInTheDocument();
  });
});
