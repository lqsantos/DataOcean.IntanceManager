'use client';

import { Git, Settings } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';
import type { CreateGitSourceDto, GitSource, UpdateGitSourceDto } from '@/types/git-source';

import { GitSourceForm } from './git-source-form';

interface CreateGitSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (gitSource: GitSource) => void;
  createGitSource: (data: CreateGitSourceDto) => Promise<GitSource>;
  updateGitSource?: (id: string, data: UpdateGitSourceDto) => Promise<GitSource>;
  gitSourceToEdit?: GitSource | null;
}

/**
 * Modal para criação e edição de fontes Git.
 * Usa o componente StyledModal para manter o padrão visual consistente.
 */
export function CreateGitSourceModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createGitSource,
  updateGitSource,
  gitSourceToEdit,
}: CreateGitSourceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!gitSourceToEdit;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (values: CreateGitSourceDto | UpdateGitSourceDto) => {
      setIsSubmitting(true);

      try {
        if (isEditMode && gitSourceToEdit && updateGitSource) {
          const updated = await updateGitSource(gitSourceToEdit.id, values);

          toast.success('Fonte Git atualizada com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await createGitSource(values as CreateGitSourceDto);

          toast.success('Fonte Git criada com sucesso');

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
              ? 'Erro ao atualizar fonte Git'
              : 'Erro ao criar fonte Git';

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, gitSourceToEdit, updateGitSource, createGitSource, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditMode ? 'Editar Fonte Git' : 'Nova Fonte Git'}
      description={
        isEditMode
          ? 'Modifique as configurações da fonte Git'
          : 'Configure uma nova fonte de repositórios Git'
      }
      icon={isEditMode ? Settings : Git}
      backgroundIcon={Git}
      testId="create-git-source-modal"
      maxWidth="xl"
      isEditMode={isEditMode}
    >
      <GitSourceForm
        gitSource={gitSourceToEdit || undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </StyledModal>
  );
}
