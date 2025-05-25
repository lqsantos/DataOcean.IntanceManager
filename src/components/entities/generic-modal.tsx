'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function GenericModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
}: GenericModalProps) {
  // Impede o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-lg"
        // Prevenir comportamento padrão para garantir que eventos do formulário funcionem corretamente
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </DialogHeader>

        <div className="py-4">{children}</div>

        {footer ? (
          footer
        ) : onSubmit ? (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting} type="submit" form="settings-form">
              {isSubmitting ? 'Salvando...' : submitLabel}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
