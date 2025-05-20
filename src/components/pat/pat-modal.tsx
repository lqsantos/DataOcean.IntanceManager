'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePATModal } from '@/contexts/pat-modal-context';
import { PATService } from '@/services/pat-service';

// Schema para validação do token
const patFormSchema = z.object({
  token: z
    .string()
    .min(8, 'O token deve ter pelo menos 8 caracteres')
    .max(100, 'O token deve ter no máximo 100 caracteres'),
});

type PatFormValues = z.infer<typeof patFormSchema>;

export function PATModal() {
  const { isOpen, close, onConfigured, status } = usePATModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuração do formulário com valores padrão
  const form = useForm<PatFormValues>({
    resolver: zodResolver(patFormSchema),
    defaultValues: {
      token: '',
    },
  });

  // Resetar erros ao abrir o modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      form.reset();
      setError(null);
      setShowToken(false);
    }
  };

  const handleSubmit = async (data: PatFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Usar o serviço PAT para configurar ou atualizar o token
      if (status.configured) {
        // Get the token ID first - use the default ID '1' for now if no ID is available
        const tokenId = status.id || '1';

        await PATService.updateToken(tokenId, data);
        toast.success('Token atualizado com sucesso!');
      } else {
        await PATService.createToken(data);
        toast.success('Token configurado com sucesso!');
      }

      // Callback para informar que o token foi configurado
      if (onConfigured) {
        onConfigured();
      }

      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar a solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Foco automático no campo de entrada quando o modal é aberto
  const handleDialogOpen = () => {
    setTimeout(() => {
      const inputElement = document.querySelector('input[name="token"]');

      if (inputElement instanceof HTMLInputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="pat-modal"
        onOpenAutoFocus={handleDialogOpen}
      >
        <DialogHeader data-testid="pat-modal-header">
          <DialogTitle data-testid="pat-modal-title">
            {status.configured ? 'Atualizar Token de Acesso' : 'Configurar Token de Acesso'}
          </DialogTitle>
          <DialogDescription data-testid="pat-modal-description">
            {status.configured
              ? 'Insira um novo token para substituir o atual.'
              : 'Insira seu token de acesso pessoal para interagir com as APIs.'}
            {status.configured && status.lastUpdated && (
              <p
                className="mt-2 text-xs text-muted-foreground"
                data-testid="pat-modal-last-updated"
              >
                Última atualização: {new Date(status.lastUpdated).toLocaleString()}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" data-testid="pat-modal-error">
            <AlertDescription data-testid="pat-modal-error-message">{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            data-testid="pat-form"
          >
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem data-testid="pat-form-item">
                  <FormLabel data-testid="pat-form-label">Token de Acesso</FormLabel>
                  <FormControl>
                    <div className="flex" data-testid="pat-form-field-container">
                      <div className="relative flex-grow">
                        <Input
                          autoFocus
                          type={showToken ? 'text' : 'password'}
                          placeholder="Digite seu token"
                          {...field}
                          data-testid="pat-form-token"
                          className="pr-10"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowToken(!showToken)}
                          data-testid="pat-form-toggle-visibility"
                          aria-label={showToken ? 'Esconder token' : 'Mostrar token'}
                          disabled={isSubmitting}
                        >
                          {showToken ? (
                            <EyeOffIcon className="h-4 w-4" data-testid="pat-eye-off-icon" />
                          ) : (
                            <EyeIcon className="h-4 w-4" data-testid="pat-eye-icon" />
                          )}
                          <span className="sr-only">
                            {showToken ? 'Esconder token' : 'Mostrar token'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage data-testid="pat-form-error-message" />
                </FormItem>
              )}
            />

            <DialogFooter data-testid="pat-modal-footer">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={isSubmitting}
                data-testid="pat-form-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="pat-form-submit"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-testid="pat-form-loading-spinner"
                    />
                    <span data-testid="pat-form-submit-text">
                      {status.configured ? 'Atualizando...' : 'Configurando...'}
                    </span>
                  </>
                ) : (
                  <span data-testid="pat-form-submit-text">
                    {status.configured ? 'Atualizar' : 'Configurar'}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
