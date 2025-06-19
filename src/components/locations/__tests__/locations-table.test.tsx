import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@/tests/test-utils';
import type { Location } from '@/types/location';

import { LocationsTable } from '../locations-table';

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
                  No locations found
                </td>
              </tr>
            ) : (
              entities.map((location: Location) => (
                <tr key={location.id} data-testid={`${testIdPrefix}-row-${location.id}`}>
                  <td>{location.name}</td>
                  <td>{location.slug}</td>
                  <td>{location.description}</td>
                  <td>Created date</td>
                  <td>
                    <button
                      data-testid={`${testIdPrefix}-actions-${location.id}`}
                      onClick={() => onEdit(location)}
                    >
                      Action Button
                    </button>
                    <button
                      data-testid={`edit-button-${location.id}`}
                      onClick={() => onEdit(location)}
                      style={{ display: 'none' }}
                    >
                      Edit
                    </button>
                    <button
                      data-testid={`delete-button-${location.id}`}
                      onClick={() => {
                        const shouldDelete = window.confirm('Are you sure?');

                        if (shouldDelete) {
                          onDelete(location.id);
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

// Mock the DeleteLocationDialog
vi.mock('../delete-location-dialog', () => ({
  DeleteLocationDialog: vi.fn(() => null),
}));

// Mock confirm dialog
Object.assign(window, {
  confirm: vi.fn(),
});

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Test location 1',
    slug: 'test-loc-1',
    description: 'Test location description 1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test location 2',
    slug: 'test-loc-2',
    description: 'Test location description 2',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('LocationsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('renders the table with column headers', () => {
    render(
      <LocationsTable
        locations={mockLocations}
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

  it('renders the locations data in the table', () => {
    render(
      <LocationsTable
        locations={mockLocations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test location 1')).toBeInTheDocument();
    expect(screen.getByText('test-loc-1')).toBeInTheDocument();
    expect(screen.getByText('Test location description 1')).toBeInTheDocument();

    expect(screen.getByText('Test location 2')).toBeInTheDocument();
    expect(screen.getByText('test-loc-2')).toBeInTheDocument();
    expect(screen.getByText('Test location description 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <LocationsTable
        locations={mockLocations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const user = userEvent.setup();
    const editButton = screen.getByTestId('edit-button-1');

    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockLocations[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <LocationsTable
        locations={mockLocations}
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
      <LocationsTable
        locations={mockLocations}
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

  it('shows empty state when there are no locations', () => {
    render(
      <LocationsTable
        locations={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No locations found')).toBeInTheDocument();
  });
});
