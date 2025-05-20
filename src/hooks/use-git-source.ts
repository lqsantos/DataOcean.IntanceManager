import { useCallback, useEffect, useState } from 'react';

import { GitSourceService } from '@/services/git-source-service';
import type {
  CreateGitSourceDto,
  GitSource,
  TestConnectionResult,
  UpdateGitSourceDto,
} from '@/types/git-source';

export function useGitSource() {
  const [gitSource, setGitSource] = useState<GitSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar a fonte Git
  const fetchGitSource = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await GitSourceService.get();

      setGitSource(data);
    } catch (err) {
      console.error('Failed to fetch Git source:', err);
      setError('Não foi possível carregar a fonte Git. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para recarregar a fonte Git
  const refreshGitSource = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchGitSource();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchGitSource]);

  // Carregar fonte Git na montagem do componente
  useEffect(() => {
    fetchGitSource();
  }, [fetchGitSource]);

  // Função para criar uma nova fonte Git
  const createGitSource = useCallback(async (data: CreateGitSourceDto): Promise<GitSource> => {
    try {
      const newGitSource = await GitSourceService.create(data);

      setGitSource(newGitSource);

      return newGitSource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar fonte Git';

      console.error('Failed to create Git source:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Função para atualizar uma fonte Git existente
  const updateGitSource = useCallback(
    async (id: string, data: UpdateGitSourceDto): Promise<GitSource> => {
      try {
        const updatedGitSource = await GitSourceService.update(id, data);

        setGitSource(updatedGitSource);

        return updatedGitSource;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar fonte Git';

        console.error('Failed to update Git source:', err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Função para testar a conexão com a fonte Git
  const testConnection = useCallback(async (id: string): Promise<TestConnectionResult> => {
    try {
      setIsTesting(true);
      setError(null);

      const result = await GitSourceService.testConnection(id);

      setTestResult(result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão Git';

      console.error('Failed to test Git connection:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Função para ativar uma fonte Git
  const activateGitSource = useCallback(async (id: string): Promise<GitSource> => {
    try {
      const activatedGitSource = await GitSourceService.activate(id);

      setGitSource(activatedGitSource);

      return activatedGitSource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao ativar fonte Git';

      console.error('Failed to activate Git source:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Função para desativar uma fonte Git
  const deactivateGitSource = useCallback(async (id: string): Promise<GitSource> => {
    try {
      const deactivatedGitSource = await GitSourceService.deactivate(id);

      setGitSource(deactivatedGitSource);

      return deactivatedGitSource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desativar fonte Git';

      console.error('Failed to deactivate Git source:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Função para excluir uma fonte Git
  const deleteGitSource = useCallback(async (id: string): Promise<void> => {
    try {
      await GitSourceService.delete(id);
      setGitSource(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir fonte Git';

      console.error('Failed to delete Git source:', err);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    gitSource,
    isLoading,
    isRefreshing,
    isTesting,
    testResult,
    error,
    refreshGitSource,
    createGitSource,
    updateGitSource,
    testConnection,
    activateGitSource,
    deactivateGitSource,
    deleteGitSource,
  };
}
