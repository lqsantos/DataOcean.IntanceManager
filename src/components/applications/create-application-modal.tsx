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
  console.log('[DIAGNOSTIC] CreateApplicationModal rendered', {
    isOpen,
    hasApplicationToEdit: !!applicationToEdit,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!applicationToEdit;

  // Handler para submissão do formulário - simplificado e direto
  const handleSubmit = useCallback(
    async (data: CreateApplicationDto | UpdateApplicationDto) => {
      console.log('[DIAGNOSTIC] CreateApplicationModal.handleSubmit called with data:', data);
      setIsSubmitting(true);

      try {
        if (isEditMode && applicationToEdit && updateApplication) {
          console.log('[DIAGNOSTIC] Updating application:', applicationToEdit.id);
          const updated = await updateApplication(applicationToEdit.id, data);

          console.log('[DIAGNOSTIC] Application updated successfully:', updated);
          toast.success('Aplicação atualizada com sucesso');

          if (onCreateSuccess) {
            console.log('[DIAGNOSTIC] Calling onCreateSuccess after update');
            onCreateSuccess(updated);
          }
        } else {
          console.log('[DIAGNOSTIC] Creating new application');
          const created = await createApplication(data as CreateApplicationDto);

          console.log('[DIAGNOSTIC] Application created successfully:', created);
          toast.success('Aplicação criada com sucesso');

          if (onCreateSuccess) {
            console.log('[DIAGNOSTIC] Calling onCreateSuccess after creation');
            onCreateSuccess(created);
          }
        }

        console.log('[DIAGNOSTIC] Closing modal after success');
        onClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : isEditMode
              ? 'Erro ao atualizar aplicação'
              : 'Erro ao criar aplicação';

        console.error('[DIAGNOSTIC] Error in CreateApplicationModal.handleSubmit:', error);
        toast.error(errorMessage);
      } finally {
        console.log('[DIAGNOSTIC] Setting isSubmitting to false');
        setIsSubmitting(false);
      }
    },
    [isEditMode, applicationToEdit, updateApplication, createApplication, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => {
        console.log('[DIAGNOSTIC] StyledModal onOpenChange called:', open);

        // Só fechar o modal quando o open for false (modal fechando)
        if (!open) {
          onClose();
        }
      }}
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
      // Permitir interação com o formulário mesmo ao clicar fora
      preventClose={isSubmitting}
    >
      <div
        onClick={(e) => {
          // Prevenir propagação de cliques no conteúdo do modal para não fechar acidentalmente
          e.stopPropagation();
        }}
      >
        <ApplicationForm
          application={applicationToEdit || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            console.log('[DIAGNOSTIC] ApplicationForm.onCancel called');

            // Não fechar o modal se estiver submetendo
            if (!isSubmitting) {
              onClose();
            }
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </StyledModal>
  );
}
