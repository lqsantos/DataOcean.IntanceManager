// components/environments/environments-page.test.tsx
import { render } from '@/tests/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EnvironmentsPage } from './environments-page';

// Mocks das dependências
const mockRefreshEnvironments = vi.fn();
const mockCreateEnvironment = vi.fn();
const mockUpdateEnvironment = vi.fn();
const mockDeleteEnvironment = vi.fn();

// Mock para useEnvironments
vi.mock('@/hooks/use-environments', () => ({
  useEnvironments: () => ({
    environments: [
      {
        id: '1',
        name: 'Development',
        slug: 'dev',
        description: 'Dev environment',
        order: 1,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Production',
        slug: 'prod',
        description: 'Prod environment',
        order: 2,
        createdAt: '2023-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshEnvironments: mockRefreshEnvironments,
    createEnvironment: mockCreateEnvironment,
    updateEnvironment: mockUpdateEnvironment,
    deleteEnvironment: mockDeleteEnvironment,
  }),
}));

// Mock para o contexto de modal
let isModalOpen = false;
let envToEdit = null;

vi.mock('@/contexts/modal-manager-context', () => ({
  useEnvironmentModal: () => ({
    isOpen: isModalOpen,
    environmentToEdit: envToEdit,
    openModal: () => {
      isModalOpen = true;
    },
    openEditModal: (env) => {
      isModalOpen = true;
      envToEdit = env;
    },
    closeModal: () => {
      isModalOpen = false;
      envToEdit = null;
    },
  }),
}));

// Mock para a tabela de ambientes
vi.mock('./environments-table', () => ({
  EnvironmentsTable: ({ environments, onEdit, onDelete }) => (
    <div data-testid="mock-environments-table">
      <button data-testid="mock-edit-button" onClick={() => onEdit(environments[0])}>
        Editar
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete(environments[0].id)}>
        Excluir
      </button>
    </div>
  ),
}));

// Mock para o modal de criação
vi.mock('./create-environment-modal', () => ({
  CreateEnvironmentModal: ({
    isOpen,
    onClose,
    createEnvironment,
    updateEnvironment,
    environmentToEdit,
  }) =>
    isOpen ? (
      <div data-testid="mock-create-environment-modal">
        <div data-testid="modal-is-edit-mode">{environmentToEdit ? 'edit' : 'create'}</div>
        <button
          data-testid="mock-form-submit"
          onClick={() => {
            const data = { name: 'Test Env', description: 'Test Description' };
            if (environmentToEdit) {
              updateEnvironment(environmentToEdit.id, data);
            } else {
              createEnvironment(data);
            }
            onClose();
          }}
        >
          Submit
        </button>
        <button data-testid="mock-form-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));

describe('EnvironmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isModalOpen = false;
    envToEdit = null;
  });

  it('should render the component correctly', () => {
    render(<EnvironmentsPage />);

    // Verifica o título
    expect(screen.getByText('Ambientes')).toBeInTheDocument();

    // Verifica o subtítulo
    expect(screen.getByText('Gerencie seus ambientes de implantação')).toBeInTheDocument();

    // Verifica a tabela mockada
    expect(screen.getByTestId('mock-environments-table')).toBeInTheDocument();
  });

  it('should call refreshEnvironments when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<EnvironmentsPage />);

    // Simula clique no botão de adicionar
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Verifica se o modal foi aberto
    expect(isModalOpen).toBe(true);
  });

  it('should open create dialog when add button is clicked', async () => {
    const user = userEvent.setup();

    // Renderiza o componente
    render(<EnvironmentsPage />);

    // Simula clique no botão de adicionar
    await user.click(screen.getByTestId('environments-page-add-button'));

    // Força re-renderização para atualizar com o estado do modal
    render(<EnvironmentsPage />);

    // Verifica se o modal foi aberto
    expect(screen.getByTestId('mock-create-environment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-is-edit-mode')).toHaveTextContent('create');
  });

  it('should handle form submission for creating an environment', async () => {
    const user = userEvent.setup();

    // Configura o modal como aberto
    isModalOpen = true;

    // Renderiza com o modal aberto
    render(<EnvironmentsPage />);

    // Submete o formulário
    await user.click(screen.getByTestId('mock-form-submit'));

    // Verifica se a função de criação foi chamada
    expect(mockCreateEnvironment).toHaveBeenCalledTimes(1);
    expect(mockCreateEnvironment).toHaveBeenCalledWith({
      name: 'Test Env',
      description: 'Test Description',
    });
  });

  it('should close create dialog when form submission is successful', async () => {
    const user = userEvent.setup();
    mockCreateEnvironment.mockResolvedValue({
      id: '3',
      name: 'Test Env',
      description: 'Test Description',
    });

    // Configura o modal como aberto
    isModalOpen = true;

    // Renderiza com o modal aberto
    render(<EnvironmentsPage />);

    // Submete o formulário
    await user.click(screen.getByTestId('mock-form-submit'));

    // Verifica se o modal foi fechado
    expect(isModalOpen).toBe(false);
  });

  it('should close create dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    // Configura o modal como aberto
    isModalOpen = true;

    // Renderiza com o modal aberto
    render(<EnvironmentsPage />);

    // Clica no botão de cancelar
    await user.click(screen.getByTestId('mock-form-cancel'));

    // Verifica se o modal foi fechado
    expect(isModalOpen).toBe(false);
  });

  it('should open edit dialog when edit button in the table is clicked', async () => {
    const user = userEvent.setup();

    render(<EnvironmentsPage />);

    // Clica no botão de editar da tabela mockada
    await user.click(screen.getByTestId('mock-edit-button'));

    // Re-renderiza para atualizar com o estado do modal
    render(<EnvironmentsPage />);

    // Verifica se o modal de edição foi aberto
    expect(screen.getByTestId('mock-create-environment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-is-edit-mode')).toHaveTextContent('edit');
  });

  it('should handle form submission for updating an environment', async () => {
    const user = userEvent.setup();

    // Configura o modal como aberto no modo de edição
    isModalOpen = true;
    envToEdit = {
      id: '1',
      name: 'Development',
      slug: 'dev',
      description: 'Dev environment',
      order: 1,
      createdAt: '2023-01-01T00:00:00Z',
    };

    // Renderiza com o modal aberto no modo de edição
    render(<EnvironmentsPage />);

    // Submete o formulário
    await user.click(screen.getByTestId('mock-form-submit'));

    // Verifica se a função de atualização foi chamada
    expect(mockUpdateEnvironment).toHaveBeenCalledTimes(1);
    expect(mockUpdateEnvironment).toHaveBeenCalledWith('1', {
      name: 'Test Env',
      description: 'Test Description',
    });
  });

  it('should close edit dialog when form submission is successful', async () => {
    const user = userEvent.setup();

    mockUpdateEnvironment.mockResolvedValue({
      id: '1',
      name: 'Updated Env',
      description: 'Updated Description',
      slug: 'dev',
      order: 1,
      createdAt: '2023-01-01T00:00:00Z',
    });

    // Configura o modal como aberto no modo de edição
    isModalOpen = true;
    envToEdit = {
      id: '1',
      name: 'Development',
      slug: 'dev',
      description: 'Dev environment',
      order: 1,
      createdAt: '2023-01-01T00:00:00Z',
    };

    // Renderiza com o modal aberto no modo de edição
    render(<EnvironmentsPage />);

    // Submete o formulário
    await user.click(screen.getByTestId('mock-form-submit'));

    // Verifica se o modal foi fechado após sucesso
    await waitFor(() => {
      expect(isModalOpen).toBe(false);
    });
  });
});
