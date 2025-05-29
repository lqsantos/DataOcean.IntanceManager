'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTemplateValidation } from '@/contexts/template-validation-context';

export function ValidateTemplateModal() {
  const { t } = useTranslation('templates');
  const { isOpen, isLoading, templateName, validationResult, closeModal } = useTemplateValidation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-xl" data-testid="validate-template-modal">
        <DialogHeader>
          <DialogTitle>{t('validateTemplate.title')}</DialogTitle>
          <DialogDescription>
            {t('validateTemplate.description', { name: templateName })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center space-y-2 py-8"
              data-testid="validate-template-loading"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('validateTemplate.loading')}</p>
            </div>
          ) : validationResult ? (
            <div className="space-y-4" data-testid="validate-template-result">
              <Alert
                variant={validationResult.isValid ? 'default' : 'destructive'}
                className={validationResult.isValid ? 'border-green-600 bg-green-50' : undefined}
                data-testid={`validate-template-status-${validationResult.isValid ? 'success' : 'error'}`}
              >
                {validationResult.isValid ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertTitle>
                  {validationResult.isValid
                    ? t('validateTemplate.valid.title')
                    : t('validateTemplate.invalid.title')}
                </AlertTitle>
                <AlertDescription>
                  {validationResult.message ||
                    (validationResult.isValid
                      ? t('validateTemplate.valid.description')
                      : t('validateTemplate.invalid.description'))}
                </AlertDescription>
              </Alert>
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="space-y-2" data-testid="validate-template-errors">
                  <h4 className="font-medium text-destructive">{t('validateTemplate.errors')}</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <ul className="list-inside list-disc space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li
                          key={index}
                          className="text-sm text-destructive"
                          data-testid={`validate-template-error-${index}`}
                        >
                          {error}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="space-y-2" data-testid="validate-template-warnings">
                  <h4 className="font-medium text-amber-500">{t('validateTemplate.warnings')}</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <ul className="list-inside list-disc space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="text-sm text-amber-500"
                          data-testid={`validate-template-warning-${index}`}
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : (
            <Alert data-testid="validate-template-no-results">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>{t('validateTemplate.noResults.title')}</AlertTitle>
              <AlertDescription>{t('validateTemplate.noResults.description')}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={closeModal}
            disabled={isLoading}
            data-testid="validate-template-close-button"
          >
            {validationResult?.isValid
              ? t('validateTemplate.buttons.close')
              : t('validateTemplate.buttons.understand')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
