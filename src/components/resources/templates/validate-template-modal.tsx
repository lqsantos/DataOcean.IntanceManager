'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';

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
  const { isOpen, isLoading, templateName, validationResult, closeModal } = useTemplateValidation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Validação de Template</DialogTitle>
          <DialogDescription>Resultado da validação do template {templateName}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validando template...</p>
            </div>
          ) : validationResult ? (
            <div className="space-y-4">
              <Alert
                variant={validationResult.isValid ? 'default' : 'destructive'}
                className={validationResult.isValid ? 'border-green-600 bg-green-50' : undefined}
              >
                {validationResult.isValid ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertTitle>
                  {validationResult.isValid ? 'Template válido' : 'Template inválido'}
                </AlertTitle>
                <AlertDescription>
                  {validationResult.message ||
                    (validationResult.isValid
                      ? 'O template foi validado com sucesso e pode ser utilizado.'
                      : 'O template contém erros que precisam ser corrigidos.')}
                </AlertDescription>
              </Alert>

              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Erros</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <ul className="list-inside list-disc space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-destructive">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-amber-500">Avisos</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <ul className="list-inside list-disc space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-amber-500">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Sem resultados</AlertTitle>
              <AlertDescription>
                Não há resultados de validação disponíveis para este template.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={closeModal} disabled={isLoading}>
            {validationResult?.isValid ? 'Fechar' : 'Entendi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
