'use client';

import { AppWindow, FileCode } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

import { ApplicationForm } from './application-form';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (application: Application) => void;
  createApplication: (data: CreateApplicationDto) => Promise<Application>;
  updateApplication?: (id: string, data: UpdateApplicationDto) => Promise<Application>;
  applicationToEdit?: Application | null;
}

/**
 * Modal para criação e edição de aplicações.
 * Usa o componente StyledModal para manter o padrão visual consistente.
 */
export function CreateApplicationModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createApplication,
  updateApplication,
  applicationToEdit,
}: CreateApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!applicationToEdit;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (values: CreateApplicationDto | UpdateApplicationDto) => {
      console.log('Form submitted with values:', values);
      setIsSubmitting(true);

      try {
        if (isEditMode && applicationToEdit && updateApplication) {
          const updated = await updateApplication(applicationToEdit.id, values);

          toast.success('Aplicação atualizada com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await createApplication(values as CreateApplicationDto);

          toast.success('Aplicação criada com sucesso');

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
              ? 'Erro ao atualizar aplicação'
              : 'Erro ao criar aplicação';

        toast.error(errorMessage);
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, applicationToEdit, updateApplication, createApplication, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditMode ? 'Editar Aplicação' : 'Nova Aplicação'}
      description={
        isEditMode
          ? 'Modifique as configurações da aplicação'
          : 'Configure uma nova aplicação para implantação'
      }
      icon={isEditMode ? FileCode : AppWindow}
      backgroundIcon={AppWindow}
      testId="create-application-modal"
      maxWidth="xl"
      isEditMode={isEditMode}
      // Impedir fechamento do modal quando o formulário for submetido
      preventClose={true}
    >
      <ApplicationForm
        application={applicationToEdit || undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </StyledModal>
  );
}
