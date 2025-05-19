// hooks/use-applications.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApplicationService } from '@/services/application-service';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';
import { logError } from '@/utils/errorLogger';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await ApplicationService.getAll();

      setApplications(data);
      setError(null);
    } catch (err) {
      logError(err, 'Failed to fetch applications');
      setError(err instanceof Error ? err.message : 'Falha ao carregar aplicações');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshApplications = useCallback(async () => {
    setIsRefreshing(true);
    await fetchApplications();
  }, [fetchApplications]);

  const createApplication = useCallback(async (data: CreateApplicationDto) => {
    try {
      const newApplication = await ApplicationService.create(data);

      setApplications((prev) => [...prev, newApplication]);

      return newApplication;
    } catch (err) {
      logError(err, 'Failed to create application');
      throw err;
    }
  }, []);

  const updateApplication = useCallback(async (id: string, data: UpdateApplicationDto) => {
    try {
      const updatedApplication = await ApplicationService.update(id, data);

      setApplications((prev) =>
        prev.map((application) => (application.id === id ? updatedApplication : application))
      );

      return updatedApplication;
    } catch (err) {
      logError(err, 'Failed to update application');
      throw err;
    }
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    try {
      await ApplicationService.delete(id);
      setApplications((prev) => prev.filter((application) => application.id !== id));
    } catch (err) {
      logError(err, 'Failed to delete application');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
