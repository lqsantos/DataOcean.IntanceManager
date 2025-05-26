// components/applications/delete-application-dialog.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('settings');

  if (!application) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title={t('applications.modal.delete.title')}
      itemName={application.name}
      description={
        <>
          {t('applications.modal.delete.confirmation')}{' '}
          <span className="font-semibold">{application.name}</span>?
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText={t('applications.modal.delete.button')}
      testId="delete-application-dialog"
    />
  );
}
