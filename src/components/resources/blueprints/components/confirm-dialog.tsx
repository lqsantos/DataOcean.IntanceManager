'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  /** Dialog is open or closed */
  open: boolean;
  /** Function to control open state */
  onOpenChange: (open: boolean) => void;
  /** Confirm action */
  onConfirm: () => void;
  /** Cancel action */
  onCancel?: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Is destructive action */
  destructive?: boolean;
}

/**
 * Reusable confirmation dialog
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);

    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="blueprint-confirm-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="confirm-dialog-cancel-button"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            data-testid="confirm-dialog-confirm-button"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
