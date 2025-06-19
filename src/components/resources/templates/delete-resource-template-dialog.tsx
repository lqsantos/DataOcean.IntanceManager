'use client';

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

interface DeleteResourceTemplateDialogProps {
  template: Template;
  onDelete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteResourceTemplateDialog({
  template,
  onDelete,
  isOpen,
  onClose,
}: DeleteResourceTemplateDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-template-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Template</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o template{' '}
            <strong className="font-semibold">{template.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Se houver blueprints dependentes deste template, eles
            também serão afetados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-template-cancel-button">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="delete-template-confirm-button"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
