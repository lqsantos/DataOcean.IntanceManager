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
  console.log('[Debug] useApplications hook called', { hasInitialData: !!options.initialData });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, error, mutate } = useSWR<Application[], Error>('/api/applications', fetcher, {
    ...options,
    fallbackData: options.initialData,
    onError: (err) => {
      console.error('[Debug] useApplications SWR error:', err);
      logError(err, 'Erro ao buscar aplicações');
    },
  });

  /**
   * Função para buscar aplicações
   */
  async function fetcher(): Promise<Application[]> {
    console.log('[Debug] useApplications fetcher called');

    try {
      const applications = await ApplicationService.getAll();

      console.log('[Debug] useApplications fetcher success:', applications.length);

      return applications;
    } catch (err) {
      console.error('[Debug] useApplications fetcher error:', err);
      throw err;
    }
  }

  /**
   * Função para atualizar a lista de aplicações
   */
  const refreshApplications = useCallback(async () => {
    console.log('[Debug] useApplications refreshApplications called');
    setIsRefreshing(true);

    try {
      await mutate();
      console.log('[Debug] useApplications refreshed successfully');
    } catch (err) {
      console.error('[Debug] useApplications refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [mutate]);

  /**
   * Função para criar uma nova aplicação
   */
  const createApplication = useCallback(
    async (data: CreateApplicationDto): Promise<Application> => {
      console.log('[Debug] useApplications createApplication called with data:', data);

      try {
        const created = await ApplicationService.create(data);

        console.log('[Debug] useApplications createApplication success:', created);
        await mutate();

        return created;
      } catch (err) {
        console.error('[Debug] useApplications createApplication error:', err);
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
      console.log('[Debug] useApplications updateApplication called', { id, data });

      try {
        const updated = await ApplicationService.update(id, data);

        console.log('[Debug] useApplications updateApplication success:', updated);
        await mutate();

        return updated;
      } catch (err) {
        console.error('[Debug] useApplications updateApplication error:', err);
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
      console.log('[Debug] useApplications deleteApplication called', { id });

      try {
        await ApplicationService.delete(id);
        console.log('[Debug] useApplications deleteApplication success');
        await mutate();
      } catch (err) {
        console.error('[Debug] useApplications deleteApplication error:', err);
        logError(err, 'Erro ao excluir aplicação');
        throw err;
      }
    },
    [mutate]
  );

  // Carregar dados iniciais
  useEffect(() => {
    if (!options.initialData && !data && !error) {
      console.log('[Debug] useApplications initial load');
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
