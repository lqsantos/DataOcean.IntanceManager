// components/environments/delete-environment-dialog.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('settings');

  if (!environment) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title={t('environments.modal.delete.title')}
      itemName={environment.name}
      description={
        <>
          {t('environments.modal.delete.confirmation')}{' '}
          <span className="font-semibold">{environment.name}</span>?
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText={t('environments.modal.delete.button')}
      testId="delete-environment-dialog"
    />
  );
}
