'use client';

import { AlertCircle, BookmarkX, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
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

  // Preparar descrição com aviso adicional para templates com blueprints
  const description = (
    <>
      Tem certeza que deseja excluir o template <span className="font-semibold">{entity.name}</span>
      ?
      {entity.version && (
        <span data-testid={`${dataTestId}-version`}> (versão {entity.version})</span>
      )}
      <br />
      Esta ação não pode ser desfeita.
      {entity.hasBlueprints && (
        <Alert
          variant="destructive"
          className="mt-4"
          data-testid={`${dataTestId}-blueprints-alert`}
        >
          <AlertDescription
            data-testid={`${dataTestId}-blueprints-message`}
            className="flex items-center gap-2"
          >
            <BookmarkX className="h-4 w-4 flex-shrink-0" />
            Este template não pode ser excluído porque está vinculado a um ou mais blueprints.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4" data-testid={`${dataTestId}-error-alert`}>
          <AlertDescription
            data-testid={`${dataTestId}-error-message`}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </AlertDescription>
        </Alert>
      )}
    </>
  );

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Confirmar exclusão"
      description={description}
      onConfirm={handleDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText="Excluir"
      testId={dataTestId}
      // Adicionando data attributes para testes
      {...{
        'data-template-id': entity.id,
        'data-template-name': entity.name,
        'data-has-blueprints': entity.hasBlueprints ? 'true' : 'false',
        'data-state': isDeleting ? 'deleting' : error ? 'error' : 'idle',
      }}
    />
  );
}
