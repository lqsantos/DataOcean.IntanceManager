import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

import { useEnvironments } from '../use-environments';

// Mock data para testes
const mockEnvironments: Environment[] = [
  {
    id: '1',
    name: 'Development',
    slug: 'dev',
    order: 1,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Staging',
    slug: 'stg',
    order: 2,
    createdAt: '2023-01-15T10:35:00Z',
  },
];

const mockNewEnvironment: Environment = {
  id: '3',
  name: 'Production',
  slug: 'prod',
  order: 3,
  createdAt: '2023-01-16T12:00:00Z',
};

const mockUpdatedEnvironment: Environment = {
  id: '1',
  name: 'Development Updated',
  slug: 'dev-updated',
  order: 1,
  createdAt: '2023-01-15T10:30:00Z',
  updatedAt: '2023-01-17T14:20:00Z',
};

describe('useEnvironments', () => {
  // Teste para o carregamento inicial
  it('should load environments on initial render', async () => {
    // Sobrescreve o handler para retornar nossos ambientes de mock
    server.use(
      http.get('/api/environments', () => {
        return HttpResponse.json(mockEnvironments);
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Inicialmente, o estado de carregamento deve ser true
    expect(result.current.isLoading).toBe(true);

    // Aguardar a conclusão do carregamento
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar se os ambientes foram carregados corretamente
    expect(result.current.environments).toEqual(mockEnvironments);
    expect(result.current.error).toBeNull();
  });

  // Teste para o carregamento com erro
  it('should handle errors when loading environments fails', async () => {
    // Sobrescreve o handler para simular um erro
    server.use(
      http.get('/api/environments', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar a conclusão do carregamento
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar se o erro foi tratado
    expect(result.current.error).not.toBeNull();
    expect(result.current.environments).toEqual([]);
  });

  // Teste para a função refreshEnvironments
  it('should refresh environments when refreshEnvironments is called', async () => {
    // Configurar o mock para retornar dados diferentes na primeira e na segunda chamada
    let callCount = 0;

    server.use(
      http.get('/api/environments', () => {
        callCount++;

        if (callCount === 1) {
          return HttpResponse.json(mockEnvironments);
        } else {
          return HttpResponse.json([...mockEnvironments, mockNewEnvironment]);
        }
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar dados iniciais
    expect(result.current.environments).toEqual(mockEnvironments);

    // Chamar refreshEnvironments
    act(() => {
      result.current.refreshEnvironments();
    });

    // Verificar se isRefreshing é true durante o refresh
    expect(result.current.isRefreshing).toBe(true);

    // Aguardar a conclusão do refresh
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    // Verificar se os dados foram atualizados
    expect(result.current.environments).toEqual([...mockEnvironments, mockNewEnvironment]);
  });

  // Teste para a função createEnvironment (sucesso)
  it('should create a new environment successfully', async () => {
    server.use(
      http.post('/api/environments', () => {
        return HttpResponse.json(mockNewEnvironment, { status: 201 });
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Criar novo ambiente
    const createDto: CreateEnvironmentDto = {
      name: 'Production',
      slug: 'prod',
      order: 3,
    };

    let createdEnv: Environment | null = null;

    await act(async () => {
      createdEnv = await result.current.createEnvironment(createDto);
    });

    // Verificar se o ambiente foi criado e adicionado ao estado
    expect(createdEnv).toEqual(mockNewEnvironment);
    expect(result.current.environments).toContainEqual(mockNewEnvironment);
  });

  // Teste para a função createEnvironment (erro)
  it('should handle error when creating environment fails', async () => {
    server.use(
      http.post('/api/environments', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Já existe um ambiente com o slug "prod"' }),
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar criar ambiente com slug duplicado
    const createDto: CreateEnvironmentDto = {
      name: 'Production',
      slug: 'prod',
    };

    // Verificar se o erro é lançado
    await expect(result.current.createEnvironment(createDto)).rejects.toThrow();
  });

  // Teste para a função updateEnvironment (sucesso)
  it('should update an environment successfully', async () => {
    server.use(
      http.get('/api/environments', () => {
        return HttpResponse.json(mockEnvironments);
      }),
      http.patch('/api/environments/1', () => {
        return HttpResponse.json(mockUpdatedEnvironment);
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Atualizar ambiente
    const updateDto: UpdateEnvironmentDto = {
      name: 'Development Updated',
      slug: 'dev-updated',
    };

    let updatedEnv: Environment | null = null;

    await act(async () => {
      updatedEnv = await result.current.updateEnvironment('1', updateDto);
    });

    // Verificar se o ambiente foi atualizado
    expect(updatedEnv).toEqual(mockUpdatedEnvironment);

    // Verificar se a lista de ambientes foi atualizada
    expect(result.current.environments.find((env) => env.id === '1')).toEqual(
      mockUpdatedEnvironment
    );
  });

  // Teste para a função updateEnvironment (erro)
  it('should handle error when updating environment fails', async () => {
    server.use(
      http.patch('/api/environments/999', () => {
        return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
          status: 404,
        });
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar atualizar ambiente que não existe
    const updateDto: UpdateEnvironmentDto = {
      name: 'Non-existent Environment',
    };

    // Verificar se o erro é lançado
    await expect(result.current.updateEnvironment('999', updateDto)).rejects.toThrow();
  });

  // Teste para a função deleteEnvironment (sucesso)
  it('should delete an environment successfully', async () => {
    server.use(
      http.get('/api/environments', () => {
        return HttpResponse.json(mockEnvironments);
      }),
      http.delete('/api/environments/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.environments).toHaveLength(2);
    });

    // Excluir ambiente
    await act(async () => {
      await result.current.deleteEnvironment('1');
    });

    // Verificar se o ambiente foi removido da lista
    expect(result.current.environments).toHaveLength(1);
    expect(result.current.environments.find((env) => env.id === '1')).toBeUndefined();
  });

  // Teste para a função deleteEnvironment (erro)
  it('should handle error when deleting environment fails', async () => {
    server.use(
      http.delete('/api/environments/999', () => {
        return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
          status: 404,
        });
      })
    );

    const { result } = renderHook(() => useEnvironments());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar excluir ambiente que não existe
    await expect(result.current.deleteEnvironment('999')).rejects.toThrow();
  });
});
