'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { Template } from '@/types/template';

interface DeleteTemplateDialogProps {
  entity: Template | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  'data-testid'?: string;
}

export function DeleteTemplateDialog({
  entity,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
  'data-testid': dataTestId = 'delete-template-dialog',
}: DeleteTemplateDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Reset error when dialog opens/closes
  if (!isOpen && error) {
    setError(null);
  }

  const handleDelete = async () => {
    try {
      setError(null);
      await onDelete();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao excluir o template. Tente novamente.'
      );
    }
  };

  if (!entity) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent
        data-testid={dataTestId}
        data-template-id={entity.id}
        data-template-name={entity.name}
        data-has-blueprints={entity.hasBlueprints ? 'true' : 'false'}
        data-state={isDeleting ? 'deleting' : error ? 'error' : 'idle'}
      >
        <AlertDialogHeader>
          <AlertDialogTitle data-testid={`${dataTestId}-title`}>
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription data-testid={`${dataTestId}-description`}>
            Tem certeza que deseja excluir o template <strong>{entity.name}</strong>?
            {entity.version && (
              <span data-testid={`${dataTestId}-version`}> (versão {entity.version})</span>
            )}
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {entity.hasBlueprints && (
          <Alert
            variant="destructive"
            className="mt-4"
            data-testid={`${dataTestId}-blueprints-alert`}
          >
            <AlertDescription data-testid={`${dataTestId}-blueprints-message`}>
              Este template não pode ser excluído porque está vinculado a um ou mais blueprints.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4" data-testid={`${dataTestId}-error-alert`}>
            <AlertDescription data-testid={`${dataTestId}-error-message`}>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isDeleting}
            data-testid={`${dataTestId}-cancel-button`}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || entity.hasBlueprints}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid={`${dataTestId}-confirm-button`}
          >
            {isDeleting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  data-testid={`${dataTestId}-loading-icon`}
                />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
