'use client';

import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StyledDeleteDialogProps {
  /**
   * Controla se o diálogo está aberto
   */
  open: boolean;
  /**
   * Callback para quando o estado do diálogo muda
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Título do diálogo
   */
  title: string;
  /**
   * Nome do item a ser excluído
   */
  itemName?: string;
  /**
   * Texto personalizado para a confirmação
   */
  confirmText?: string;
  /**
   * Callback para confirmar exclusão
   */
  onConfirm: () => void;
  /**
   * Callback para cancelar exclusão
   */
  onCancel: () => void;
  /**
   * Se está em processo de exclusão
   */
  isDeleting?: boolean;
  /**
   * Ícone personalizado (padrão é AlertTriangle)
   */
  icon?: LucideIcon;
  /**
   * Texto de descrição/aviso personalizado
   */
  description?: React.ReactNode;
  /**
   * Identificador para testes
   */
  testId?: string;
}

/**
 * Diálogo de exclusão estilizado que implementa o padrão visual comum do projeto.
 */
export function StyledDeleteDialog({
  open,
  onOpenChange,
  title,
  itemName,
  confirmText,
  onConfirm,
  onCancel,
  isDeleting = false,
  icon: Icon = AlertTriangle,
  description,
  testId,
}: StyledDeleteDialogProps) {
  const dialogContentClasses = useMemo(
    () =>
      cn(
        'w-[90vw] max-w-sm',
        'overflow-visible p-0',
        'rounded-lg border border-border',
        'shadow-lg',
        'duration-200 animate-in fade-in-0 zoom-in-95'
      ),
    []
  );

  // Texto padrão de confirmação se não for especificado
  const defaultDescription = (
    <>
      Esta ação não pode ser desfeita.
      {itemName && <span className="font-medium"> {itemName}</span>} será excluído permanentemente.
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={dialogContentClasses} data-testid={testId}>
        {/* Cabeçalho com gradiente e decoração */}
        <div className="relative overflow-hidden border-b border-border">
          {/* Decoração de fundo */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-destructive/5"
            aria-hidden="true"
          />
          <div className="relative p-5">
            <DialogHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10 shadow-sm">
                {Icon && <Icon className="h-4 w-4 text-destructive" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Conteúdo do diálogo com aviso */}
        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground">{description || defaultDescription}</p>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              data-testid={`${testId}-cancel`}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              data-testid={`${testId}-confirm`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                confirmText || 'Excluir'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
