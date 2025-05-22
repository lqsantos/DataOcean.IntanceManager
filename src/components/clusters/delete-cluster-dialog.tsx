// components/clusters/delete-cluster-dialog.tsx
'use client';

import { AlertCircle, Trash2 } from 'lucide-react';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { Cluster } from '@/types/cluster';

interface DeleteClusterDialogProps {
  cluster: Cluster | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onCancel: () => void;
}

export function DeleteClusterDialog({
  cluster,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteClusterDialogProps) {
  if (!cluster) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Confirmar exclusão"
      description={
        <>
          Tem certeza que deseja excluir o cluster{' '}
          <span className="font-semibold">{cluster.name}</span>?
          {cluster.inUse && (
            <p className="mt-2 flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>Atenção:</strong> Este cluster está em uso e sua exclusão pode afetar
                ambientes existentes.
              </span>
            </p>
          )}
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText="Excluir"
      testId="delete-cluster-dialog"
    />
  );
}
