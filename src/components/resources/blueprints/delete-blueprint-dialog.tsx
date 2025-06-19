'use client';

import { useTranslation } from 'react-i18next';

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

interface DeleteBlueprintDialogProps {
  blueprintId: string;
  blueprintName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteBlueprintDialog({
  blueprintId,
  blueprintName,
  isOpen,
  onClose,
  onDelete,
}: DeleteBlueprintDialogProps) {
  const { t } = useTranslation('blueprints');

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent data-testid={`delete-blueprint-dialog-${blueprintId}`}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteBlueprint.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            <div
              dangerouslySetInnerHTML={{
                __html: t('deleteBlueprint.description', { name: blueprintName }),
              }}
            />
            <br />
            <br />
            {t('deleteBlueprint.warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-blueprint-cancel-button">
            {t('deleteBlueprint.buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="delete-blueprint-confirm-button"
          >
            {t('deleteBlueprint.buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
