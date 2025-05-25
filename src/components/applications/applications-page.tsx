// components/applications/applications-page.tsx
'use client';

import { AppWindow } from 'lucide-react';

import { GenericEntityModal } from '@/components/entities/generic-entity-modal';
import { GenericEntityPage } from '@/components/entities/generic-entity-page';
import { useApplicationModal } from '@/contexts/modal-manager-context';
import { useApplications } from '@/hooks/use-applications';

import { ApplicationForm } from './application-form';
import { ApplicationsTable } from './applications-table';

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

  const modalState = useApplicationModal();

  // Componente de modal usando nossa abstração genérica
  const ApplicationModal = (props: any) => (
    <GenericEntityModal
      EntityForm={ApplicationForm}
      entityName={{
        singular: 'Aplicação',
        createTitle: 'Nova Aplicação',
        editTitle: 'Editar Aplicação',
        createDescription: 'Configure uma nova aplicação para implantação',
        editDescription: 'Modifique as configurações da aplicação',
      }}
      createIcon={AppWindow}
      testId="create-application-modal"
      {...props}
    />
  );

  return (
    <GenericEntityPage
      entities={applications}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      refreshEntities={refreshApplications}
      createEntity={createApplication}
      updateEntity={updateApplication}
      deleteEntity={deleteApplication}
      EntityTable={ApplicationsTable}
      EntityModal={ApplicationModal}
      entityName={{
        singular: 'Aplicação',
        plural: 'Aplicações',
        description: 'Gerencie suas aplicações',
      }}
      modalState={modalState}
      testIdPrefix="applications"
      tableProps={{
        applications: applications, // Manter compatibilidade com a implementação atual da tabela
      }}
    />
  );
}
