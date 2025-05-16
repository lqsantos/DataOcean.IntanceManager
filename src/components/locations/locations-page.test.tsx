import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';

import { useLocations } from '@/hooks/use-locations';

import { LocationsPage } from './locations-page';

// Mock dos hooks e dependências
vi.mock('@/hooks/use-locations', () => ({
  useLocations: vi.fn(),
}));

// Mock do componente LocationsTable
vi.mock('./locations-table', () => ({
  LocationsTable: vi.fn(({ onEdit, onDelete }) => (
    <div data-testid="mock-locations-table">
      <button data-testid="mock-edit-button" onClick={() => onEdit({ id: '123', name: 'Localidade Teste', region: 'us-east-1' })}>
        Editar
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete('123')}>
        Excluir
      </button>
    </div>
  )),
}));

// Mock do componente LocationForm - corrigindo o objeto retornado para corresponder ao caso de edição
vi.mock('./location-form', () => ({
  LocationForm: vi.fn(({ onSubmit, onCancel, location }) => (
    <div data-testid={`mock-location-form-${location ? 'edit' : 'create'}`}>
      <button
        data-testid="mock-form-submit"
        onClick={() =>
          onSubmit({
            name: location ? location.name : 'Nova Localidade',
            region: location ? location.region : 'us-west-1',
          })
        }
      >
        Salvar
      </button>
      <button data-testid="mock-form-cancel" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  )),
}));

describe('LocationsPage', () => {
  // Mock das funções do hook useLocations
  const mockRefreshLocations = vi.fn();
  const mockCreateLocation = vi.fn();
  const mockUpdateLocation = vi.fn();
  const mockDeleteLocation = vi.fn();

  // Estado padrão para o mock
  const defaultMockState = {
    locations: [
      { id: '1', name: 'Localidade 1', region: 'us-east-1' },
      { id: '2', name: 'Localidade 2', region: 'eu-west-1' },
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshLocations: mockRefreshLocations,
    createLocation: mockCreateLocation,
    updateLocation: mockUpdateLocation,
    deleteLocation: mockDeleteLocation,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Limpar o DOM antes de cada teste
    // Configure o mock padrão para useLocations
    (useLocations as Mock).mockReturnValue(defaultMockState);
  });

  it('should render the component correctly', () => {
    render(<LocationsPage />);
    
    expect(screen.getByTestId('locations-page-container')).toBeInTheDocument();
    expect(screen.getByTestId('locations-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('locations-page-refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('locations-page-add-button')).toBeInTheDocument();
    expect(screen.getByTestId('locations-page-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-locations-table')).toBeInTheDocument();
  });

  it('should show error alert when error is not null', () => {
    (useLocations as Mock).mockReturnValue({
      ...defaultMockState,
      error: 'Erro ao carregar localidades',
    });

    render(<LocationsPage />);
    
    expect(screen.getByTestId('locations-page-error-alert')).toBeInTheDocument();
    expect(screen.getByTestId('locations-page-error-message')).toHaveTextContent('Erro ao carregar localidades');
  });

  it('should call refreshLocations when refresh button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    await user.click(screen.getByTestId('locations-page-refresh-button'));
    
    expect(mockRefreshLocations).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button during loading', () => {
    // Teste para estado de carregamento
    (useLocations as Mock).mockReturnValue({
      ...defaultMockState,
      isLoading: true,
    });

    render(<LocationsPage />);
    
    expect(screen.getByTestId('locations-page-refresh-button')).toBeDisabled();
  });

  it('should disable refresh button during refreshing', () => {
    // Teste para estado de atualização
    (useLocations as Mock).mockReturnValue({
      ...defaultMockState,
      isRefreshing: true,
    });

    render(<LocationsPage />);
    
    expect(screen.getByTestId('locations-page-refresh-button')).toBeDisabled();
  });

  it('should open creation dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    expect(screen.queryByTestId('locations-page-create-dialog')).not.toBeInTheDocument();
    
    await user.click(screen.getByTestId('locations-page-add-button'));
    
    expect(screen.getByTestId('locations-page-create-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-form-create')).toBeInTheDocument();
  });

  it('should close creation dialog and call createLocation when form is submitted', async () => {
    mockCreateLocation.mockResolvedValue(undefined);
    
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Open creation dialog
    await user.click(screen.getByTestId('locations-page-add-button'));
    
    // Submit form
    await user.click(screen.getByTestId('mock-form-submit'));
    
    await waitFor(() => {
      expect(mockCreateLocation).toHaveBeenCalledWith({
        name: 'Nova Localidade',
        region: 'us-west-1',
      });
    });
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('locations-page-create-dialog')).not.toBeInTheDocument();
    });
  });

  it('should keep dialog open if an error occurs during creation', async () => {
    mockCreateLocation.mockRejectedValue(new Error('Error creating location'));
    
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Open creation dialog
    await user.click(screen.getByTestId('locations-page-add-button'));
    
    // Submit form
    await user.click(screen.getByTestId('mock-form-submit'));
    
    await waitFor(() => {
      expect(mockCreateLocation).toHaveBeenCalled();
    });
    
    // Dialog should remain open
    expect(screen.getByTestId('locations-page-create-dialog')).toBeInTheDocument();
  });

  it('should close creation dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Open creation dialog
    await user.click(screen.getByTestId('locations-page-add-button'));
    
    // Click cancel
    await user.click(screen.getByTestId('mock-form-cancel'));
    
    // Dialog should be closed
    expect(screen.queryByTestId('locations-page-create-dialog')).not.toBeInTheDocument();
  });

  it('should open edit dialog when edit button in the table is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));
    
    // Edit dialog should be open
    expect(screen.getByTestId('locations-page-edit-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-form-edit')).toBeInTheDocument();
  });

  it('should close edit dialog and call updateLocation when form is submitted', async () => {
    mockUpdateLocation.mockResolvedValue(undefined);
    
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Simulate click on edit button in table to open dialog with correct location
    await user.click(screen.getByTestId('mock-edit-button'));
    
    // Verify if location was set correctly
    await waitFor(() => {
      expect(screen.getByTestId('locations-page-edit-dialog')).toBeInTheDocument();
    });
    
    // Submit form
    await user.click(screen.getByTestId('mock-form-submit'));
    
    // Verify if updateLocation was called with correct arguments
    await waitFor(() => {
      expect(mockUpdateLocation).toHaveBeenCalledWith('123', {
        name: 'Localidade Teste',
        region: 'us-east-1',
      });
    });
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('locations-page-edit-dialog')).not.toBeInTheDocument();
    });
  });

  it('should keep dialog open if an error occurs during update', async () => {
    mockUpdateLocation.mockRejectedValue(new Error('Error updating location'));
    
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));
    
    // Submit form
    await user.click(screen.getByTestId('mock-form-submit'));
    
    await waitFor(() => {
      expect(mockUpdateLocation).toHaveBeenCalled();
    });
    
    // Dialog should remain open
    expect(screen.getByTestId('locations-page-edit-dialog')).toBeInTheDocument();
  });

  it('should close edit dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));
    
    // Click cancel
    await user.click(screen.getByTestId('mock-form-cancel'));
    
    // Dialog should be closed
    expect(screen.queryByTestId('locations-page-edit-dialog')).not.toBeInTheDocument();
  });

  it('should call deleteLocation when delete button in the table is clicked', async () => {
    const user = userEvent.setup();
    
    render(<LocationsPage />);
    
    // Simulate click on delete button in table
    await user.click(screen.getByTestId('mock-delete-button'));
    
    expect(mockDeleteLocation).toHaveBeenCalledWith('123');
  });
});
