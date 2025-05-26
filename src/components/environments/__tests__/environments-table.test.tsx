import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { EnvironmentsTable } from '../environments-table';

describe('EnvironmentsTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const environments = [
    { id: '1', name: 'Environment 1', slug: 'env-1', description: 'Test environment 1' },
    { id: '2', name: 'Environment 2', slug: 'env-2', description: 'Test environment 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with column headers', () => {
    render(
      <EnvironmentsTable
        entities={environments}
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

  it('renders the environments data in the table', () => {
    render(
      <EnvironmentsTable
        entities={environments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Environment 1')).toBeInTheDocument();
    expect(screen.getByText('env-1')).toBeInTheDocument();
    expect(screen.getByText('Test environment 1')).toBeInTheDocument();
    expect(screen.getByText('Environment 2')).toBeInTheDocument();
    expect(screen.getByText('env-2')).toBeInTheDocument();
    expect(screen.getByText('Test environment 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <EnvironmentsTable
        entities={environments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const user = userEvent.setup();

    const editButtons = screen.getAllByTestId(/edit-button/);

    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(environments[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    // Mock the window.confirm to always return true
    const originalConfirm = window.confirm;

    window.confirm = vi.fn(() => true);

    render(
      <EnvironmentsTable
        entities={environments}
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
    expect(mockOnDelete).toHaveBeenCalledWith(environments[0].id);

    // Restore the original window.confirm
    window.confirm = originalConfirm;
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    // Mock the window.confirm to always return false
    const originalConfirm = window.confirm;

    window.confirm = vi.fn(() => false);

    render(
      <EnvironmentsTable
        entities={environments}
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
      <EnvironmentsTable
        entities={[]}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('environments-table-loading')).toBeInTheDocument();
    expect(screen.queryByText('Environment 1')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no environments', () => {
    render(
      <EnvironmentsTable
        entities={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/no environments found/i)).toBeInTheDocument();
  });
});
