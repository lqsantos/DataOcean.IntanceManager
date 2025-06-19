// hooks/use-applications.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ApplicationService } from '@/services/application-service';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';
import { logError } from '@/utils/errorLogger';

interface UseApplicationsOptions extends SWRConfiguration {
  initialData?: Application[];
}

/**
 * Hook para gerenciamento de aplicações
 */
export function useApplications(options: UseApplicationsOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, error, mutate } = useSWR<Application[], Error>('/api/applications', fetcher, {
    ...options,
    fallbackData: options.initialData,
    onError: (err) => {
      logError(err, 'Erro ao buscar aplicações');
    },
  });

  /**
   * Função para buscar aplicações
   */
  async function fetcher(): Promise<Application[]> {
    try {
      return await ApplicationService.getAll();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Função para atualizar a lista de aplicações
   */
  const refreshApplications = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await mutate();
    } catch (err) {
      // Erro já será capturado pelo SWR
    } finally {
      setIsRefreshing(false);
    }
  }, [mutate]);

  /**
   * Função para criar uma nova aplicação
   */
  const createApplication = useCallback(
    async (data: CreateApplicationDto): Promise<Application> => {
      try {
        const created = await ApplicationService.create(data);

        await mutate();

        return created;
      } catch (err) {
        logError(err, 'Erro ao criar aplicação');
        throw err;
      }
    },
    [mutate]
  );

  /**
   * Função para atualizar uma aplicação existente
   */
  const updateApplication = useCallback(
    async (id: string, data: UpdateApplicationDto): Promise<Application> => {
      try {
        const updated = await ApplicationService.update(id, data);

        await mutate();

        return updated;
      } catch (err) {
        logError(err, 'Erro ao atualizar aplicação');
        throw err;
      }
    },
    [mutate]
  );

  /**
   * Função para excluir uma aplicação
   */
  const deleteApplication = useCallback(
    async (id: string): Promise<void> => {
      try {
        await ApplicationService.delete(id);
        await mutate();
      } catch (err) {
        logError(err, 'Erro ao excluir aplicação');
        throw err;
      }
    },
    [mutate]
  );

  // Carregar dados iniciais
  useEffect(() => {
    if (!options.initialData && !data && !error) {
      void refreshApplications();
    }
  }, [data, error, options.initialData, refreshApplications]);

  return {
    applications: data || [],
    isLoading: !error && !data,
    isRefreshing,
    error: error?.message,
    refreshApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
