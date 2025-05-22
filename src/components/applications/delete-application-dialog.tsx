// components/applications/delete-application-dialog.tsx
'use client';

import { Trash2 } from 'lucide-react';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { Application } from '@/types/application';

interface DeleteApplicationDialogProps {
  application: Application | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteApplicationDialog({
  application,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteApplicationDialogProps) {
  if (!application) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Excluir Aplicação"
      itemName={application.name}
      description={
        <>
          Tem certeza que deseja excluir a aplicação{' '}
          <span className="font-semibold">{application.name}</span>? Esta ação não pode ser
          desfeita.
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText="Excluir"
      testId="delete-application-dialog"
    />
  );
}
