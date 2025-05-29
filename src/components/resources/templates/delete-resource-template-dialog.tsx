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
  const { t } = useTranslation('templates');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-template-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTemplate.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            <div
              dangerouslySetInnerHTML={{
                __html: t('deleteTemplate.description', { name: template.name }),
              }}
            />
            <br />
            <br />
            {t('deleteTemplate.warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-template-cancel-button">
            {t('deleteTemplate.buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="delete-template-confirm-button"
          >
            {t('deleteTemplate.buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
