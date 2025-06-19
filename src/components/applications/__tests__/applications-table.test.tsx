import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@/tests/test-utils';
import type { Application } from '@/types/application';

import { ApplicationsTable } from '../applications-table';

// Mock the EntityTable component
vi.mock('@/components/entities/entity-table', () => ({
  EntityTable: vi.fn(({ entities, onEdit, onDelete, testIdPrefix, searchPlaceholder }) => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <span data-testid="search-icon" />
          <input placeholder={searchPlaceholder} data-testid={`${testIdPrefix}-search`} />
        </div>
      </div>
      <div className="rounded-md border">
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
                  No applications found
                </td>
              </tr>
            ) : (
              entities.map((app: Application) => (
                <tr key={app.id} data-testid={`${testIdPrefix}-row-${app.id}`}>
                  <td>{app.name}</td>
                  <td>{app.slug}</td>
                  <td>{app.description}</td>
                  <td>Created date</td>
                  <td>
                    <button
                      data-testid={`${testIdPrefix}-actions-${app.id}`}
                      onClick={() => {
                        // Simulate dropdown menu opening and clicking edit
                        onEdit(app);
                      }}
                    >
                      Action Button
                    </button>
                    <button
                      data-testid={`edit-button-${app.id}`}
                      onClick={() => onEdit(app)}
                      style={{ display: 'none' }}
                    >
                      Edit
                    </button>
                    <button
                      data-testid={`delete-button-${app.id}`}
                      onClick={() => {
                        const shouldDelete = window.confirm('Are you sure?');

                        if (shouldDelete) {
                          onDelete(app.id);
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
      </div>
    </div>
  )),
}));

// Mock the DeleteApplicationDialog
vi.mock('../delete-application-dialog', () => ({
  DeleteApplicationDialog: vi.fn(() => null),
}));

// Mock confirm dialog
Object.assign(window, {
  confirm: vi.fn(),
});

const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Test Application 1',
    slug: 'test-app-1',
    description: 'Test application description 1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Application 2',
    slug: 'test-app-2',
    description: 'Test application description 2',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('ApplicationsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('renders the table with column headers', () => {
    render(
      <ApplicationsTable
        applications={mockApplications}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action Column')).toBeInTheDocument();
  });

  it('renders applications data in the table', () => {
    render(
      <ApplicationsTable
        applications={mockApplications}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Application 1')).toBeInTheDocument();
    expect(screen.getByText('test-app-1')).toBeInTheDocument();
    expect(screen.getByText('Test application description 1')).toBeInTheDocument();

    expect(screen.getByText('Test Application 2')).toBeInTheDocument();
    expect(screen.getByText('test-app-2')).toBeInTheDocument();
    expect(screen.getByText('Test application description 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ApplicationsTable
        applications={mockApplications}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const user = userEvent.setup();
    const editButton = screen.getByTestId('edit-button-1');

    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockApplications[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <ApplicationsTable
        applications={mockApplications}
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
      <ApplicationsTable
        applications={mockApplications}
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

  it('shows empty state when there are no applications', () => {
    render(
      <ApplicationsTable
        applications={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No applications found')).toBeInTheDocument();
  });
});
