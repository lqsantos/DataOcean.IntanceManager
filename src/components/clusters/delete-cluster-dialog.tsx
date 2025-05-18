// components/clusters/delete-cluster-dialog.tsx
'use client';

import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent data-testid="delete-cluster-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o cluster <strong>{cluster.name}</strong>?
            {cluster.inUse && (
              <p className="mt-2 text-destructive">
                <strong>Atenção:</strong> Este cluster está em uso e sua exclusão pode afetar
                ambientes existentes.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="delete-cluster-dialog-cancel"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            <Button
              variant="destructive"
              disabled={isDeleting}
              data-testid="delete-cluster-dialog-confirm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
