'use client';

import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (data: CreateLocationDto | UpdateLocationDto) => {
    setIsSubmitting(true);

    try {
      await createLocation(data as CreateLocationDto);
      setIsCreateDialogOpen(false);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: UpdateLocationDto) => {
    if (!locationToEdit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateLocation(locationToEdit.id, data);
      setLocationToEdit(null);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in" data-testid="locations-page-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="locations-page-title">
            Localidades
          </h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas localidades de implantação</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshLocations}
            disabled={isRefreshing || isLoading}
            data-testid="locations-page-refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="locations-page-add-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Localidade
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" data-testid="locations-page-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription data-testid="locations-page-error-message">{error}</AlertDescription>
        </Alert>
      )}

      <Card data-testid="locations-page-card">
        <CardHeader>
          <CardTitle>Localidades</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationsTable
            locations={locations}
            isLoading={isLoading}
            _isRefreshing={isRefreshing}
            onEdit={setLocationToEdit}
            onDelete={deleteLocation}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="locations-page-create-dialog">
          <DialogHeader>
            <DialogTitle>Criar Localidade</DialogTitle>
          </DialogHeader>
          <LocationForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!locationToEdit} onOpenChange={(open) => !open && setLocationToEdit(null)}>
        <DialogContent className="sm:max-w-[500px]" data-testid="locations-page-edit-dialog">
          <DialogHeader>
            <DialogTitle>Editar Localidade</DialogTitle>
          </DialogHeader>
          {locationToEdit && (
            <LocationForm
              location={locationToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => setLocationToEdit(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
