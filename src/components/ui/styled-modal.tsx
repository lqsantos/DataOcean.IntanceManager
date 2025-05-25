'use client';

import { AlertCircle, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StyledModalProps {
  /**
   * Controla se o modal está aberto
   */
  open: boolean;
  /**
   * Callback para quando o estado do modal muda
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Título do modal
   */
  title: string;
  /**
   * Subtítulo/descrição do modal
   */
  description?: string | React.ReactNode;
  /**
   * Ícone principal para o cabeçalho do modal
   * Se não for fornecido, um ícone padrão será usado
   */
  icon?: LucideIcon;
  /**
   * Ícone decorativo para o fundo do modal
   */
  backgroundIcon?: LucideIcon;
  /**
   * Identificador para testes
   */
  testId?: string;
  /**
   * Conteúdo do modal
   */
  children: React.ReactNode;
  /**
   * Largura máxima do modal - padrão é "2xl" (42rem)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  /**
   * Se true, usa o ícone colorido para o modo de edição
   */
  isEditMode?: boolean;
  /**
   * Propriedades adicionais que serão passadas para o DialogContent
   */
  dialogProps?: React.ComponentPropsWithoutRef<typeof DialogContent>;
  /**
   * Se true, impede o fechamento do modal quando clicado fora
   */
  preventClose?: boolean;
}

/**
 * Modal estilizado que implementa o padrão visual comum do projeto
 * com cabeçalho gradiente e decoração consistente.
 */
export function StyledModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  backgroundIcon,
  testId,
  children,
  maxWidth = '2xl',
  isEditMode = false,
  dialogProps,
  preventClose = false,
}: StyledModalProps) {
  console.log('[DIAGNOSTIC] StyledModal rendered', { open, title, preventClose });

  // Use o ícone fornecido ou um ícone padrão se não for fornecido
  const IconComponent = icon || AlertCircle;
  const BackgroundIconComponent = backgroundIcon;

  // Memoizando classes para evitar recálculos
  const dialogContentClasses = useMemo(() => {
    const widthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      full: 'max-w-[95vw]',
    };

    return cn(
      'w-[90vw]',
      widthMap[maxWidth],
      'overflow-visible p-0',
      'rounded-lg border border-border',
      'shadow-lg',
      'duration-200 animate-in fade-in-0 zoom-in-95'
    );
  }, [maxWidth]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        console.log('[DIAGNOSTIC] Dialog onOpenChange called', { current: open, new: value });

        // Se estiver tentando fechar (value = false) mas preventClose for true, não fazer nada
        if (!value && preventClose) {
          console.log('[DIAGNOSTIC] Preventing dialog close due to preventClose=true');
          return;
        }

        // Caso contrário, propagar o evento
        onOpenChange(value);
      }}
    >
      <DialogContent
        className={dialogContentClasses}
        data-testid={testId}
        data-modal-title={title}
        data-modal-type={isEditMode ? 'edit' : 'create'}
        onPointerDownOutside={(e) => {
          console.log('[DIAGNOSTIC] DialogContent onPointerDownOutside');
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          console.log('[DIAGNOSTIC] DialogContent onInteractOutside');
          e.preventDefault();
        }}
        // Remover qualquer tratamento especial para eventos de teclado para prevenir interferência
        onEscapeKeyDown={(e) => {
          console.log('[DIAGNOSTIC] DialogContent onEscapeKeyDown');
          if (preventClose) {
            e.preventDefault();
          }
        }}
        {...dialogProps}
      >
        {/* Cabeçalho com gradiente e decoração */}
        <div className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5"
            aria-hidden="true"
          />
          <div className="relative p-5">
            <DialogHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <IconComponent
                  className={`h-4 w-4 ${isEditMode ? 'text-indigo-500' : 'text-primary'}`}
                  data-testid={`${testId}-icon`}
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-medium" data-testid={`${testId}-title`}>
                  {title}
                </DialogTitle>
                {description && (
                  <p
                    className="mt-0.5 text-sm text-muted-foreground"
                    data-testid={`${testId}-description`}
                    id={`${testId}-description`}
                  >
                    {description}
                  </p>
                )}
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Conteúdo do formulário com elementos decorativos */}
        <div
          className="relative px-6 py-3"
          data-testid={`${testId}-content`}
          onClick={(e) => {
            // Evitar propagação de eventos para os elementos pai que podem estar interferindo
            e.stopPropagation();
          }}
        >
          {/* Ícone decorativo no canto */}
          {BackgroundIconComponent && (
            <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-5">
              <BackgroundIconComponent className="h-24 w-24 text-primary" />
            </div>
          )}

          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
