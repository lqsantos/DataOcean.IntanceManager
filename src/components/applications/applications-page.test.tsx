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
  ApplicationsTable: ({ entities, applications, onEdit, onDelete }: any) => {
    const items = entities || applications || [];

    return (
      <div data-testid="applications-table">
        <div data-testid="applications-count">{items.length}</div>
        <button data-testid="mock-edit-button" onClick={() => onEdit(items[0])}>
          Edit
        </button>
        <button data-testid="mock-delete-button" onClick={() => onDelete('1')}>
          Delete
        </button>
      </div>
    );
  },
}));

vi.mock('./application-form', () => ({
  ApplicationForm: ({ entity, application, onSubmit, onCancel }: any) => {
    const item = entity || application;

    return (
      <div data-testid="application-form" data-edit-mode={item ? 'true' : 'false'}>
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
    );
  },
}));

// Variáveis para controlar qual diálogo está aberto
let isCreateDialogOpen = false;
let isEditDialogOpen = false;
let entityToEdit = null;

// Mock para o componente EntityPage - CAMINHO ATUALIZADO
vi.mock('@/components/entities/entity-page', () => ({
  EntityPage: ({
    entities,
    error,
    isLoading,
    isRefreshing,
    refreshEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    EntityTable,
    EntityForm,
    entityName,
    testIdPrefix,
    tableProps,
    formProps,
    entityPropName,
  }: any) => (
    <div data-testid={`${testIdPrefix}-page`}>
      <h1>{entityName.plural}</h1>
      <p>{entityName.description}</p>

      <button
        data-testid={`${testIdPrefix}-page-refresh-button`}
        onClick={refreshEntities}
        disabled={isLoading || isRefreshing}
      >
        Refresh
      </button>

      <button
        data-testid={`${testIdPrefix}-page-add-button`}
        onClick={() => {
          // Abrir diálogo de criação
          isCreateDialogOpen = true;
          isEditDialogOpen = false;
          entityToEdit = null;
        }}
      >
        Add {entityName.singular}
      </button>

      {error && <div data-testid={`${testIdPrefix}-page-error-alert`}>{error}</div>}

      <EntityTable
        entities={entities}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={(entity: any) => {
          // Abrir diálogo de edição
          isEditDialogOpen = true;
          isCreateDialogOpen = false;
          entityToEdit = entity;
        }}
        onDelete={deleteEntity}
        {...tableProps}
      />

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div data-testid={`${testIdPrefix}-page-create-dialog`}>
          <EntityForm
            onSubmit={(data: any) => {
              createEntity(data);
              isCreateDialogOpen = false;
            }}
            onCancel={() => {
              isCreateDialogOpen = false;
            }}
            isSubmitting={false}
            {...formProps}
          />
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && entityToEdit && (
        <div data-testid={`${testIdPrefix}-page-edit-dialog`}>
          <EntityForm
            entity={entityToEdit}
            {...(entityPropName ? { [entityPropName]: entityToEdit } : {})}
            onSubmit={(data: any) => {
              updateEntity(entityToEdit.id, data);
              isEditDialogOpen = false;
            }}
            onCancel={() => {
              isEditDialogOpen = false;
              entityToEdit = null;
            }}
            isSubmitting={false}
            {...formProps}
          />
        </div>
      )}
    </div>
  ),
}));

describe('ApplicationsPage', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    vi.clearAllMocks();
    // Resetar a flag de erro para cada teste
    useErrorMock = false;
    // Resetar estado dos diálogos
    isCreateDialogOpen = false;
    isEditDialogOpen = false;
    entityToEdit = null;
  });

  it('should render applications page with title and table', () => {
    render(<ApplicationsPage />);

    // Verifica o título da página
    expect(screen.getByRole('heading')).toHaveTextContent('Aplicações');

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

    // Agora renderiza novamente para atualizar o DOM com o diálogo aberto
    // Isso é necessário porque estamos usando variáveis globais para controlar o estado
    // em vez de um estado React real
    render(<ApplicationsPage />);

    // Verifica se o diálogo foi aberto
    const dialog = screen.getByTestId('applications-page-create-dialog');

    expect(dialog).toBeInTheDocument();

    // Verifica se o formulário está no modo de criação
    const form = screen.getByTestId('application-form');

    expect(form).toHaveAttribute('data-edit-mode', 'false');
  });

  it('should call createApplication when form is submitted', async () => {
    const user = userEvent.setup();

    // Primeiro renderiza com o diálogo de criação fechado
    render(<ApplicationsPage />);

    // Clica no botão de adicionar
    const addButton = screen.getByTestId('applications-page-add-button');

    await user.click(addButton);

    // Agora renderiza novamente para atualizar o DOM com o diálogo aberto
    render(<ApplicationsPage />);

    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');

    await user.click(submitButton);

    // Verifica se createApplication foi chamado com os dados corretos
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
    expect(mockCreateFn).toHaveBeenCalledWith({
      name: 'New App',
      slug: 'new-app',
    });
  });

  it('should open edit dialog when table edit action is triggered', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Simula a ação de editar da tabela
    const editButton = screen.getByTestId('mock-edit-button');

    await user.click(editButton);

    // Renderiza novamente para atualizar o DOM com o diálogo aberto
    render(<ApplicationsPage />);

    // Verifica se o diálogo foi aberto
    const dialog = screen.getByTestId('applications-page-edit-dialog');

    expect(dialog).toBeInTheDocument();

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
    const alertElement = screen.getByTestId('applications-page-error-alert');

    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent('Falha ao carregar aplicações');

    // Reseta o mock de erro
    useErrorMock = false;
  });

  it('should update application when edit form is submitted', async () => {
    const user = userEvent.setup();

    render(<ApplicationsPage />);

    // Abre o diálogo de edição
    const editButton = screen.getByTestId('mock-edit-button');

    await user.click(editButton);

    // Renderiza novamente para atualizar o DOM com o diálogo aberto
    render(<ApplicationsPage />);

    // Submete o formulário de edição
    const submitButton = screen.getByTestId('mock-submit-button');

    await user.click(submitButton);

    // Verifica se updateApplication foi chamado com os dados corretos
    expect(mockUpdateFn).toHaveBeenCalledTimes(1);
    expect(mockUpdateFn).toHaveBeenCalledWith('1', {
      name: 'New App',
      slug: 'new-app',
    });
  });
});
