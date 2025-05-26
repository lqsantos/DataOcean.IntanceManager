'use client';

import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { GenericEntityModal } from '@/components/entities/generic-entity-modal';
import { GenericEntityPage } from '@/components/entities/generic-entity-page';
import { useLocationModal } from '@/contexts/modal-manager-context';
import { useLocations } from '@/hooks/use-locations';

import { LocationForm } from './location-form';
import { LocationsTable } from './locations-table';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit: unknown;
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate?: (id: string, data: unknown) => Promise<unknown>;
  onCreateSuccess?: (entity: unknown) => void;
}

export function LocationsPage() {
  const { t } = useTranslation(['settings']);
  const {
    locations,
    isLoading,
    isRefreshing,
    error,
    refreshLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useLocations();

  const modalState = useLocationModal();

  // Componente de modal simplificado
  const LocationModal = ({
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
      EntityForm={LocationForm}
      entityName={{
        singular: t('locations.title'),
        createTitle: t('locations.modal.create.title'),
        editTitle: t('locations.modal.edit.title'),
        createDescription: t('locations.modal.create.description'),
        editDescription: t('locations.modal.edit.description'),
      }}
      createIcon={MapPin}
      editIcon={MapPin}
      testId="create-location-modal"
    />
  );

  return (
    <GenericEntityPage
      entities={locations}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error || null}
      refreshEntities={refreshLocations}
      createEntity={createLocation}
      updateEntity={updateLocation}
      deleteEntity={deleteLocation}
      EntityTable={LocationsTable}
      EntityModal={LocationModal}
      entityName={{
        singular: t('locations.title'),
        plural: t('locations.table.title'),
        description: t('locations.description'),
      }}
      modalState={modalState}
      testIdPrefix="locations"
      tableProps={{
        locations: locations,
      }}
    />
  );
}
