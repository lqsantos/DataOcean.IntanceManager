// hooks/use-environments.ts
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { useEffect, useState } from 'react';

// Dados mockados para desenvolvimento
const mockEnvironments: Environment[] = [
  { id: '1', name: 'Development', slug: 'dev', order: 1 },
  { id: '2', name: 'Staging', slug: 'stg', order: 2 },
  { id: '3', name: 'Production', slug: 'prod', order: 3 },
];

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simular atraso de rede
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEnvironments(mockEnvironments);
        setError(null);
      } catch (err) {
        setError('Failed to load environments');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const createEnvironment = async (data: CreateEnvironmentDto): Promise<Environment> => {
    try {
      // Simular atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEnvironment: Environment = {
        id: Date.now().toString(),
        ...data,
        order: data.order ?? environments.length + 1,
      };

      setEnvironments((prev) => [...prev, newEnvironment]);
      return newEnvironment;
    } catch (err) {
      setError('Failed to create environment');
      console.error(err);
      throw err;
    }
  };

  const updateEnvironment = async (
    id: string,
    data: UpdateEnvironmentDto
  ): Promise<Environment> => {
    try {
      // Simular atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedEnvironments = environments.map((env) =>
        env.id === id ? { ...env, ...data } : env
      );

      setEnvironments(updatedEnvironments);
      const updatedEnvironment = updatedEnvironments.find((env) => env.id === id);

      if (!updatedEnvironment) {
        throw new Error('Environment not found');
      }

      return updatedEnvironment;
    } catch (err) {
      setError('Failed to update environment');
      console.error(err);
      throw err;
    }
  };

  const deleteEnvironment = async (id: string): Promise<void> => {
    try {
      // Simular atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEnvironments((prev) => prev.filter((env) => env.id !== id));
    } catch (err) {
      setError('Failed to delete environment');
      console.error(err);
      throw err;
    }
  };

  return {
    environments,
    isLoading,
    error,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  };
}
