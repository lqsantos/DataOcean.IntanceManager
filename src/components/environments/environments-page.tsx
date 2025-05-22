// components/environments/environments-page.tsx
'use client';

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useEnvironmentModal } from '@/contexts/modal-manager-context';
import { useEnvironments } from '@/hooks/use-environments';
import type { Environment } from '@/types/environment';

import { CreateEnvironmentModal } from './create-environment-modal';
import { EnvironmentsTable } from './environments-table';

export function EnvironmentsPage() {
  const {
    environments,
    isLoading,
    isRefreshing,
    error,
    refreshEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useEnvironments();

  const { isOpen, environmentToEdit, openModal, openEditModal, closeModal } = useEnvironmentModal();

  const handleEdit = (environment: Environment) => {
    openEditModal(environment);
  };

  return (
    <div className="space-y-4" data-testid="environments-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Ambientes</h2>
          <p className="text-muted-foreground">Gerencie seus ambientes de implantação</p>
        </div>
        <Button onClick={openModal} className="gap-2" data-testid="environments-page-add-button">
          <PlusCircle className="h-4 w-4" />
          Adicionar Ambiente
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-4 text-destructive"
          data-testid="environments-page-error-alert"
        >
          {error}
        </div>
      )}

      <EnvironmentsTable
        environments={environments}
        entities={environments}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={handleEdit}
        onDelete={deleteEnvironment}
        data-testid="environments-table"
      />

      <CreateEnvironmentModal
        isOpen={isOpen}
        onClose={closeModal}
        createEnvironment={createEnvironment}
        updateEnvironment={updateEnvironment}
        environmentToEdit={environmentToEdit}
        onCreateSuccess={refreshEnvironments}
      />
    </div>
  );
}
