'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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
import { templateService } from '@/services/template-service';
import type { TemplateValidationResult } from '@/types/template';

interface DirectValidateButtonProps {
  templateName: string;
  templateId?: string | null;
  repositoryUrl?: string;
  chartPath?: string;
}

// Estados de exibição da modal
type ValidationDialogState = 'branch-select' | 'validating' | 'result';

// Componente para validação direta que gerencia todo o fluxo em uma única modal
export function DirectValidateButton({
  templateName,
  templateId = null,
  repositoryUrl = '',
  chartPath = '',
}: DirectValidateButtonProps) {
  const { t } = useTranslation('templates');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ValidationDialogState>('branch-select');
  const [validationResult, setValidationResult] = useState<TemplateValidationResult | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');

  // Verificar se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    // Se tiver um templateId existente, não precisamos verificar repositoryUrl e chartPath
    if (templateId) {
      return true;
    }

    // Caso contrário, validar se temos repositoryUrl e chartPath preenchidos
    const isUrlValid =
      repositoryUrl &&
      repositoryUrl.trim() !== '' &&
      (repositoryUrl.startsWith('http://') || repositoryUrl.startsWith('https://'));
    const isChartPathValid = chartPath && chartPath.trim() !== '';

    return isUrlValid && isChartPathValid;
  };

  // Form schema for validation
  const formSchema = z.object({
    branch: z.string().min(1, {
      message: t('branchSelection.validation.required'),
    }),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: 'main',
    },
  });

  const handleValidateClick = (e: React.MouseEvent) => {
    // Importante: impedir qualquer propagação de evento
    e.preventDefault();
    e.stopPropagation();
    // Resetar estados
    setDialogState('branch-select');
    setValidationResult(null);
    setIsDialogOpen(true);
  };

  // Função para validar o template
  const validateTemplate = async (branch: string) => {
    setIsLoading(true);
    setDialogState('validating');
    setSelectedBranch(branch);

    try {
      // Validar template diretamente usando o serviço
      let result: TemplateValidationResult;

      if (templateId) {
        result = await templateService.validateTemplate(templateId, branch);
      } else {
        result = await templateService.validateTemplateData({
          repositoryUrl,
          chartPath,
          branch,
        });
      }

      // Definir status baseado na validação
      result.status = result.isValid ? 'success' : 'error';
      result.branch = branch;

      // Armazenar resultado e mudar estado
      setValidationResult(result);
      setDialogState('result');
    } catch (error) {
      console.error('Erro ao validar template:', error);

      // Criar um resultado de erro genérico
      setValidationResult({
        isValid: false,
        status: 'generic-error',
        message:
          error instanceof Error
            ? error.message
            : 'Verifique se o repositório e o caminho estão corretos.',
        errors:
          error instanceof Error ? [error.message] : ['Erro desconhecido durante a validação'],
        branch,
      });

      setDialogState('result');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler específico para o botão de validar no diálogo
  const handleConfirmValidate = (e: React.MouseEvent) => {
    // Impedir qualquer comportamento padrão
    e.preventDefault();
    e.stopPropagation();

    // Usar o valor atual do form
    const branch = form.getValues().branch;

    validateTemplate(branch);
  };

  // Voltar para a seleção de branch
  const handleBackToBranchSelection = () => {
    setDialogState('branch-select');
  };

  // Determinar se o botão de validação deve estar desabilitado
  const isValidateButtonDisabled = !isFormValid() || isLoading;

  // Mensagem de tooltip para o botão desabilitado
  const getDisabledButtonMessage = () => {
    if (isLoading) {
      return t('table.actions.validating');
    }

    if (!isFormValid()) {
      if (
        !repositoryUrl ||
        repositoryUrl.trim() === '' ||
        !(repositoryUrl.startsWith('http://') || repositoryUrl.startsWith('https://'))
      ) {
        return 'URL do repositório inválida';
      }

      if (!chartPath || chartPath.trim() === '') {
        return 'Caminho do chart não informado';
      }
    }

    return '';
  };

  // Renderiza o conteúdo da modal com base no estado atual
  const renderDialogContent = () => {
    switch (dialogState) {
      case 'branch-select':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('branchSelection.title')}</DialogTitle>
              <DialogDescription>
                {t('branchSelection.description', { name: templateName })}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('branchSelection.branchName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('branchSelection.customPlaceholder')}
                          {...field}
                          data-testid="branch-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDialogOpen(false);
                    }}
                    data-testid="cancel-branch-button"
                  >
                    {t('branchSelection.buttons.cancel')}
                  </Button>
                  <Button
                    type="button"
                    disabled={isLoading || !form.getValues().branch}
                    onClick={handleConfirmValidate}
                    data-testid="confirm-branch-button"
                  >
                    {t('branchSelection.buttons.validate')}
                  </Button>
                </DialogFooter>
              </div>
            </Form>
          </>
        );

      case 'validating':
        // Estado de carregamento conforme especificado
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('validateTemplate.loading')}</DialogTitle>
              <DialogDescription>
                Validando template na branch "{selectedBranch}"...
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Por favor, aguarde enquanto validamos o template...
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled
              >
                {t('branchSelection.buttons.cancel')}
              </Button>
              <Button type="button" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('table.actions.validating')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'result':
        if (!validationResult) {
          return null;
        }

        // Resultado de validação - adapta com base no status (success, error ou generic-error)
        const isSuccess = validationResult.isValid && validationResult.status === 'success';
        const isGenericError = validationResult.status === 'generic-error';

        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('validateTemplate.title')}</DialogTitle>
              <DialogDescription>
                {t('validateTemplate.description', { name: templateName })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              {/* Cabeçalho de status com ícone e mensagem principal */}
              <div
                className={`flex items-center space-x-2 ${
                  isSuccess ? 'text-success' : 'text-destructive'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <h3 className="text-base font-medium">
                  {isSuccess
                    ? t('validateTemplate.valid.title')
                    : `${t('validateTemplate.invalid.title')}: ${validationResult.message}`}
                </h3>
              </div>

              {/* Detalhes do Chart.yaml - apenas para sucesso */}
              {isSuccess && validationResult.chartInfo && (
                <div className="rounded-md bg-muted p-2.5 text-sm">
                  <p className="mb-1 font-medium">📘 Chart.yaml:</p>
                  <div className="ml-4 space-y-0.5 text-sm">
                    {validationResult.chartInfo.name && (
                      <p>- name: {validationResult.chartInfo.name}</p>
                    )}
                    {validationResult.chartInfo.version && (
                      <p>- version: {validationResult.chartInfo.version}</p>
                    )}
                    {validationResult.chartInfo.apiVersion && (
                      <p>- apiVersion: {validationResult.chartInfo.apiVersion}</p>
                    )}
                    {validationResult.chartInfo.description && (
                      <p className="line-clamp-2">
                        - description: {validationResult.chartInfo.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Arquivos encontrados - apenas para sucesso */}
              {isSuccess && validationResult.files && (
                <div className="rounded-md bg-muted p-2.5 text-sm">
                  <p className="mb-1 font-medium">📁 Arquivos encontrados:</p>
                  <div className="ml-4 space-y-0.5">
                    <p>
                      - Chart.yaml →{' '}
                      {validationResult.files.chartYaml ? (
                        <span className="text-success">OK</span>
                      ) : (
                        <span className="text-destructive">❌ Não encontrado</span>
                      )}
                    </p>
                    <p>
                      - values.yaml →{' '}
                      {validationResult.files.valuesYaml ? (
                        <span className="text-success">OK</span>
                      ) : (
                        <span className="text-destructive">❌ Não encontrado</span>
                      )}
                    </p>
                    <p>
                      - values.schema.json →{' '}
                      {validationResult.files.valuesSchemaJson ? (
                        <span className="text-success">OK</span>
                      ) : (
                        <span className="text-muted-foreground">Não encontrado (opcional)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Branch validada - para todos os casos */}
              <div className="rounded-md bg-muted p-2.5 text-sm">
                <p>
                  📎 Branch {isSuccess ? 'validada' : 'utilizada'}:{' '}
                  <span className="font-medium">{validationResult.branch || selectedBranch}</span>
                </p>
              </div>

              {/* Erros específicos */}
              {!isSuccess && validationResult.errors && validationResult.errors.length > 0 && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-sm">
                  <p className="mb-1 font-medium text-destructive">
                    ❌ {t('validateTemplate.errors')}:
                  </p>
                  <div className="ml-4 space-y-0.5">
                    {validationResult.errors.map((error, index) => (
                      <p key={index} className="text-destructive">
                        - {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="close-validation-button"
              >
                {t('validateTemplate.buttons.close')}
              </Button>
              <Button
                type="button"
                onClick={handleBackToBranchSelection}
                data-testid="validate-again-button"
              >
                {t('validateTemplate.buttons.validateAgain') || 'Validar Novamente'}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleValidateClick}
        disabled={isValidateButtonDisabled}
        className="w-full gap-2"
        data-testid="direct-validate-button"
        title={isValidateButtonDisabled ? getDisabledButtonMessage() : ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('table.actions.validating')}
          </>
        ) : (
          t('table.actions.validate')
        )}
      </Button>

      {/* Dialog unificada para seleção de branch e resultados */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
          }
        }}
      >
        <DialogContent
          className={`sm:max-w-${dialogState === 'result' ? '600' : '425'}px`}
          data-testid="validation-dialog"
        >
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
