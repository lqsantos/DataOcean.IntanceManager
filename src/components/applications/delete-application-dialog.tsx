// components/applications/delete-application-dialog.tsx
'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent data-testid="delete-application-dialog">
        <DialogHeader>
          <DialogTitle>Excluir Aplicação</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a aplicação <strong>{application.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="delete-application-cancel-button"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            data-testid="delete-application-confirm-button"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
