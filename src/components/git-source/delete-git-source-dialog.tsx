'use client';

import { Trash2 } from 'lucide-react';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { GitSource } from '@/types/git-source';

interface DeleteGitSourceDialogProps {
  gitSource: GitSource | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

export function DeleteGitSourceDialog({
  gitSource,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteGitSourceDialogProps) {
  if (!gitSource) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Excluir Fonte Git"
      description={
        <>
          Tem certeza que deseja excluir a fonte Git{' '}
          <span className="font-semibold">{gitSource.name}</span>?
          <br />
          <span className="mt-2 block text-sm text-muted-foreground">
            Esta ação é irreversível e irá remover todos os dados associados.
          </span>
        </>
      }
      onConfirm={() => onDelete(gitSource.id)}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText="Excluir"
      testId="delete-git-source-dialog"
    />
  );
}
