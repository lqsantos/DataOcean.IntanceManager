'use client';

import { Globe, Layers } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

import { EnvironmentForm } from './environment-form';

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (environment: Environment) => void;
  createEnvironment: (data: CreateEnvironmentDto) => Promise<Environment>;
  updateEnvironment?: (id: string, data: UpdateEnvironmentDto) => Promise<Environment>;
  environmentToEdit?: Environment | null;
}

/**
 * Modal para criação e edição de ambientes.
 * Usa o componente StyledModal para manter o padrão visual consistente.
 */
export function CreateEnvironmentModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createEnvironment,
  updateEnvironment,
  environmentToEdit,
}: CreateEnvironmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!environmentToEdit;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (values: CreateEnvironmentDto | UpdateEnvironmentDto) => {
      setIsSubmitting(true);

      try {
        if (isEditMode && environmentToEdit && updateEnvironment) {
          const updated = await updateEnvironment(environmentToEdit.id, values);

          toast.success('Ambiente atualizado com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await createEnvironment(values as CreateEnvironmentDto);

          toast.success('Ambiente criado com sucesso');

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
              ? 'Erro ao atualizar ambiente'
              : 'Erro ao criar ambiente';

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, environmentToEdit, updateEnvironment, createEnvironment, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditMode ? 'Editar Ambiente' : 'Novo Ambiente'}
      description={
        isEditMode
          ? 'Modifique as configurações do ambiente'
          : 'Configure um novo ambiente para aplicações'
      }
      icon={isEditMode ? Layers : Globe}
      backgroundIcon={Globe}
      testId="create-environment-modal"
      maxWidth="xl"
      isEditMode={isEditMode}
    >
      <EnvironmentForm
        environment={environmentToEdit || undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </StyledModal>
  );
}
