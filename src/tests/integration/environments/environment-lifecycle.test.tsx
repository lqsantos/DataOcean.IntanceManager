import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { EnvironmentsPage } from '@/components/environments/environments-page';
import { server } from '@/mocks/server';
import type { Environment } from '@/types/environment';
import '@testing-library/jest-dom';

// Mock do hook useEnvironments para poder controlar o estado de erro
// Deve ser feito antes de importar componentes que usam o hook
let environments: Environment[] = [];
let isError = false;
let errorMessage: string | null = null;

// Criamos espiões globais para as funções do hook
const createEnvironmentSpy = vi.fn();
const updateEnvironmentSpy = vi.fn();
const deleteEnvironmentSpy = vi.fn();

// Função para simular a exclusão de um ambiente
const mockDeleteEnvironment = async (id: string) => {
  deleteEnvironmentSpy(id);

  if (isError) {
    errorMessage = 'Falha ao excluir ambiente';
    throw new Error(errorMessage);
  }

  // Remova o ambiente do array environments
  environments = environments.filter((env) => env.id !== id);
};

vi.mock('@/hooks/use-environments', () => ({
  useEnvironments: () => ({
    environments: isError ? [] : environments,
    isLoading: false,
    isRefreshing: false,
    error: errorMessage,
    refreshEnvironments: vi.fn(),
    createEnvironment: async (data) => {
      // Usar o espião global para registrar a chamada
      createEnvironmentSpy(data);

      if (isError) {
        errorMessage = 'Falha ao criar ambiente';
        throw new Error(errorMessage);
      }
      const newEnvironment = {
        id: '3',
        name: data.name,
        slug: data.slug,
        order: data.order || 3,
        createdAt: new Date().toISOString(),
      };

      environments = [...environments, newEnvironment];

      return newEnvironment;
    },
    updateEnvironment: async (id, data) => {
      // Usar o espião global para registrar a chamada
      updateEnvironmentSpy(id, data);

      if (isError) {
        errorMessage = 'Falha ao atualizar ambiente';
        throw new Error(errorMessage);
      }

      const updatedEnvironment = {
        id,
        name: data.name || 'Updated Environment',
        slug: data.slug || 'updated-environment',
        order: data.order || 1,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: new Date().toISOString(),
      };

      environments = environments.map((env) => (env.id === id ? updatedEnvironment : env));

      return updatedEnvironment;
    },
    deleteEnvironment: mockDeleteEnvironment,
    // Funções auxiliares para testes
    __setError: (error: boolean) => {
      isError = error;
    },
    __setErrorMessage: (message: string | null) => {
      errorMessage = message;
    },
    __setEnvironments: (envs: Environment[]) => {
      environments = envs;
    },
  }),
}));

// Agora é seguro importar componentes que usam o hook mockado

// Mock do componente DropdownMenu para evitar problemas com o portal do Radix UI
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children, asChild }: any) =>
      asChild ? children : <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick, 'data-testid': dataTestId }: any) => (
      <button onClick={onClick} data-testid={dataTestId}>
        {children}
      </button>
    ),
  };
});

// Mock do componente AlertDialog para evitar problemas com o portal do Radix UI
vi.mock('@/components/ui/alert-dialog', () => {
  return {
    AlertDialog: ({ children }: any) => <div>{children}</div>,
    AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
    AlertDialogContent: ({ children }: any) => (
      <div role="dialog" aria-modal="true">
        {children}
      </div>
    ),
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
    AlertDialogCancel: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="cancel-delete-button">
        {children}
      </button>
    ),
  };
});

// Mock para componente DeleteEnvironmentDialog para controlar diretamente o estado do diálogo
vi.mock('@/components/environments/delete-environment-dialog', () => {
  return {
    DeleteEnvironmentDialog: ({ environment, isOpen, onDelete, onCancel }: any) => {
      if (!isOpen || !environment) {
        return null;
      }

      return (
        <div role="dialog" aria-modal="true" data-testid="delete-dialog">
          <p>Confirmar exclusão de {environment.name}?</p>
          <button onClick={onDelete} data-testid="confirm-delete-button">
            Confirmar
          </button>
          <button onClick={onCancel} data-testid="cancel-delete-button">
            Cancelar
          </button>
        </div>
      );
    },
  };
});

// Dados mockados para os testes de integração
const mockEnvironments: Environment[] = [
  {
    id: '1',
    name: 'Ambiente de Teste',
    slug: 'ambiente-teste',
    order: 1,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Ambiente de Produção',
    slug: 'ambiente-producao',
    order: 2,
    createdAt: '2023-01-15T10:35:00Z',
  },
];

/**
 * Testes de integração do fluxo de gerenciamento de ambientes
 *
 * Nota: Este teste utiliza a configuração global do MSW em src/tests/setup.ts,
 * que já configura beforeAll(server.listen()), afterEach(server.resetHandlers()),
 * e afterAll(server.close()).
 *
 * Aqui, usamos server.use() para sobrescrever temporariamente os handlers
 * específicos para cada teste.
 */
describe('Environment Management Flow', () => {
  // Antes de cada teste, configurar os handlers do MSW
  beforeEach(() => {
    // Resetar estados
    isError = false;
    errorMessage = null;
    environments = [...mockEnvironments];
    createEnvironmentSpy.mockClear();
    updateEnvironmentSpy.mockClear();
    deleteEnvironmentSpy.mockClear();

    // Sobrescreve temporariamente os handlers para os testes
    server.use(
      // GET /api/environments - Listar ambientes
      http.get('/api/environments', () => {
        return HttpResponse.json(mockEnvironments);
      }),

      // POST /api/environments - Criar ambiente
      http.post('/api/environments', async ({ request }) => {
        const data = await request.json();
        const newEnvironment = {
          id: '3',
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          order: 3,
          createdAt: new Date().toISOString(),
        };

        return HttpResponse.json(newEnvironment, { status: 201 });
      }),

      // PATCH /api/environments/:id - Atualizar ambiente
      http.patch('/api/environments/:id', async ({ request, params }) => {
        const data = await request.json();
        const updatedEnvironment = {
          id: params.id as string,
          name: data.name,
          slug: data.name?.toLowerCase().replace(/\s+/g, '-') || 'updated-environment',
          order: 1,
          createdAt: '2023-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        };

        return HttpResponse.json(updatedEnvironment);
      }),

      // DELETE /api/environments/:id - Excluir ambiente
      http.delete('/api/environments/:id', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    // Renderizar o componente principal para cada teste
    render(<EnvironmentsPage />);
  });

  it('should load the environments page correctly', async () => {
    // Verificar se a página de ambientes foi carregada usando o data-testid em vez do texto
    await waitFor(() => {
      expect(screen.getByTestId('environments-page')).toBeInTheDocument();
    });

    // Verificar se a tabela de ambientes foi carregada
    await waitFor(() => {
      expect(screen.getByTestId('environments-table')).toBeInTheDocument();
    });

    // Verificar se os dados dos ambientes estão sendo exibidos
    await waitFor(() => {
      mockEnvironments.forEach((env) => {
        // Usar um seletor mais específico para encontrar o nome do ambiente na tabela
        expect(screen.getByTestId(`environment-name-${env.id}`)).toHaveTextContent(env.name);
      });
    });
  });

  it('should create a new environment', async () => {
    // Clicar no botão para adicionar ambiente usando seu data-testid correto
    fireEvent.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo de criação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    });

    // Preencher o formulário
    fireEvent.change(screen.getByTestId('env-name-input'), {
      target: { value: 'Novo Ambiente' },
    });

    fireEvent.change(screen.getByTestId('env-slug-input'), {
      target: { value: 'novo-ambiente' },
    });

    fireEvent.change(screen.getByTestId('env-order-input'), {
      target: { value: '3' },
    });

    // Submeter o formulário
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verificar se o espião foi chamado com os dados corretos
    await waitFor(() => {
      expect(createEnvironmentSpy).toHaveBeenCalledTimes(1);
      expect(createEnvironmentSpy).toHaveBeenCalledWith({
        name: 'Novo Ambiente',
        slug: 'novo-ambiente',
        order: 3,
      });
    });

    // Verificar se o novo ambiente aparece na tabela
    await waitFor(() => {
      // Buscar pelo id específico do ambiente recém-criado
      expect(screen.getByTestId('environment-name-3')).toHaveTextContent('Novo Ambiente');
    });
  });

  it('should edit an existing environment', async () => {
    // Agora podemos clicar diretamente no botão de edição, pois mockamos o DropdownMenu
    await waitFor(() => {
      expect(screen.getByTestId('edit-button-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-button-1'));

    // Verificar se o formulário de edição foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    });

    // Alterar o nome do ambiente
    fireEvent.change(screen.getByTestId('env-name-input'), {
      target: { value: 'Ambiente Atualizado' },
    });

    // Submeter o formulário
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verificar se o espião foi chamado com os dados corretos
    await waitFor(() => {
      expect(updateEnvironmentSpy).toHaveBeenCalledTimes(1);
      expect(updateEnvironmentSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'Ambiente Atualizado',
        })
      );
    });

    // Verificar se o ambiente foi atualizado na tabela
    await waitFor(() => {
      expect(screen.getByTestId('environment-name-1')).toHaveTextContent('Ambiente Atualizado');
    });
  });

  it('should delete an environment', async () => {
    // Verifica se o ambiente está na tabela antes da exclusão
    await waitFor(() => {
      expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
    });

    // Clica no botão de exclusão
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Verifica se o diálogo de confirmação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    // Confirma a exclusão
    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    // Verifica se o espião foi chamado com o ID correto
    await waitFor(() => {
      expect(deleteEnvironmentSpy).toHaveBeenCalledWith('1');
    });

    // Verifica se o ambiente foi removido do estado interno (sem depender da UI)
    expect(environments).toEqual([mockEnvironments[1]]);
  });

  it('should show validation errors when creating with invalid data', async () => {
    // Clicar no botão para adicionar ambiente
    fireEvent.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo de criação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    });

    // Submeter o formulário sem preencher os campos obrigatórios
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verificar se as mensagens de erro aparecem
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('slug-error')).toBeInTheDocument();
    });

    // Preencher com valores inválidos
    fireEvent.change(screen.getByTestId('env-name-input'), {
      target: { value: 'ab' }, // Nome muito curto (menos de 3 caracteres)
    });

    fireEvent.change(screen.getByTestId('env-slug-input'), {
      target: { value: 'INVALID-SLUG!' }, // Slug em maiúsculo e com caractere especial
    });

    fireEvent.change(screen.getByTestId('env-order-input'), {
      target: { value: '-1' }, // Ordem negativa
    });

    // Submeter novamente
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verificar se as novas mensagens de erro aparecem
    await waitFor(() => {
      // Verifica se os erros específicos de cada campo aparecem
      expect(screen.getByTestId('name-error').textContent?.toLowerCase()).toContain(
        'pelo menos 3 caracteres'
      );
      expect(screen.getByTestId('slug-error').textContent?.toLowerCase()).toContain(
        'apenas letras minúsculas'
      );
      expect(screen.getByTestId('order-error').textContent?.toLowerCase()).toContain(
        'número positivo'
      );
    });
  });

  it('should cancel environment creation', async () => {
    // Clicar no botão para adicionar ambiente
    fireEvent.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo de criação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    });

    // Preencher parcialmente o formulário
    fireEvent.change(screen.getByTestId('env-name-input'), {
      target: { value: 'Ambiente Cancelado' },
    });

    // Clicar no botão cancelar
    fireEvent.click(screen.getByTestId('cancel-button'));

    // Verificar se o diálogo foi fechado
    await waitFor(() => {
      expect(screen.queryByTestId('environment-form')).not.toBeInTheDocument();
    });

    // Verificar se o ambiente não foi adicionado à tabela
    expect(screen.queryByTestId('environment-name-3')).not.toBeInTheDocument();
  });

  it('should search and filter environments', async () => {
    // Aguardar a tabela ser carregada
    await waitFor(() => {
      expect(screen.getByTestId('environments-table')).toBeInTheDocument();
    });

    // Verificar se ambos os ambientes estão visíveis inicialmente
    expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('environment-row-2')).toBeInTheDocument();

    // Buscar por um termo que só corresponde a um ambiente
    const searchInput = screen.getByTestId('environments-search-input');

    fireEvent.change(searchInput, { target: { value: 'Teste' } });

    // Verificar se apenas o ambiente com "Teste" no nome é exibido
    await waitFor(() => {
      expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
      expect(screen.queryByTestId('environment-row-2')).not.toBeInTheDocument();
    });

    // Limpar a busca
    fireEvent.change(searchInput, { target: { value: '' } });

    // Verificar se todos os ambientes são exibidos novamente
    await waitFor(() => {
      expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('environment-row-2')).toBeInTheDocument();
    });

    // Buscar por um termo que não corresponde a nenhum ambiente
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    // Verificar se a mensagem de "nenhum resultado" é exibida
    await waitFor(() => {
      expect(screen.queryByTestId('environment-row-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('environment-row-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state').textContent).toContain('xyz123');
    });
  });

  it('should cancel environment deletion', async () => {
    // Agora podemos clicar diretamente no botão de exclusão, pois mockamos o DropdownMenu
    await waitFor(() => {
      expect(screen.getByTestId('delete-button-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Verificar se o diálogo de confirmação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    // Cancelar a exclusão
    fireEvent.click(screen.getByTestId('cancel-delete-button'));

    // Verificar se o diálogo foi fechado sem usar waitForElementToBeRemoved
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });

    // Verificar se o ambiente ainda está na tabela
    expect(screen.getByTestId('environment-row-1')).toBeInTheDocument();
  });

  it('should handle API error when creating an environment', async () => {
    // Configurar o mock para simular um erro
    isError = true;
    errorMessage = 'Falha ao criar ambiente';

    // Clicar no botão para adicionar ambiente
    fireEvent.click(screen.getByTestId('environments-page-add-button'));

    // Verificar se o diálogo de criação foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    });

    // Preencher o formulário
    fireEvent.change(screen.getByTestId('env-name-input'), {
      target: { value: 'Ambiente Com Erro' },
    });

    fireEvent.change(screen.getByTestId('env-slug-input'), {
      target: { value: 'ambiente-com-erro' },
    });

    // Submeter o formulário
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verificar se a mensagem de erro está sendo exibida
    await waitFor(() => {
      expect(screen.getByTestId('environments-page-error-alert')).toBeInTheDocument();
    });

    // Verificar se o diálogo permanece aberto após o erro
    expect(screen.getByTestId('environment-form')).toBeInTheDocument();
  });

  it('should sort environments by different columns', async () => {
    // Aguardar a tabela ser carregada
    await waitFor(() => {
      expect(screen.getByTestId('environments-table')).toBeInTheDocument();
    });

    // Por padrão, a tabela é ordenada por "order"
    // Linha 1 deve ser o ambiente com id 1
    // Linha 2 deve ser o ambiente com id 2
    const rows = screen.getAllByTestId(/^environment-row-/);

    expect(rows[0].getAttribute('data-testid')).toBe('environment-row-1');
    expect(rows[1].getAttribute('data-testid')).toBe('environment-row-2');

    // Clicar para ordenar por nome
    fireEvent.click(screen.getByTestId('sort-by-name'));

    // Verificar a ordem: "Ambiente de Produção" vem antes de "Ambiente de Teste" quando ordenado por nome
    await waitFor(() => {
      const rowsAfterSort = screen.getAllByTestId(/^environment-row-/);

      expect(rowsAfterSort[0].getAttribute('data-testid')).toBe('environment-row-2'); // Ambiente de Produção
      expect(rowsAfterSort[1].getAttribute('data-testid')).toBe('environment-row-1'); // Ambiente de Teste
    });

    // Clicar novamente para inverter a ordem
    fireEvent.click(screen.getByTestId('sort-by-name'));

    // Verificar a ordem inversa
    await waitFor(() => {
      const rowsAfterSort = screen.getAllByTestId(/^environment-row-/);

      expect(rowsAfterSort[0].getAttribute('data-testid')).toBe('environment-row-1'); // Ambiente de Teste
      expect(rowsAfterSort[1].getAttribute('data-testid')).toBe('environment-row-2'); // Ambiente de Produção
    });
  });
});
