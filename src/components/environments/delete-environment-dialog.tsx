// components/environments/delete-environment-dialog.tsx
import { Trash2 } from 'lucide-react';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { Environment } from '@/types/environment';

interface DeleteEnvironmentDialogProps {
  environment: Environment | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteEnvironmentDialog({
  environment,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteEnvironmentDialogProps) {
  if (!environment) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Excluir Ambiente"
      itemName={environment.name}
      description={
        <>
          Tem certeza que deseja excluir o ambiente{' '}
          <span className="font-semibold">{environment.name}</span>? Esta ação não pode ser desfeita
          e pode afetar instâncias implantadas neste ambiente.
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText="Excluir"
      testId="delete-environment-dialog"
    />
  );
}
