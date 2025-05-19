// src/components/ui/entity-page.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EntityPage } from './entity-page';

// Mock dos componentes de UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={props['data-testid']} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant, ...props }: any) => (
    <div data-testid={props['data-testid']} data-variant={variant}>
      {children}
    </div>
  ),
  AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid={props['data-testid']}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid={open ? 'dialog-open' : 'dialog-closed'} data-open={open}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid']}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="icon-alert-circle">AlertCircle</div>,
  Plus: () => <div data-testid="icon-plus">Plus</div>,
  RefreshCw: () => <div data-testid="icon-refresh">RefreshCw</div>,
}));

// Interface de teste
interface TestEntity {
  id: string;
  name: string;
  description?: string;
}

// Mocks para os callbacks
const mockRefreshFn = vi.fn().mockResolvedValue(undefined);
const mockCreateFn = vi.fn().mockResolvedValue({ id: '3', name: 'New Entity' });
const mockUpdateFn = vi.fn().mockResolvedValue(undefined);
const mockDeleteFn = vi.fn().mockResolvedValue(undefined);

// Mock componentes
const mockEntityTable = vi.fn(({ entities, onEdit, onDelete }) => (
  <div data-testid="mock-entity-table">
    <div data-testid="entity-count">{entities.length}</div>
    <button data-testid="mock-edit-button" onClick={() => onEdit(entities[0])}>
      Editar
    </button>
    <button data-testid="mock-delete-button" onClick={() => onDelete('1')}>
      Excluir
    </button>
  </div>
));

// Melhorado para verificar tanto entity quanto a propriedade específica
const mockEntityForm = vi.fn((props) => {
  const { entity, onSubmit, onCancel, isSubmitting } = props;

  // Verificar se as props específicas foram passadas corretamente
  const allProps = Object.keys(props).filter(
    (key) => !['onSubmit', 'onCancel', 'isSubmitting'].includes(key)
  );

  return (
    <div data-testid="mock-entity-form" data-edit-mode={entity ? 'true' : 'false'}>
      <div data-testid="form-submitting">{isSubmitting ? 'true' : 'false'}</div>
      <div data-testid="passed-props">{allProps.join(',')}</div>
      {entity && <div data-testid="entity-id">{entity.id}</div>}

      {/* Verificar propriedades específicas */}
      {Object.entries(props).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'id' in value) {
          return (
            <div key={key} data-testid={`prop-${key}`}>
              {(value as any).id}
            </div>
          );
        }
        return null;
      })}

      <button
        data-testid="mock-submit-button"
        onClick={() => onSubmit({ name: 'Test Entity', description: 'Test Description' })}
        disabled={isSubmitting}
      >
        Salvar
      </button>
      <button data-testid="mock-cancel-button" onClick={onCancel} disabled={isSubmitting}>
        Cancelar
      </button>
    </div>
  );
});

describe('EntityPage', () => {
  const testEntities = [
    { id: '1', name: 'Entity 1', description: 'Description 1' },
    { id: '2', name: 'Entity 2', description: 'Description 2' },
  ];

  const defaultProps = {
    entities: testEntities,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshEntities: mockRefreshFn,
    createEntity: mockCreateFn,
    updateEntity: mockUpdateFn,
    deleteEntity: mockDeleteFn,
    EntityTable: mockEntityTable,
    EntityForm: mockEntityForm,
    entityName: {
      singular: 'Entidade',
      plural: 'Entidades',
      description: 'Gerencie suas entidades',
    },
    testIdPrefix: 'test-entity',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with title, description and table', () => {
    render(<EntityPage {...defaultProps} />);

    // Verifica título e descrição, usando uma busca mais específica
    expect(screen.getByTestId('card-title')).toHaveTextContent('Entidades');
    expect(screen.getByText('Gerencie suas entidades')).toBeInTheDocument();

    // Verifica se o card e a tabela estão presentes
    expect(screen.getByTestId('test-entity-page-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-entity-table')).toBeInTheDocument();

    // Verifica se os botões de ação estão presentes
    expect(screen.getByTestId('test-entity-page-refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-entity-page-add-button')).toBeInTheDocument();
  });

  it('should display error alert when error is provided', () => {
    render(<EntityPage {...defaultProps} error="Erro ao carregar entidades" />);

    // Verifica se o alerta é exibido
    const alertElement = screen.getByTestId('test-entity-page-error-alert');
    expect(alertElement).toBeInTheDocument();
    expect(screen.getByText('Erro ao carregar entidades')).toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
  });

  it('should call refreshEntities when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Clica no botão de atualizar
    const refreshButton = screen.getByTestId('test-entity-page-refresh-button');
    await user.click(refreshButton);

    // Verifica se a função de atualização foi chamada
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button during loading', () => {
    // Estado de carregamento
    render(<EntityPage {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('test-entity-page-refresh-button')).toBeDisabled();
  });

  it('should disable refresh button during refreshing', () => {
    // Estado de atualização
    render(<EntityPage {...defaultProps} isRefreshing={true} />);
    expect(screen.getByTestId('test-entity-page-refresh-button')).toBeDisabled();
  });

  it('should open create dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Verifica se o diálogo está inicialmente fechado
    expect(screen.queryByTestId('test-entity-page-create-dialog')).not.toBeInTheDocument();

    // Clica no botão de adicionar
    const addButton = screen.getByTestId('test-entity-page-add-button');
    await user.click(addButton);

    // Verifica se o diálogo foi aberto
    expect(screen.getByTestId('test-entity-page-create-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Criar Entidade');

    // Verifica se o formulário está no modo correto
    const form = screen.getByTestId('mock-entity-form');
    expect(form).toHaveAttribute('data-edit-mode', 'false');
  });

  it('should call createEntity and close dialog when form is submitted', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Abre o diálogo
    const addButton = screen.getByTestId('test-entity-page-add-button');
    await user.click(addButton);

    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');
    await user.click(submitButton);

    // Verifica se a função de criação foi chamada com os dados corretos
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
    expect(mockCreateFn).toHaveBeenCalledWith({
      name: 'Test Entity',
      description: 'Test Description',
    });

    // Verifica se o diálogo foi fechado após a criação
    expect(screen.queryByTestId('test-entity-page-create-dialog')).not.toBeInTheDocument();
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Simula a ação de editar
    const editButton = screen.getByTestId('mock-edit-button');
    await user.click(editButton);

    // Verifica se o diálogo foi aberto
    expect(screen.getByTestId('test-entity-page-edit-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Editar Entidade');

    // Verifica se o formulário está no modo de edição
    const form = screen.getByTestId('mock-entity-form');
    expect(form).toHaveAttribute('data-edit-mode', 'true');

    // Verifica se a entidade foi passada corretamente
    expect(screen.getByTestId('entity-id')).toHaveTextContent('1');
    expect(screen.getByTestId('passed-props')).toHaveTextContent('entity');
  });

  it('should pass entityPropName correctly to the form when provided', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} entityPropName="testEntity" />);

    // Simula a ação de editar
    const editButton = screen.getByTestId('mock-edit-button');
    await user.click(editButton);

    // Verifica se a propriedade específica foi passada corretamente
    expect(screen.getByTestId('passed-props')).toHaveTextContent('entity,testEntity');
    expect(screen.getByTestId('prop-entity')).toHaveTextContent('1');
    expect(screen.getByTestId('prop-testEntity')).toHaveTextContent('1');
  });

  it('should call updateEntity and close dialog when edit form is submitted', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Abre o diálogo de edição
    const editButton = screen.getByTestId('mock-edit-button');
    await user.click(editButton);

    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');
    await user.click(submitButton);

    // Verifica se a função de atualização foi chamada com os dados corretos
    expect(mockUpdateFn).toHaveBeenCalledTimes(1);
    expect(mockUpdateFn).toHaveBeenCalledWith('1', {
      name: 'Test Entity',
      description: 'Test Description',
    });

    // Verifica se o diálogo foi fechado após a atualização
    expect(screen.queryByTestId('test-entity-page-edit-dialog')).not.toBeInTheDocument();
  });

  it('should call deleteEntity when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} />);

    // Simula a ação de excluir
    const deleteButton = screen.getByTestId('mock-delete-button');
    await user.click(deleteButton);

    // Verifica se a função de exclusão foi chamada com o ID correto
    expect(mockDeleteFn).toHaveBeenCalledTimes(1);
    expect(mockDeleteFn).toHaveBeenCalledWith('1');
  });

  it('should handle errors during create action', async () => {
    // Simula um erro durante a criação
    const errorMock = vi.fn().mockRejectedValueOnce(new Error('Erro ao criar entidade'));

    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} createEntity={errorMock} />);

    // Abre o diálogo
    const addButton = screen.getByTestId('test-entity-page-add-button');
    await user.click(addButton);

    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');
    await user.click(submitButton);

    // Verifica se tentativa de criação ocorreu
    expect(errorMock).toHaveBeenCalledTimes(1);

    // Verifica se o formulário não está mais em estado de submissão
    expect(screen.getByTestId('form-submitting')).toHaveTextContent('false');

    // O diálogo deve permanecer aberto quando ocorre um erro
    expect(screen.getByTestId('test-entity-page-create-dialog')).toBeInTheDocument();
  });

  it('should handle errors during update action', async () => {
    // Simula um erro durante a atualização
    const errorMock = vi.fn().mockRejectedValueOnce(new Error('Erro ao atualizar entidade'));
    const user = userEvent.setup();
    render(<EntityPage {...defaultProps} updateEntity={errorMock} />);

    // Abre o diálogo de edição
    const editButton = screen.getByTestId('mock-edit-button');
    await user.click(editButton);

    // Submete o formulário
    const submitButton = screen.getByTestId('mock-submit-button');
    await user.click(submitButton);

    // Verifica se tentativa de atualização ocorreu
    expect(errorMock).toHaveBeenCalledTimes(1);

    // Verifica se o formulário não está mais em estado de submissão
    expect(screen.getByTestId('form-submitting')).toHaveTextContent('false');

    // O diálogo deve permanecer aberto quando ocorre um erro
    expect(screen.getByTestId('test-entity-page-edit-dialog')).toBeInTheDocument();
  });
});
