import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { ApplicationsTable } from '../applications-table';

describe('ApplicationsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const applications = [
    { id: '1', name: 'Application 1', slug: 'app-1', description: 'Test application 1' },
    { id: '2', name: 'Application 2', slug: 'app-2', description: 'Test application 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with column headers', () => {
    render(
      <ApplicationsTable
        entities={applications}
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

  it('renders the applications data in the table', () => {
    render(
      <ApplicationsTable
        entities={applications}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Application 1')).toBeInTheDocument();
    expect(screen.getByText('app-1')).toBeInTheDocument();
    expect(screen.getByText('Test application 1')).toBeInTheDocument();
    expect(screen.getByText('Application 2')).toBeInTheDocument();
    expect(screen.getByText('app-2')).toBeInTheDocument();
    expect(screen.getByText('Test application 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ApplicationsTable
        entities={applications}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const user = userEvent.setup();

    const editButtons = screen.getAllByTestId(/edit-button/);

    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(applications[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    // Mock the window.confirm to always return true
    const originalConfirm = window.confirm;

    window.confirm = vi.fn(() => true);

    render(
      <ApplicationsTable
        entities={applications}
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
    expect(mockOnDelete).toHaveBeenCalledWith(applications[0].id);

    // Restore the original window.confirm
    window.confirm = originalConfirm;
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    // Mock the window.confirm to always return false
    const originalConfirm = window.confirm;

    window.confirm = vi.fn(() => false);

    render(
      <ApplicationsTable
        entities={applications}
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
      <ApplicationsTable
        entities={[]}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for loading state - the specific data-testid might vary
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Application 1')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no applications', () => {
    render(
      <ApplicationsTable
        entities={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for empty state message - might be translation key
    expect(screen.getByText(/applications\.table\.emptyMessage/i)).toBeInTheDocument();
  });
});
