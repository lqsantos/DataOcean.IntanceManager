// components/applications/applications-page.tsx
'use client';

import { AppWindow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { GenericEntityModal } from '@/components/entities/generic-entity-modal';
import { GenericEntityPage } from '@/components/entities/generic-entity-page';
import { useApplicationModal } from '@/contexts/modal-manager-context';
import { useApplications } from '@/hooks/use-applications';

import { ApplicationForm } from './application-form';
import { ApplicationsTable } from './applications-table';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit: unknown;
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate?: (id: string, data: unknown) => Promise<unknown>;
  onCreateSuccess?: (entity: unknown) => void;
}

export function ApplicationsPage() {
  const { t } = useTranslation(['settings']);
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

  // Componente de modal simplificado
  const ApplicationModal = ({
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
      EntityForm={ApplicationForm}
      entityName={{
        singular: t('applications.title'),
        createTitle: t('applications.modal.create.title'),
        editTitle: t('applications.modal.edit.title'),
        createDescription: t('applications.modal.create.description'),
        editDescription: t('applications.modal.edit.description'),
      }}
      createIcon={AppWindow}
      editIcon={AppWindow}
      testId="create-application-modal"
    />
  );

  return (
    <GenericEntityPage
      entities={applications}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error || null}
      refreshEntities={refreshApplications}
      createEntity={createApplication}
      updateEntity={updateApplication}
      deleteEntity={deleteApplication}
      EntityTable={ApplicationsTable}
      EntityModal={ApplicationModal}
      entityName={{
        singular: t('applications.title'),
        plural: t('applications.table.title'),
        description: t('applications.description'),
      }}
      modalState={modalState}
      testIdPrefix="applications"
      tableProps={{
        applications: applications,
      }}
    />
  );
}
