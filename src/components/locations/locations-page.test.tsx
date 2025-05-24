import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';

import { useLocations } from '@/hooks/use-locations';
import { render as renderWithWrapper } from '@/tests/test-utils';

import { LocationsPage } from './locations-page';

// Mock dos hooks e dependências
vi.mock('@/hooks/use-locations', () => ({
  useLocations: vi.fn(),
}));

// Mock do contexto modal-manager
vi.mock('@/contexts/modal-manager-context', () => {
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenEditModal = vi.fn();
  const mockSetPatCallback = vi.fn();

  return {
    ModalManagerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useModalManager: () => ({
      modals: {
        pat: { isOpen: false },
        environment: { isOpen: false, editItem: null },
        application: { isOpen: false, editItem: null },
        cluster: { isOpen: false, editItem: null },
        location: { isOpen: false, editItem: null },
        gitSource: { isOpen: false, editItem: null },
        template: { isOpen: false },
      },
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      openEditModal: mockOpenEditModal,
      setPatCallback: mockSetPatCallback,
    }),
    useLocationModal: () => ({
      isOpen: false,
      locationToEdit: null,
      openModal: mockOpenModal,
      openEditModal: mockOpenEditModal,
      closeModal: mockCloseModal,
    }),
  };
});

// Mock do componente LocationsTable
vi.mock('./locations-table', () => ({
  LocationsTable: vi.fn(({ onEdit, onDelete }) => (
    <div data-testid="mock-locations-table">
      <button
        data-testid="mock-edit-button"
        onClick={() => onEdit({ id: '123', name: 'Localidade Teste', region: 'us-east-1' })}
      >
        Editar
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete('123')}>
        Excluir
      </button>
    </div>
  )),
}));

// Mock do componente LocationForm - atualizando para garantir que a prop 'entity' seja corretamente reconhecida
vi.mock('./location-form', () => ({
  LocationForm: vi.fn(({ onSubmit, onCancel, entity, location, isSubmitting }) => {
    // Garantir que aceitamos tanto 'entity' quanto 'location'
    const locationData = entity || location;

    return (
      <div data-testid={`mock-location-form-${locationData ? 'edit' : 'create'}`}>
        <button
          data-testid="mock-form-submit"
          onClick={() =>
            onSubmit({
              name: locationData ? locationData.name : 'Nova Localidade',
              region: locationData ? locationData.region : 'us-west-1',
            })
          }
        >
          Salvar
        </button>
        <button data-testid="mock-form-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <span data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</span>
        {locationData && <div data-testid="location-id">{locationData.id}</div>}
      </div>
    );
  }),
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
    renderWithWrapper(<LocationsPage />);

    expect(screen.getByTestId('locations-page')).toBeInTheDocument();
    // Verificando pelo texto do título em vez do data-testid
    expect(screen.getByRole('heading', { name: 'Localidades', level: 1 })).toBeInTheDocument();
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
    renderWithWrapper(<LocationsPage />);

    expect(screen.getByTestId('locations-page-error-alert')).toBeInTheDocument();
    // Verificando pelo texto da mensagem de erro em vez do data-testid específico
    expect(screen.getByText('Erro ao carregar localidades')).toBeInTheDocument();
  });

  it('should call refreshLocations when refresh button is clicked', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<LocationsPage />);

    await user.click(screen.getByTestId('locations-page-refresh-button'));

    expect(mockRefreshLocations).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button during loading', () => {
    // Teste para estado de carregamento
    (useLocations as Mock).mockReturnValue({
      ...defaultMockState,
      isLoading: true,
    });

    renderWithWrapper(<LocationsPage />);

    expect(screen.getByTestId('locations-page-refresh-button')).toBeDisabled();
  });

  it('should disable refresh button during refreshing', () => {
    // Teste para estado de atualização
    (useLocations as Mock).mockReturnValue({
      ...defaultMockState,
      isRefreshing: true,
    });

    renderWithWrapper(<LocationsPage />);

    expect(screen.getByTestId('locations-page-refresh-button')).toBeDisabled();
  });

  it('should open creation dialog when add button is clicked', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<LocationsPage />);

    expect(screen.queryByTestId('locations-page-create-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('locations-page-add-button'));

    expect(screen.getByTestId('locations-page-create-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-form-create')).toBeInTheDocument();
  });

  it('should close creation dialog and call createLocation when form is submitted', async () => {
    mockCreateLocation.mockResolvedValue(undefined);

    const user = userEvent.setup();

    renderWithWrapper(<LocationsPage />);

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

    renderWithWrapper(<LocationsPage />);

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

    renderWithWrapper(<LocationsPage />);

    // Open creation dialog
    await user.click(screen.getByTestId('locations-page-add-button'));

    // Click cancel
    await user.click(screen.getByTestId('mock-form-cancel'));

    // Dialog should be closed
    expect(screen.queryByTestId('locations-page-create-dialog')).not.toBeInTheDocument();
  });

  it('should open edit dialog when edit button in the table is clicked', async () => {
    const mockLocation = { id: '123', name: 'Localidade Teste', region: 'us-east-1' };
    const user = userEvent.setup();

    // Mock a implementação específica para garantir que o EntityPage está recebendo
    // o componente correto com as props adequadas
    const { LocationsTable } = await import('./locations-table');

    (LocationsTable as vi.Mock).mockImplementation(({ onEdit }) => (
      <div data-testid="mock-locations-table">
        <button data-testid="mock-edit-button" onClick={() => onEdit(mockLocation)}>
          Editar
        </button>
      </div>
    ));

    renderWithWrapper(<LocationsPage />);

    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));

    // Wait for edit dialog to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('locations-page-edit-dialog')).toBeInTheDocument();
    });

    // Verify edit form presence with correct location data
    expect(screen.getByTestId('mock-location-form-edit')).toBeInTheDocument();
  });

  it('should close edit dialog and call updateLocation when form is submitted', async () => {
    const mockLocation = { id: '123', name: 'Localidade Teste', region: 'us-east-1' };

    mockUpdateLocation.mockResolvedValue(undefined);

    // Mock a implementação específica para garantir que o EntityPage está recebendo
    // o componente correto com as props adequadas
    const { LocationsTable } = await import('./locations-table');
    const { LocationForm } = await import('./location-form');

    (LocationsTable as vi.Mock).mockImplementation(({ onEdit }) => (
      <div data-testid="mock-locations-table">
        <button data-testid="mock-edit-button" onClick={() => onEdit(mockLocation)}>
          Editar
        </button>
      </div>
    ));

    const user = userEvent.setup();

    renderWithWrapper(<LocationsPage />);

    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));

    // Wait for edit dialog and form to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('locations-page-edit-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('mock-location-form-edit')).toBeInTheDocument();
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

    renderWithWrapper(<LocationsPage />);

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

    renderWithWrapper(<LocationsPage />);

    // Simulate click on edit button in table
    await user.click(screen.getByTestId('mock-edit-button'));

    // Click cancel
    await user.click(screen.getByTestId('mock-form-cancel'));

    // Dialog should be closed
    expect(screen.queryByTestId('locations-page-edit-dialog')).not.toBeInTheDocument();
  });

  it('should call deleteLocation when delete button in the table is clicked', async () => {
    const user = userEvent.setup();

    // Garantir que o mock do LocationsTable seja usado consistentemente
    const { LocationsTable } = await import('./locations-table');

    (LocationsTable as vi.Mock).mockImplementation(({ onEdit, onDelete }) => (
      <div data-testid="mock-locations-table">
        <button
          data-testid="mock-edit-button"
          onClick={() => onEdit({ id: '123', name: 'Localidade Teste', region: 'us-east-1' })}
        >
          Editar
        </button>
        <button data-testid="mock-delete-button" onClick={() => onDelete('123')}>
          Excluir
        </button>
      </div>
    ));

    renderWithWrapper(<LocationsPage />);

    // Simulate click on delete button in table
    await user.click(screen.getByTestId('mock-delete-button'));

    expect(mockDeleteLocation).toHaveBeenCalledWith('123');
  });
});
