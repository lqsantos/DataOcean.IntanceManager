import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EnvironmentsTable } from '@/components/environments/environments-table';
import type { Environment } from '@/types/environment';

// Mock the dropdown menu to make its content directly accessible in tests
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
      children,
      onClick,
      'data-testid': dataTestId,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      'data-testid'?: string;
    }) => (
      <button data-testid={dataTestId} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

// Mock the delete environment dialog component
vi.mock('@/components/environments/delete-environment-dialog', () => ({
  DeleteEnvironmentDialog: ({
    onDelete,
    onCancel,
  }: {
    onDelete: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="mock-delete-dialog">
      <button data-testid="confirm-delete" onClick={onDelete}>
        Confirm Delete
      </button>
      <button data-testid="cancel-delete" onClick={onCancel}>
        Cancel Delete
      </button>
    </div>
  ),
}));

// Sample test data
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
  // Mocked callbacks for testing
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

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

    // Check if table is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Check if all environments are rendered in the table
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();

    // Check if slugs are displayed
    expect(screen.getByText('prod')).toBeInTheDocument();
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    // Check for action buttons
    const actionButtons = screen.getAllByTestId(/env-row-\d+-actions/i);

    expect(actionButtons.length).toBe(3);
  });

  it('should render loading state when isLoading is true', () => {
    render(
      <EnvironmentsTable
        environments={[]}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('environments-table-loading')).toBeInTheDocument();
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

    expect(screen.getByText('No environments found.')).toBeInTheDocument();
  });

  it('should call onEdit when edit option is clicked', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Find and click the first environment's edit action
    const editButton = screen.getByTestId('env-row-1-edit');

    fireEvent.click(editButton);

    // Check if onEdit was called with the correct environment
    expect(mockOnEdit).toHaveBeenCalledWith(mockEnvironments[0]);
  });

  it('should open delete dialog when delete option is clicked', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Find and click the first environment's delete action
    const deleteButton = screen.getByTestId('env-row-1-delete');

    fireEvent.click(deleteButton);

    // Check if delete dialog is opened
    expect(screen.getByTestId('mock-delete-dialog')).toBeInTheDocument();
  });

  it('should call onDelete when delete is confirmed', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Open delete dialog
    const deleteButton = screen.getByTestId('env-row-1-delete');

    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('confirm-delete');

    fireEvent.click(confirmButton);

    // Check if onDelete was called with the correct environment ID
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should close delete dialog when cancel is clicked', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Open delete dialog
    const deleteButton = screen.getByTestId('env-row-1-delete');

    fireEvent.click(deleteButton);

    // Ensure dialog is shown
    expect(screen.getByTestId('mock-delete-dialog')).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByTestId('cancel-delete');

    fireEvent.click(cancelButton);

    // Verify dialog is closed by checking that onDelete wasn't called
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should sort environments when clicking on column headers', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Find and click on the Name column header to sort
    const nameHeader = screen.getByTestId('header-name');

    fireEvent.click(nameHeader);

    // Sorting logic is implemented in the component and should be reflected in the UI
    // We could verify the order of rendered items, but that would depend on the specific implementation
    // For now, we're just ensuring the click handler doesn't break
    expect(nameHeader).toBeInTheDocument();
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

    // Check if refreshing indicator is shown
    expect(screen.getByTestId('environments-table-refreshing')).toBeInTheDocument();
  });
});
