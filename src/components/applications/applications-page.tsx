// components/applications/applications-page.tsx
'use client';

import { PlusCircle, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useApplicationModal } from '@/contexts/modal-manager-context';
import { useApplications } from '@/hooks/use-applications';
import type { Application, CreateApplicationDto } from '@/types/application';

import { ApplicationsTable } from './applications-table';
import { CreateApplicationModal } from './create-application-modal';

export function ApplicationsPage() {
  const pathname = usePathname();
  const isInSettings = pathname.includes('/settings');

  console.log('[DIAGNOSTIC] ApplicationsPage rendered', { isInSettings, pathname });

  const {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    createApplication: originalCreateApplication,
    updateApplication: originalUpdateApplication,
    deleteApplication,
  } = useApplications();

  // Wrapper para adicionar logs de diagnóstico à função createApplication
  const createApplication = async (data: CreateApplicationDto): Promise<Application> => {
    console.log('[CRITICAL-DIAGNOSTIC] createApplication called with data:', data);

    try {
      const result = await originalCreateApplication(data);

      console.log('[CRITICAL-DIAGNOSTIC] createApplication succeeded with result:', result);

      return result;
    } catch (error) {
      console.error('[CRITICAL-DIAGNOSTIC] createApplication failed with error:', error);
      throw error;
    }
  };

  // Wrapper para adicionar logs de diagnóstico à função updateApplication
  const updateApplication = async (id: string, data: any): Promise<Application> => {
    console.log('[CRITICAL-DIAGNOSTIC] updateApplication called with id:', id, 'and data:', data);

    try {
      const result = await originalUpdateApplication(id, data);

      console.log('[CRITICAL-DIAGNOSTIC] updateApplication succeeded with result:', result);

      return result;
    } catch (error) {
      console.error('[CRITICAL-DIAGNOSTIC] updateApplication failed with error:', error);
      throw error;
    }
  };

  console.log('[DIAGNOSTIC] ApplicationsPage useApplications hook result', {
    applicationsCount: applications.length,
    isLoading,
    isRefreshing,
    hasError: !!error,
  });

  const { isOpen, applicationToEdit, openModal, openEditModal, closeModal } = useApplicationModal();

  const handleEdit = (application: Application) => {
    console.log('[DIAGNOSTIC] ApplicationsPage handleEdit called', {
      applicationId: application.id,
    });
    openEditModal(application);
  };

  return (
    <div className="space-y-4" data-testid="applications-container">
      {/* Ocultar cabeçalho quando estiver dentro de Settings */}
      {!isInSettings && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Aplicações</h2>
            <p className="text-muted-foreground">Gerencie suas aplicações</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            console.log('[DIAGNOSTIC] ApplicationsPage refresh button clicked');
            refreshApplications();
          }}
          disabled={isLoading || isRefreshing}
          data-testid="applications-page-refresh-button"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Atualizar</span>
        </Button>
        <Button
          onClick={() => {
            console.log('[DIAGNOSTIC] ApplicationsPage add button clicked');
            openModal();
          }}
          className="gap-2"
          data-testid="applications-page-add-button"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Aplicação
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-4 text-destructive"
          data-testid="applications-page-error-alert"
        >
          {error}
        </div>
      )}

      <ApplicationsTable
        applications={applications}
        entities={applications}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={handleEdit}
        onDelete={(id) => {
          console.log('[DIAGNOSTIC] ApplicationsPage onDelete called', { applicationId: id });
          deleteApplication(id);
        }}
        data-testid="applications-table"
      />

      <CreateApplicationModal
        isOpen={isOpen}
        onClose={() => {
          console.log('[DIAGNOSTIC] ApplicationsPage closing CreateApplicationModal');
          closeModal();
        }}
        createApplication={createApplication}
        updateApplication={updateApplication}
        applicationToEdit={applicationToEdit}
        onCreateSuccess={(application) => {
          console.log('[DIAGNOSTIC] ApplicationsPage onCreateSuccess called', {
            applicationId: application.id,
          });
          refreshApplications();
        }}
      />
    </div>
  );
}
