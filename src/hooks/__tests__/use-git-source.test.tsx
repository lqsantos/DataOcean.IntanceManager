// src/hooks/use-git-source.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GitSourceService } from '@/services/git-source-service';
import type { GitSource, TestConnectionResult } from '@/types/git-source';

import { useGitSource } from '../use-git-source';

// Mock do serviço GitSourceService
vi.mock('@/services/git-source-service', () => ({
  GitSourceService: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    testConnection: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock para console.error
const originalConsoleError = console.error;

console.error = vi.fn();

describe('useGitSource', () => {
  // Mock da fonte Git para uso nos testes
  const mockGitSource: GitSource = {
    id: '1',
    name: 'GitHub Source',
    provider: 'github',
    organization: 'acme-org',
    status: 'active',
    personalAccessToken: 'token123',
    repositoryCount: 25,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z',
  };

  const mockTestResult: TestConnectionResult = {
    success: true,
    message: 'Conexão realizada com sucesso',
    repositoriesFound: 25,
  };

  // Restaura todos os mocks antes de cada teste
  beforeEach(() => {
    vi.resetAllMocks();
    // Configura mock padrão para get
    (GitSourceService.get as any).mockResolvedValue(mockGitSource);
  });

  // Restaura console.error após todos os testes
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('should fetch gitSource on mount', async () => {
    const { result } = renderHook(() => useGitSource());

    // Inicialmente loading deve ser true
    expect(result.current.isLoading).toBe(true);

    // Aguarda a conclusão da busca
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verifica se o serviço foi chamado e se os dados foram carregados
    expect(GitSourceService.get).toHaveBeenCalledTimes(1);
    expect(result.current.gitSource).toEqual(mockGitSource);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching gitSource fails', async () => {
    const errorMessage = 'Não foi possível carregar a fonte Git';

    (GitSourceService.get as any).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toContain('Não foi possível carregar a fonte Git');
  });

  it('should create gitSource', async () => {
    const newGitSource = {
      ...mockGitSource,
      id: '2',
      name: 'New Git Source',
    };

    (GitSourceService.create as any).mockResolvedValueOnce(newGitSource);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const createData = {
      name: 'New Git Source',
      provider: 'github',
      organization: 'acme-org',
      personalAccessToken: 'token123',
    };

    await act(async () => {
      const created = await result.current.createGitSource(createData);

      expect(created).toEqual(newGitSource);
    });

    expect(GitSourceService.create).toHaveBeenCalledWith(createData);
    expect(result.current.gitSource).toEqual(newGitSource);
  });

  it('should update gitSource', async () => {
    const updatedGitSource = {
      ...mockGitSource,
      name: 'Updated Git Source',
      notes: 'Updated notes',
    };

    (GitSourceService.update as any).mockResolvedValueOnce(updatedGitSource);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updateData = {
      name: 'Updated Git Source',
      notes: 'Updated notes',
    };

    await act(async () => {
      const updated = await result.current.updateGitSource('1', updateData);

      expect(updated).toEqual(updatedGitSource);
    });

    expect(GitSourceService.update).toHaveBeenCalledWith('1', updateData);
    expect(result.current.gitSource).toEqual(updatedGitSource);
  });

  it('should test connection successfully', async () => {
    (GitSourceService.testConnection as any).mockResolvedValueOnce(mockTestResult);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const testResult = await result.current.testConnection('1');

      expect(testResult).toEqual(mockTestResult);
    });

    expect(GitSourceService.testConnection).toHaveBeenCalledWith('1');
    expect(result.current.testResult).toEqual(mockTestResult);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when testing connection', async () => {
    const errorMessage = 'Erro ao testar conexão';

    (GitSourceService.testConnection as any).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.testConnection('1');
        // Deveria falhar, então adicionamos uma falha explícita se chegar aqui
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should activate gitSource', async () => {
    const activatedGitSource = {
      ...mockGitSource,
      status: 'active',
    };

    (GitSourceService.activate as any).mockResolvedValueOnce(activatedGitSource);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const activated = await result.current.activateGitSource('1');

      expect(activated).toEqual(activatedGitSource);
    });

    expect(GitSourceService.activate).toHaveBeenCalledWith('1');
    expect(result.current.gitSource).toEqual(activatedGitSource);
  });

  it('should deactivate gitSource', async () => {
    const deactivatedGitSource = {
      ...mockGitSource,
      status: 'inactive',
    };

    (GitSourceService.deactivate as any).mockResolvedValueOnce(deactivatedGitSource);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const deactivated = await result.current.deactivateGitSource('1');

      expect(deactivated).toEqual(deactivatedGitSource);
    });

    expect(GitSourceService.deactivate).toHaveBeenCalledWith('1');
    expect(result.current.gitSource).toEqual(deactivatedGitSource);
  });

  it('should delete gitSource', async () => {
    (GitSourceService.delete as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteGitSource('1');
    });

    expect(GitSourceService.delete).toHaveBeenCalledWith('1');
    expect(result.current.gitSource).toBeNull();
  });

  it('should refresh gitSource data', async () => {
    const { result } = renderHook(() => useGitSource());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Resetar o mock para verificar a segunda chamada
    vi.resetAllMocks();
    (GitSourceService.get as any).mockResolvedValueOnce(mockGitSource);

    await act(async () => {
      await result.current.refreshGitSource();
    });

    expect(GitSourceService.get).toHaveBeenCalledTimes(1);
  });
});
