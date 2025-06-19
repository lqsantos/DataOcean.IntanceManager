'use client';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { Location } from '@/types/location';

interface DeleteLocationDialogProps {
  entity: Location | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteLocationDialog({
  entity,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteLocationDialogProps) {
  const { t } = useTranslation('settings');

  if (!entity) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title={t('locations.modal.delete.title')}
      itemName={entity.name}
      description={
        <>
          {t('locations.modal.delete.confirmation')}{' '}
          <span className="font-semibold" data-testid="delete-location-dialog-name">
            {entity.name}
          </span>
          ?
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      confirmText={t('locations.modal.delete.button')}
      testId="delete-location-dialog"
    />
  );
}
