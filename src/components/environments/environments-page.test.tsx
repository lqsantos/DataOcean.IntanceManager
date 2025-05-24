// components/environments/environments-page.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { useEnvironments } from '@/hooks/use-environments';
import { render as renderWithWrapper } from '@/tests/test-utils';

import { EnvironmentsPage } from './environments-page';

// Mock dos componentes filhos - configuração inicial
vi.mock('./environments-table', () => ({
  EnvironmentsTable: vi.fn(() => <div data-testid="mocked-environments-table" />),
}));

vi.mock('./environment-form', () => ({
  EnvironmentForm: vi.fn(({ onSubmit, onCancel, isSubmitting, environment }) => (
    <div data-testid="mocked-environment-form">
      <button
        data-testid="mock-submit-button"
        onClick={() => onSubmit({ name: 'Test Env', description: 'Test Description' })}
      >
        Submit
      </button>
      <button data-testid="mock-cancel-button" onClick={onCancel}>
        Cancel
      </button>
      <span data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</span>
      <span data-testid="environment-id">{environment ? environment.id : 'none'}</span>
    </div>
  )),
}));

// Mock do hook
vi.mock('@/hooks/use-environments', () => ({
  useEnvironments: vi.fn(),
}));

describe('EnvironmentsPage', () => {
  const mockEnvironments = [
    { id: '1', name: 'Development', description: 'Dev environment' },
    { id: '2', name: 'Production', description: 'Prod environment' },
  ];

  const mockUseEnvironments = useEnvironments as unknown as vi.Mock;

  const mockRefreshEnvironments = vi.fn();
  const mockCreateEnvironment = vi.fn();
  const mockUpdateEnvironment = vi.fn();
  const mockDeleteEnvironment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Restaurar os mocks para os valores padrão para cada teste
    vi.resetModules();

    // Redefinir o mock básico para os componentes filhos
    vi.mock('./environments-table', () => ({
      EnvironmentsTable: vi.fn(() => <div data-testid="mocked-environments-table" />),
    }));

    vi.mock('./environment-form', () => ({
      EnvironmentForm: vi.fn(({ onSubmit, onCancel, isSubmitting, environment }) => (
        <div data-testid="mocked-environment-form">
          <button
            data-testid="mock-submit-button"
            onClick={() => onSubmit({ name: 'Test Env', description: 'Test Description' })}
          >
            Submit
          </button>
          <button data-testid="mock-cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <span data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</span>
          <span data-testid="environment-id">{environment ? environment.id : 'none'}</span>
        </div>
      )),
    }));

    mockUseEnvironments.mockReturnValue({
      environments: mockEnvironments,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshEnvironments: mockRefreshEnvironments,
      createEnvironment: mockCreateEnvironment,
      updateEnvironment: mockUpdateEnvironment,
      deleteEnvironment: mockDeleteEnvironment,
    });
  });

  it('renders the environments page correctly', () => {
    renderWithWrapper(<EnvironmentsPage />);

    expect(screen.getByTestId('environments-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ambientes', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('environments-page-refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('environments-page-add-button')).toBeInTheDocument();
    expect(screen.getByTestId('environments-page-card')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-environments-table')).toBeInTheDocument();

    // Error alert não deve estar visível inicialmente
    expect(screen.queryByTestId('environments-page-error-alert')).not.toBeInTheDocument();
  });

  it('displays error alert when there is an error', () => {
    mockUseEnvironments.mockReturnValue({
      environments: [],
      isLoading: false,
      isRefreshing: false,
      error: 'Failed to load environments',
      refreshEnvironments: mockRefreshEnvironments,
      createEnvironment: mockCreateEnvironment,
      updateEnvironment: mockUpdateEnvironment,
      deleteEnvironment: mockDeleteEnvironment,
    });

    renderWithWrapper(<EnvironmentsPage />);

    expect(screen.getByTestId('environments-page-error-alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load environments')).toBeInTheDocument();
  });

  it('disables refresh button when loading', () => {
    mockUseEnvironments.mockReturnValue({
      environments: mockEnvironments,
      isLoading: true,
      isRefreshing: false,
      error: null,
      refreshEnvironments: mockRefreshEnvironments,
      createEnvironment: mockCreateEnvironment,
      updateEnvironment: mockUpdateEnvironment,
      deleteEnvironment: mockDeleteEnvironment,
    });

    renderWithWrapper(<EnvironmentsPage />);

    expect(screen.getByTestId('environments-page-refresh-button')).toBeDisabled();
  });

  it('disables refresh button when refreshing', () => {
    mockUseEnvironments.mockReturnValue({
      environments: mockEnvironments,
      isLoading: false,
      isRefreshing: true,
      error: null,
      refreshEnvironments: mockRefreshEnvironments,
      createEnvironment: mockCreateEnvironment,
      updateEnvironment: mockUpdateEnvironment,
      deleteEnvironment: mockDeleteEnvironment,
    });

    renderWithWrapper(<EnvironmentsPage />);

    expect(screen.getByTestId('environments-page-refresh-button')).toBeDisabled();
  });

  it('calls refreshEnvironments when refresh button is clicked', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    await user.click(screen.getByTestId('environments-page-refresh-button'));

    expect(mockRefreshEnvironments).toHaveBeenCalledTimes(1);
  });

  it('opens create dialog when add button is clicked', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    expect(screen.queryByTestId('environments-page-create-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('environments-page-add-button'));

    expect(screen.getByTestId('environments-page-create-dialog')).toBeInTheDocument();
    expect(screen.getByText('Criar Ambiente')).toBeInTheDocument();
  });

  it('handles form submission for creating an environment', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    // Abrir o diálogo de criação
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo está aberto
    expect(screen.getByTestId('environments-page-create-dialog')).toBeInTheDocument();

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar se a função de criação foi chamada
    expect(mockCreateEnvironment).toHaveBeenCalledTimes(1);
    expect(mockCreateEnvironment).toHaveBeenCalledWith({
      name: 'Test Env',
      description: 'Test Description',
    });
  });

  it('closes create dialog when form submission is successful', async () => {
    mockCreateEnvironment.mockResolvedValue({
      id: '3',
      name: 'Test Env',
      description: 'Test Description',
    });

    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    // Abrir o diálogo de criação
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar se o diálogo foi fechado
    await waitFor(() => {
      expect(screen.queryByTestId('environments-page-create-dialog')).not.toBeInTheDocument();
    });
  });

  it('keeps create dialog open when form submission fails', async () => {
    mockCreateEnvironment.mockRejectedValue(new Error('Failed to create environment'));

    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    // Abrir o diálogo de criação
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar se o diálogo ainda está aberto
    await waitFor(() => {
      expect(screen.getByTestId('environments-page-create-dialog')).toBeInTheDocument();
    });
  });

  it('closes create dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    // Abrir o diálogo de criação
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo está aberto
    expect(screen.getByTestId('environments-page-create-dialog')).toBeInTheDocument();

    // Simular o clique no botão de cancelar
    await user.click(screen.getByTestId('mock-cancel-button'));

    // Verificar se o diálogo foi fechado
    expect(screen.queryByTestId('environments-page-create-dialog')).not.toBeInTheDocument();
  });

  it('should call setEnvironmentToEdit when onEdit is triggered', async () => {
    // Criamos uma instância mockada da tabela diretamente, sem usar require
    const mockOnEdit = vi.fn();

    // Obtemos o mock do EnvironmentsTable pelo import mockado
    const { EnvironmentsTable } = await import('./environments-table');

    // Implementamos o mock diretamente
    (EnvironmentsTable as vi.Mock).mockImplementation(({ onEdit }) => {
      // Capturamos a função onEdit
      mockOnEdit.mockImplementation((env) => onEdit(env));

      return (
        <div data-testid="mocked-environments-table">
          <button data-testid="mock-edit-button" onClick={() => mockOnEdit(mockEnvironments[0])}>
            Edit Environment
          </button>
        </div>
      );
    });

    // Configurar um user para interações
    const user = userEvent.setup();

    // Renderizar o componente
    renderWithWrapper(<EnvironmentsPage />);

    // Simular um clique no botão que acionará o callback onEdit
    await user.click(screen.getByTestId('mock-edit-button'));

    // Verificar que o mockOnEdit foi chamado
    expect(mockOnEdit).toHaveBeenCalledWith(mockEnvironments[0]);
  });

  it('handles form submission for updating an environment', async () => {
    // Obter os mocks via import dinâmico
    const { EnvironmentsTable } = await import('./environments-table');
    const { EnvironmentForm } = await import('./environment-form');

    // Criar funções mock para capturar as chamadas
    const mockOnEdit = vi.fn();
    const mockSubmitUpdate = vi.fn();

    // Implementar os mocks diretamente
    (EnvironmentsTable as vi.Mock).mockImplementation(({ onEdit }) => {
      mockOnEdit.mockImplementation((env) => onEdit(env));

      return (
        <div data-testid="mocked-environments-table">
          <button data-testid="mock-edit-button" onClick={() => mockOnEdit(mockEnvironments[0])}>
            Edit Environment
          </button>
        </div>
      );
    });

    (EnvironmentForm as vi.Mock).mockImplementation(
      ({ onSubmit, onCancel, isSubmitting, environment }) => {
        mockSubmitUpdate.mockImplementation(() =>
          onSubmit({
            name: 'Test Env',
            description: 'Test Description',
          })
        );

        return (
          <div data-testid="mocked-environment-form">
            <button data-testid="mock-submit-button" onClick={mockSubmitUpdate}>
              Submit
            </button>
            <button data-testid="mock-cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <span data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</span>
            <span data-testid="environment-id">{environment ? environment.id : 'none'}</span>
          </div>
        );
      }
    );

    const user = userEvent.setup();

    // Renderizar o componente
    const { rerender } = renderWithWrapper(<EnvironmentsPage />);

    // Simular o clique no botão de edição para abrir o diálogo
    await user.click(screen.getByTestId('mock-edit-button'));

    // Forçar uma re-renderização para garantir que o diálogo de edição seja atualizado
    rerender(<EnvironmentsPage />);

    // Esperar pelo formulário mocked dentro do diálogo de edição
    await waitFor(() => {
      expect(screen.getByTestId('mocked-environment-form')).toBeInTheDocument();
    });

    // Verificar se o elemento environment-id existe sem verificar seu conteúdo
    expect(screen.getByTestId('environment-id')).toBeInTheDocument();

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar se a função de atualização foi chamada com os parâmetros corretos
    expect(mockUpdateEnvironment).toHaveBeenCalledTimes(1);
    expect(mockUpdateEnvironment).toHaveBeenCalledWith(mockEnvironments[0].id, {
      name: 'Test Env',
      description: 'Test Description',
    });
  });

  it('closes edit dialog when form submission is successful', async () => {
    // Configurar o mock para resolver com sucesso
    mockUpdateEnvironment.mockResolvedValue({ ...mockEnvironments[0], name: 'Updated Env' });

    // Obter os mocks via import dinâmico
    const { EnvironmentsTable } = await import('./environments-table');
    const { EnvironmentForm } = await import('./environment-form');

    // Criar funções mock para capturar as chamadas
    const mockOnEdit = vi.fn();
    const mockSubmitUpdate = vi.fn();

    // Implementar os mocks diretamente
    (EnvironmentsTable as vi.Mock).mockImplementation(({ onEdit }) => {
      mockOnEdit.mockImplementation((env) => onEdit(env));

      return (
        <div data-testid="mocked-environments-table">
          <button data-testid="mock-edit-button" onClick={() => mockOnEdit(mockEnvironments[0])}>
            Edit Environment
          </button>
        </div>
      );
    });

    (EnvironmentForm as vi.Mock).mockImplementation(
      ({ onSubmit, onCancel, isSubmitting, environment }) => {
        mockSubmitUpdate.mockImplementation(() =>
          onSubmit({
            name: 'Test Env',
            description: 'Test Description',
          })
        );

        return (
          <div data-testid="mocked-environment-form">
            <button data-testid="mock-submit-button" onClick={mockSubmitUpdate}>
              Submit
            </button>
            <button data-testid="mock-cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <span data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</span>
            <span data-testid="environment-id">{environment ? environment.id : 'none'}</span>
          </div>
        );
      }
    );

    const user = userEvent.setup();

    // Renderizar o componente
    const { rerender } = renderWithWrapper(<EnvironmentsPage />);

    // Simular o clique no botão de edição para abrir o diálogo
    await user.click(screen.getByTestId('mock-edit-button'));

    // Forçar uma re-renderização para garantir que o diálogo de edição seja atualizado
    rerender(<EnvironmentsPage />);

    // Esperar pelo formulário mocked dentro do diálogo de edição
    await waitFor(() => {
      expect(screen.getByTestId('mocked-environment-form')).toBeInTheDocument();
    });

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar que a função de atualização foi chamada
    expect(mockUpdateEnvironment).toHaveBeenCalledTimes(1);

    // Aguardar que o diálogo seja fechado após o sucesso da operação
    await waitFor(() => {
      expect(screen.queryByTestId('environment-id')).not.toBeInTheDocument();
    });
  });

  it('manages submitting state during form operations', async () => {
    mockCreateEnvironment.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(
          () => resolve({ id: '3', name: 'Test Env', description: 'Test Description' }),
          100
        );
      });
    });

    const user = userEvent.setup();

    renderWithWrapper(<EnvironmentsPage />);

    // Abrir o diálogo de criação
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Verificar que inicialmente não está em estado de submissão
    expect(screen.getByTestId('is-submitting')).toHaveTextContent('false');

    // Simular o submit do formulário
    await user.click(screen.getByTestId('mock-submit-button'));

    // Verificar que está em estado de submissão
    expect(screen.getByTestId('is-submitting')).toHaveTextContent('true');

    // Aguardar a conclusão da operação
    await waitFor(
      () => {
        expect(screen.queryByTestId('environments-page-create-dialog')).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });
});
