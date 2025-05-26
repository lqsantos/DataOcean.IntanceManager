// components/environments/environments-page.tsx
'use client';

import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { GenericEntityModal } from '@/components/entities/generic-entity-modal';
import { GenericEntityPage } from '@/components/entities/generic-entity-page';
import { useEnvironmentModal } from '@/contexts/modal-manager-context';
import { useEnvironments } from '@/hooks/use-environments';

import { EnvironmentForm } from './environment-form';
import { EnvironmentsTable } from './environments-table';

export function EnvironmentsPage() {
  const { t } = useTranslation(['settings']);

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

  const modalState = useEnvironmentModal();

  // Componente de modal usando nossa abstração genérica
  const EnvironmentModal = (props: any) => (
    <GenericEntityModal
      EntityForm={EnvironmentForm}
      entityName={{
        singular: t('environments.title'),
        createTitle: t('environments.modal.create.title'),
        editTitle: t('environments.modal.edit.title'),
        createDescription: t('environments.description'),
        editDescription: t('environments.description'),
      }}
      createIcon={Layers}
      testId="create-environment-modal"
      {...props}
    />
  );

  return (
    <GenericEntityPage
      entities={environments}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      refreshEntities={refreshEnvironments}
      createEntity={createEnvironment}
      updateEntity={updateEnvironment}
      deleteEntity={deleteEnvironment}
      EntityTable={EnvironmentsTable}
      EntityModal={EnvironmentModal}
      entityName={{
        singular: t('environments.title'),
        plural: t('environments.table.title'),
        description: t('environments.description'),
      }}
      modalState={modalState}
      testIdPrefix="environments"
      tableProps={{
        environments: environments, // Manter compatibilidade com a implementação atual da tabela
      }}
    />
  );
}
