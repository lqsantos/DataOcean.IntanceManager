'use client';

import { EntityPage } from '@/components/ui/entity-page';
import { useLocations } from '@/hooks/use-locations';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

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

  return (
    <div data-testid="locations-page-container">
      <EntityPage<Location, CreateLocationDto, UpdateLocationDto>
        entities={locations}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshLocations}
        createEntity={createLocation}
        updateEntity={updateLocation}
        deleteEntity={deleteLocation}
        EntityTable={LocationsTable}
        EntityForm={LocationForm}
        entityName={{
          singular: 'Localidade',
          plural: 'Localidades',
          description: 'Gerencie suas localidades de implantação',
        }}
        testIdPrefix="locations"
        tableProps={{
          locations,
          'data-testid': 'locations-table',
        }}
        formProps={{
          'data-testid': 'location-form',
          'data-edit': 'true',
        }}
        entityPropName="location"
      />
    </div>
  );
}
