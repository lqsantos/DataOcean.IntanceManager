import { EnvironmentService } from '@/services/environment-service';
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { useCallback, useEffect, useState } from 'react';

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar os ambientes
  const fetchEnvironments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await EnvironmentService.getAll();
      setEnvironments(data);
    } catch (err) {
      console.error('Failed to fetch environments:', err);
      setError('Não foi possível carregar os ambientes. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para recarregar os ambientes
  const refreshEnvironments = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchEnvironments();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchEnvironments]);

  // Carregar ambientes na montagem do componente
  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  // Função para criar um novo ambiente
  const createEnvironment = useCallback(
    async (data: CreateEnvironmentDto): Promise<Environment> => {
      try {
        const newEnvironment = await EnvironmentService.create(data);
        setEnvironments((prev) => [...prev, newEnvironment]);
        return newEnvironment;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar ambiente';
        console.error('Failed to create environment:', err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Função para atualizar um ambiente existente
  const updateEnvironment = useCallback(
    async (id: string, data: UpdateEnvironmentDto): Promise<Environment> => {
      try {
        const updatedEnvironment = await EnvironmentService.update(id, data);

        setEnvironments((prev) => prev.map((env) => (env.id === id ? updatedEnvironment : env)));

        return updatedEnvironment;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar ambiente';
        console.error('Failed to update environment:', err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Função para excluir um ambiente
  const deleteEnvironment = useCallback(async (id: string): Promise<void> => {
    try {
      await EnvironmentService.delete(id);
      setEnvironments((prev) => prev.filter((env) => env.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir ambiente';
      console.error('Failed to delete environment:', err);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    environments,
    isLoading,
    isRefreshing,
    error,
    refreshEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  };
}
