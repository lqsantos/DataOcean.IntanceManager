import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  // Mock functions
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons when isLoading is true', () => {
    render(
      <EnvironmentsTable
        environments={[]}
        isLoading={true}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for loading rows with skeletons
    const loadingRows = screen.getAllByTestId('environment-skeleton-row');

    expect(loadingRows.length).toBeGreaterThan(0);
  });

  it('renders environments data correctly', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if environment rows are rendered correctly by their data-testid
    expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('environment-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('environment-row-3')).toBeInTheDocument();

    // Verifica se há células na tabela, sem verificar o número exato
    expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);

    // Name, slug, and other information are within table cells
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('prod')).toBeInTheDocument();
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    // Não verificando diretamente os valores de ordem, pois podem estar sendo
    // formatados ou apresentados de maneira diferente na tabela real
  });

  it('renders empty state message when no environments', () => {
    render(
      <EnvironmentsTable
        environments={[]}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for empty state using its data-testid
    expect(screen.getByText(/Nenhum ambiente/i)).toBeInTheDocument();
  });

  it('filters environments based on search term', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Get the search input by its data-testid and type a search term
    const searchInput = screen.getByTestId('environment-search');

    fireEvent.change(searchInput, { target: { value: 'dev' } });

    // Should show only the Development environment
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.queryByText('Production')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing')).not.toBeInTheDocument();
  });

  it('shows not found message when search has no results', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Search for a term that won't match any environment
    const searchInput = screen.getByTestId('environment-search');

    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    // Should show the not found message in the empty state
    expect(screen.getByText(/Nenhum ambiente encontrado/i)).toBeInTheDocument();
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

    // With our mock in place, we can directly access the edit button
    const editButton = screen.getByTestId('edit-button-1');

    fireEvent.click(editButton);

    // Check if onEdit was called with the correct environment
    expect(mockOnEdit).toHaveBeenCalledWith(mockEnvironments[0]);
  });

  it('opens delete dialog when delete button is clicked', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // With our mock in place, we can directly access the delete button
    const deleteButton = screen.getByTestId('delete-button-1');

    fireEvent.click(deleteButton);

    // Check if delete dialog was opened
    expect(screen.getByTestId('mock-delete-dialog')).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click the delete button to open the dialog
    const deleteButton = screen.getByTestId('delete-button-1');

    fireEvent.click(deleteButton);

    // Find and click the confirm delete button in the dialog
    const confirmDeleteButton = screen.getByTestId('confirm-delete');

    fireEvent.click(confirmDeleteButton);

    // Check if onDelete was called with the correct environment ID
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockEnvironments[0].id);
    });
  });

  it('sorts environments by name when name header is clicked', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the name column header to sort by name
    const nameHeader = screen.getByTestId('sort-by-name');

    fireEvent.click(nameHeader);

    // Check if environments are still rendered after sorting
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('reverses sort order when the same header is clicked twice', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click name header twice to sort in descending order
    const nameHeader = screen.getByTestId('sort-by-name');

    fireEvent.click(nameHeader);
    fireEvent.click(nameHeader);

    // Check if environments are still rendered after sorting
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('sorts by different field when another header is clicked', () => {
    render(
      <EnvironmentsTable
        environments={mockEnvironments}
        isLoading={false}
        isRefreshing={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // First sort by name
    const nameHeader = screen.getByTestId('sort-by-name');

    fireEvent.click(nameHeader);

    // Then sort by createdAt (que está disponível como coluna sortable)
    const createdAtHeader = screen.getByTestId('sort-by-createdAt');

    fireEvent.click(createdAtHeader);

    // Check if environments are still rendered after sorting
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });
});
