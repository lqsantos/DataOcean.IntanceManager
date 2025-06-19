'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Key, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { StyledModal } from '@/components/ui/styled-modal';
// Importando do novo sistema centralizado de modais em vez do contexto antigo
import { usePATModal } from '@/contexts/modal-manager-context';
import { PATService } from '@/services/pat-service';

export function PATModal() {
  // Usando o hook do sistema centralizado com métodos padronizados
  const { isOpen, closeModal, onConfigured, status } = usePATModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(['common', 'pat']);

  // Schema para validação do token com mensagens traduzidas
  const patFormSchema = z.object({
    token: z
      .string()
      .min(8, t('pat:validation.minLength', { count: 8 }))
      .max(100, t('pat:validation.maxLength', { count: 100 })),
  });

  type PatFormValues = z.infer<typeof patFormSchema>;

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
      closeModal();
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
        toast.success(t('pat:toast.updateSuccess'));
      } else {
        await PATService.createToken(data);
        toast.success(t('pat:toast.createSuccess'));
      }

      // Callback para informar que o token foi configurado
      if (onConfigured) {
        onConfigured();
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pat:errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Foco automático no campo de entrada quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const inputElement = document.querySelector('input[name="token"]');

        if (inputElement instanceof HTMLInputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Preparar descrição com data da última atualização, se aplicável
  const getDescription = () => {
    const baseDescription = status.configured
      ? t('pat:description.update')
      : t('pat:description.create');

    if (status.configured && status.lastUpdated) {
      return (
        <>
          {baseDescription}
          <p className="mt-1 text-xs text-muted-foreground" data-testid="pat-modal-last-updated">
            {t('pat:description.lastUpdated', {
              date: new Date(status.lastUpdated).toLocaleString(),
            })}
          </p>
        </>
      );
    }

    return baseDescription;
  };

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={status.configured ? t('pat:modal.titleUpdate') : t('pat:modal.titleCreate')}
      description={getDescription()}
      icon={Key}
      backgroundIcon={Key}
      testId="pat-modal"
      maxWidth="md"
    >
      {error && (
        <Alert variant="destructive" className="mb-4" data-testid="pat-modal-error">
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
                <FormLabel data-testid="pat-form-label">{t('pat:form.tokenLabel')}</FormLabel>
                <FormControl>
                  <div className="flex" data-testid="pat-form-field-container">
                    <div className="relative flex-grow">
                      <Input
                        autoFocus
                        type={showToken ? 'text' : 'password'}
                        placeholder={t('pat:form.tokenPlaceholder')}
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
                        aria-label={showToken ? t('pat:form.hideToken') : t('pat:form.showToken')}
                        disabled={isSubmitting}
                      >
                        {showToken ? (
                          <EyeOffIcon className="h-4 w-4" data-testid="pat-eye-off-icon" />
                        ) : (
                          <EyeIcon className="h-4 w-4" data-testid="pat-eye-icon" />
                        )}
                        <span className="sr-only">
                          {showToken ? t('pat:form.hideToken') : t('pat:form.showToken')}
                        </span>
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage data-testid="pat-form-error-message" />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-6" data-testid="pat-modal-footer">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
              data-testid="pat-form-cancel"
            >
              {t('common:buttons.cancel')}
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
                    {status.configured ? t('pat:form.updating') : t('pat:form.configuring')}
                  </span>
                </>
              ) : (
                <span data-testid="pat-form-submit-text">
                  {status.configured ? t('pat:form.update') : t('pat:form.configure')}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </StyledModal>
  );
}
