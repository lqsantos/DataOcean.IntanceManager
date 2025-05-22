'use client';

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocationModal } from '@/contexts/modal-manager-context';
import { useLocations } from '@/hooks/use-locations';
import type { Location } from '@/types/location';

import { CreateLocationModal } from './create-location-modal';
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
  
  const { isOpen, locationToEdit, openModal, openEditModal, closeModal } = useLocationModal();

  const handleEdit = (location: Location) => {
    openEditModal(location);
  };

  return (
    <div className="space-y-4" data-testid="locations-page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Localidades</h2>
          <p className="text-muted-foreground">Gerencie suas localidades de implantação</p>
        </div>
        <Button 
          onClick={openModal} 
          className="gap-2"
          data-testid="locations-page-add-button"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Localidade
        </Button>
      </div>
      
      {error && (
        <div 
          className="rounded-md bg-destructive/10 p-4 text-destructive" 
          data-testid="locations-page-error-alert"
        >
          {error}
        </div>
      )}
      
      <LocationsTable
        locations={locations}
        entities={locations}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={handleEdit}
        onDelete={deleteLocation}
        data-testid="locations-table"
      />
      
      <CreateLocationModal
        isOpen={isOpen}
        onClose={closeModal}
        createLocation={createLocation}
        updateLocation={updateLocation}
        locationToEdit={locationToEdit}
        onCreateSuccess={refreshLocations}
      />
    </div>
  );
}
