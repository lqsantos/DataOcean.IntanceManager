import { Trash2 } from 'lucide-react';

import { StyledDeleteDialog } from '@/components/ui/styled-delete-dialog';
import type { Location } from '@/types/location';

interface DeleteLocationDialogProps {
  location: Location | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteLocationDialog({
  location,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteLocationDialogProps) {
  if (!location) {
    return null;
  }

  return (
    <StyledDeleteDialog
      open={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      title="Excluir Localidade"
      itemName={location.name}
      description={
        <>
          Tem certeza que deseja excluir a localidade{' '}
          <span className="font-semibold" data-testid="delete-location-dialog-name">
            {location.name}
          </span>
          ? Esta ação não pode ser desfeita.
        </>
      }
      onConfirm={onDelete}
      onCancel={onCancel}
      isDeleting={isDeleting}
      icon={Trash2}
      testId="delete-location-dialog"
    />
  );
}
