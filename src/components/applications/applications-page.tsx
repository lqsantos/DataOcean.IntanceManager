// components/applications/applications-page.tsx
'use client';

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useApplicationModal } from '@/contexts/modal-manager-context';
import { useApplications } from '@/hooks/use-applications';
import type { Application } from '@/types/application';

import { ApplicationsTable } from './applications-table';
import { CreateApplicationModal } from './create-application-modal';

export function ApplicationsPage() {
  const {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();

  const { isOpen, applicationToEdit, openModal, openEditModal, closeModal } = useApplicationModal();

  const handleEdit = (application: Application) => {
    openEditModal(application);
  };

  return (
    <div className="space-y-4" data-testid="applications-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Aplicações</h2>
          <p className="text-muted-foreground">Gerencie suas aplicações</p>
        </div>
        <Button onClick={openModal} className="gap-2" data-testid="applications-page-add-button">
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
        onDelete={deleteApplication}
        data-testid="applications-table"
      />

      <CreateApplicationModal
        isOpen={isOpen}
        onClose={closeModal}
        createApplication={createApplication}
        updateApplication={updateApplication}
        applicationToEdit={applicationToEdit}
        onCreateSuccess={refreshApplications}
      />
    </div>
  );
}
