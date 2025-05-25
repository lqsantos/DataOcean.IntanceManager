'use client';

import { FileCode, MapPin } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

import { LocationForm } from './location-form';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (location: Location) => void;
  createLocation: (data: CreateLocationDto) => Promise<Location>;
  updateLocation?: (id: string, data: UpdateLocationDto) => Promise<Location>;
  locationToEdit?: Location | null;
}

/**
 * Modal para criação e edição de localidades.
 * Usa o componente StyledModal para manter o padrão visual consistente.
 */
export function CreateLocationModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createLocation,
  updateLocation,
  locationToEdit,
}: CreateLocationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!locationToEdit;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (values: CreateLocationDto | UpdateLocationDto) => {
      console.log('Location form submitted with values:', values);
      setIsSubmitting(true);

      try {
        if (isEditMode && locationToEdit && updateLocation) {
          const updated = await updateLocation(locationToEdit.id, values);

          toast.success('Localidade atualizada com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await createLocation(values as CreateLocationDto);

          toast.success('Localidade criada com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(created);
          }
        }
        onClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : isEditMode
              ? 'Erro ao atualizar localidade'
              : 'Erro ao criar localidade';

        toast.error(errorMessage);
        console.error('Error submitting location form:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, locationToEdit, updateLocation, createLocation, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditMode ? 'Editar Localidade' : 'Nova Localidade'}
      description={
        isEditMode
          ? 'Modifique as configurações da localidade'
          : 'Configure uma nova localidade para implantação'
      }
      icon={isEditMode ? FileCode : MapPin}
      backgroundIcon={MapPin}
      testId="create-location-modal"
      maxWidth="xl"
      isEditMode={isEditMode}
      preventClose={true}
    >
      <LocationForm
        location={locationToEdit || undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </StyledModal>
  );
}
