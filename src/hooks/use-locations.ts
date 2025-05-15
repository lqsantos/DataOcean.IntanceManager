import { useCallback, useEffect, useState } from 'react';

import { LocationService } from '@/services/location-service';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar as localidades
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await LocationService.getAll();

      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Não foi possível carregar as localidades. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para recarregar as localidades
  const refreshLocations = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchLocations();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchLocations]);

  // Carregar localidades na montagem do componente
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Função para criar uma nova localidade
  const createLocation = useCallback(async (data: CreateLocationDto): Promise<Location> => {
    try {
      const newLocation = await LocationService.create(data);

      setLocations((prev) => [...prev, newLocation]);

      return newLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar localidade';

      console.error('Failed to create location:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Função para atualizar uma localidade existente
  const updateLocation = useCallback(
    async (id: string, data: UpdateLocationDto): Promise<Location> => {
      try {
        const updatedLocation = await LocationService.update(id, data);

        setLocations((prev) => prev.map((loc) => (loc.id === id ? updatedLocation : loc)));

        return updatedLocation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar localidade';

        console.error('Failed to update location:', err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Função para excluir uma localidade
  const deleteLocation = useCallback(async (id: string): Promise<void> => {
    try {
      await LocationService.delete(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir localidade';

      console.error('Failed to delete location:', err);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    locations,
    isLoading,
    isRefreshing,
    error,
    refreshLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
