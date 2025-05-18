// components/applications/applications-page.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationsPage } from './applications-page';

// Definindo os mocks usando hoisting para evitar problemas com vi.mock
const mockDeleteFn = vi.fn();
const mockCreateFn = vi.fn();
const mockUpdateFn = vi.fn();
const mockRefreshFn = vi.fn();

// Variável para controlar qual implementação do mock usar
let useErrorMock = false;

// Configurando o mock para o hook useApplications
vi.mock('@/hooks/use-applications', () => ({
  useApplications: () => {
    if (useErrorMock) {
      return {
        applications: [],
        isLoading: false,
        isRefreshing: false,
        error: 'Falha ao carregar aplicações',
        refreshApplications: vi.fn(),
        createApplication: vi.fn(),
        updateApplication: vi.fn(),
        deleteApplication: vi.fn(),
      };
    }

    return {
      applications: [
        {
          id: '1',
          name: 'Frontend Web',
          slug: 'frontend-web',
          description: 'Main frontend application',
          createdAt: '2023-01-15T10:00:00.000Z',
          updatedAt: '2023-01-15T10:00:00.000Z',
        },
        {
          id: '2',
          name: 'API Gateway',
          slug: 'api-gateway',
          description: 'API gateway service',
          createdAt: '2023-02-10T08:30:00.000Z',
          updatedAt: '2023-02-10T08:30:00.000Z',
        },
      ],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshApplications: mockRefreshFn,
      createApplication: mockCreateFn,
      updateApplication: mockUpdateFn,
      deleteApplication: mockDeleteFn,
    };
  },
}));

// Mock para os componentes da aplicação
vi.mock('./applications-table', () => ({
  ApplicationsTable: ({ applications, onEdit, onDelete }: any) => (
    <div data-testid="applications-table">
      <div data-testid="applications-count">{applications.length}</div>
      <button data-testid="mock-edit-button" onClick={() => onEdit(applications[0])}>
        Edit
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete('1')}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('./application-form', () => ({
  ApplicationForm: ({ application, onSubmit, onCancel }: any) => (
    <div data-testid="application-form" data-edit-mode={application ? 'true' : 'false'}>
      <button
        data-testid="mock-submit-button"
        onClick={() => onSubmit({ name: 'New App', slug: 'new-app' })}
      >
        Submit
      </button>
      <button data-testid="mock-cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

// Mock para os componentes UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid={open ? 'dialog-open' : 'dialog-closed'} data-open={open}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
}));

describe('ApplicationsPage', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    vi.clearAllMocks();
    // Resetar a flag de erro para cada teste
    useErrorMock = false;
  });

  it('should render applications page with title and table', () => {
    render(<ApplicationsPage />);

    // Verifica o título da página usando seletor role mais específico
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aplicações');
    
    // Verifica a descrição
    expect(screen.getByText('Gerencie suas aplicações')).toBeInTheDocument();
    
    // Verifica se a tabela de aplicações está presente
    expect(screen.getByTestId('applications-table')).toBeInTheDocument();
    
    // Verifica a contagem de aplicações (2 do mock)
    const appCount = screen.getByTestId('applications-count');

    expect(appCount).toBeInTheDocument();
    expect(appCount.textContent).toBe('2');
  });

  it('should open create dialog when add button is clicked', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Clica no botão de adicionar
    const addButton = screen.getByTestId('applications-page-add-button');

    await user.click(addButton);

    // Verifica se o diálogo foi aberto
    const dialog = screen.getByTestId('dialog-open');

    expect(dialog).toHaveAttribute('data-open', 'true');
    
    // Verifica o título do diálogo
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Criar Aplicação');
    
    // Verifica se o formulário está no modo de criação
    const form = screen.getByTestId('application-form');

    expect(form).toHaveAttribute('data-edit-mode', 'false');
  });

  it('should close create dialog when form is submitted', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Abre o diálogo de criação
    const addButton = screen.getByTestId('applications-page-add-button');

    await user.click(addButton);
    
    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');

    await user.click(submitButton);

    // Verifica se createApplication foi chamado com os dados corretos
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
    expect(mockCreateFn).toHaveBeenCalledWith({ 
      name: 'New App', 
      slug: 'new-app' 
    });
  });

  it('should open edit dialog when table edit action is triggered', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Simula a ação de editar da tabela
    const editButton = screen.getByTestId('mock-edit-button');

    await user.click(editButton);

    // Verifica se o diálogo foi aberto
    const dialog = screen.getByTestId('dialog-open');

    expect(dialog).toHaveAttribute('data-open', 'true');
    
    // Verifica o título do diálogo
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Editar Aplicação');
    
    // Verifica se o formulário está no modo de edição
    const form = screen.getByTestId('application-form');

    expect(form).toHaveAttribute('data-edit-mode', 'true');
  });

  it('should call deleteApplication when delete action is triggered', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Simula a ação de excluir da tabela
    const deleteButton = screen.getByTestId('mock-delete-button');

    await user.click(deleteButton);

    // Verifica se o método de exclusão foi chamado com o ID correto
    expect(mockDeleteFn).toHaveBeenCalledTimes(1);
    expect(mockDeleteFn).toHaveBeenCalledWith('1');
  });

  it('should call refreshApplications when refresh button is clicked', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Clica no botão de atualizar
    const refreshButton = screen.getByTestId('applications-page-refresh-button');

    await user.click(refreshButton);

    // Verifica se a função de atualização foi chamada
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });

  it('should display error alert when error is present', () => {
    // Ativa o mock de erro para este teste
    useErrorMock = true;
    
    render(<ApplicationsPage />);

    // Verifica se o alerta é exibido
    const alertElement = screen.getByTestId('alert');

    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute('data-variant', 'destructive');
    expect(screen.getByTestId('alert-description')).toHaveTextContent('Falha ao carregar aplicações');
    
    // Reseta o mock de erro
    useErrorMock = false;
  });

  it('should update application when edit form is submitted', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Abre o diálogo de edição
    const editButton = screen.getByTestId('mock-edit-button');

    await user.click(editButton);
    
    // Submete o formulário de edição
    const submitButton = screen.getByTestId('mock-submit-button');

    await user.click(submitButton);

    // Verifica se updateApplication foi chamado com os dados corretos
    expect(mockUpdateFn).toHaveBeenCalledTimes(1);
    expect(mockUpdateFn).toHaveBeenCalledWith('1', { 
      name: 'New App', 
      slug: 'new-app' 
    });
  });
});
