'use client';

import { MapPin } from 'lucide-react';

import { GenericEntityModal } from '@/components/entities/generic-entity-modal';
import { GenericEntityPage } from '@/components/entities/generic-entity-page';
import { useLocationModal } from '@/contexts/modal-manager-context';
import { useLocations } from '@/hooks/use-locations';

import { LocationForm } from './location-form';
import { LocationsTable } from './locations-table';

export function LocationsPage() {
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

  // Componente de modal usando nossa abstração genérica
  const LocationModal = (props: any) => (
    <GenericEntityModal
      EntityForm={LocationForm}
      entityName={{
        singular: 'Localidade',
        createTitle: 'Nova Localidade',
        editTitle: 'Editar Localidade',
        createDescription: 'Configure uma nova localidade para implantação',
        editDescription: 'Modifique as configurações da localidade',
      }}
      createIcon={MapPin}
      testId="create-location-modal"
      {...props}
    />
  );

  return (
    <GenericEntityPage
      entities={locations}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      refreshEntities={refreshLocations}
      createEntity={createLocation}
      updateEntity={updateLocation}
      deleteEntity={deleteLocation}
      EntityTable={LocationsTable}
      EntityModal={LocationModal}
      entityName={{
        singular: 'Localidade',
        plural: 'Localidades',
        description: 'Gerencie suas localidades de implantação',
      }}
      modalState={modalState}
      testIdPrefix="locations"
      tableProps={{
        locations: locations, // Manter compatibilidade com a implementação atual da tabela
      }}
    />
  );
}
