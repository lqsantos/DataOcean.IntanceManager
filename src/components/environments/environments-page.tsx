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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit: unknown;
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate?: (id: string, data: unknown) => Promise<unknown>;
  onCreateSuccess?: (entity: unknown) => void;
}

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

  // Componente de modal simplificado
  const EnvironmentModal = ({
    isOpen,
    onClose,
    entityToEdit,
    onCreate,
    onUpdate,
    onCreateSuccess,
  }: ModalProps) => (
    <GenericEntityModal
      isOpen={isOpen}
      onClose={onClose}
      entityToEdit={entityToEdit}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCreateSuccess={onCreateSuccess}
      EntityForm={EnvironmentForm}
      entityName={{
        singular: t('environments.title'),
        createTitle: t('environments.modal.create.title'),
        editTitle: t('environments.modal.edit.title'),
        createDescription: t('environments.modal.create.description'),
        editDescription: t('environments.modal.edit.description'),
      }}
      createIcon={Layers}
      editIcon={Layers}
      testId="create-environment-modal"
    />
  );

  return (
    <GenericEntityPage
      entities={environments}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error || null}
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
        environments: environments,
      }}
    />
  );
}
