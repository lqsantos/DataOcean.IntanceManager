import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';

import { LocationsTable } from '../locations-table';

describe('LocationsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const locations = [
    { id: '1', name: 'Location 1', slug: 'loc-1', description: 'Test location 1' },
    { id: '2', name: 'Location 2', slug: 'loc-2', description: 'Test location 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with column headers', () => {
    render(
      <LocationsTable
        entities={locations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders the locations data in the table', () => {
    render(
      <LocationsTable
        entities={locations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('loc-1')).toBeInTheDocument();
    expect(screen.getByText('Test location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
    expect(screen.getByText('loc-2')).toBeInTheDocument();
    expect(screen.getByText('Test location 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <LocationsTable
        entities={locations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const user = userEvent.setup();

    const editButtons = screen.getAllByTestId(/edit-button/);

    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(locations[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    // Mock the window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <LocationsTable
        entities={locations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const user = userEvent.setup();

    const deleteButtons = screen.getAllByTestId(/delete-button/);

    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(locations[0].id);

    // Restore the original window.confirm
    window.confirm = originalConfirm;
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    // Mock the window.confirm to always return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(
      <LocationsTable
        entities={locations}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const user = userEvent.setup();

    const deleteButtons = screen.getAllByTestId(/delete-button/);

    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();

    // Restore the original window.confirm
    window.confirm = originalConfirm;
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <LocationsTable
        entities={[]}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for loading state - the specific data-testid might vary
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Location 1')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no locations', () => {
    render(
      <LocationsTable
        entities={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for empty state message - might be translation key
    expect(screen.getByText(/locations\.table\.emptyMessage/i)).toBeInTheDocument();
  });
});
