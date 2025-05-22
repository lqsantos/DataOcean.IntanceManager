'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useTemplateValidation } from '@/hooks/use-template-validation';
import type { TemplateChartInfo } from '@/types/template';

interface TemplateFormValidationState {
  validationAttempted: boolean;
  shouldShowToast: boolean;
  isSubmitting: boolean;
}

interface TemplateFormValidationProps {
  gitRepositoryId: string;
  branch: string;
  path: string;
}

interface TemplateFormValidationResult {
  // Estados
  validationAttempted: boolean;
  shouldShowToast: boolean;
  isSubmitting: boolean;
  chartInfo: TemplateChartInfo | null;
  preview: any;
  isValidating: boolean;
  isLoadingPreview: boolean;
  validationError: string | null;
  
  // Funções
  setIsSubmitting: (value: boolean) => void;
  validateTemplateAuto: () => Promise<void>;
  resetFormValidation: () => void;
}

/**
 * Hook personalizado para gerenciar a validação de formulários de template
 * Separa a lógica de validação do componente de formulário
 */
export function useTemplateFormValidation({
  gitRepositoryId,
  branch,
  path,
}: TemplateFormValidationProps): TemplateFormValidationResult {
  // Estados de validação
  const [state, setState] = useState<TemplateFormValidationState>({
    validationAttempted: false,
    shouldShowToast: false,
    isSubmitting: false,
  });
  
  // Referências para debounce e controle de toast
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastShownRef = useRef(false);

  // Hook de validação existente
  const {
    chartInfo,
    preview,
    isValidating,
    isLoadingPreview,
    validationError,
    validateChart,
    getPreview,
    resetValidation,
  } = useTemplateValidation();

  // Função para resetar o estado de validação
  const resetFormValidation = useCallback(() => {
    resetValidation();
    setState(prev => ({ 
      ...prev, 
      validationAttempted: false,
      shouldShowToast: false
    }));
    toastShownRef.current = false;
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
  }, [resetValidation]);

  // Função para validar o template (memoizada)
  const validateTemplateAuto = useCallback(async () => {
    if (gitRepositoryId && branch && path) {
      setState(prev => ({ ...prev, validationAttempted: true }));
      await validateChart(gitRepositoryId, branch, path);
      await getPreview(gitRepositoryId, branch, path);
    }
  }, [gitRepositoryId, branch, path, validateChart, getPreview]);

  // Auto-validar quando o caminho mudar, com debounce
  useEffect(() => {
    if (gitRepositoryId && branch && path) {
      // Limpar timeout anterior se existir
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Configurar novo timeout (debounce de 1000ms)
      validationTimeoutRef.current = setTimeout(() => {
        validateTemplateAuto();
        setState(prev => ({ ...prev, shouldShowToast: true }));
        toastShownRef.current = false;
      }, 1000);
    }

    // Cleanup do timeout quando o componente desmontar ou as dependências mudarem
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [gitRepositoryId, branch, path, validateTemplateAuto]);

  // Efeito para mostrar toast quando o template for inválido
  useEffect(() => {
    if (
      state.validationAttempted &&
      !isValidating &&
      chartInfo &&
      !chartInfo.isValid &&
      state.shouldShowToast &&
      !toastShownRef.current
    ) {
      toast.error('Template inválido', {
        description: (
          <div>
            <p>{chartInfo.validationMessage}</p>
            <div className="mt-2">
              <ul className="list-inside space-y-1">
                {chartInfo.requiredFiles?.map((file) => (
                  <li key={file.name} className="flex items-center gap-1">
                    {file.exists ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    )}
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
        duration: 5000,
      });

      // Marca que o toast já foi mostrado para esta validação
      toastShownRef.current = true;
      // Desabilita novas exibições automáticas até a próxima validação explícita
      setState(prev => ({ ...prev, shouldShowToast: false }));
    }
  }, [chartInfo, isValidating, state.validationAttempted, state.shouldShowToast]);

  // Função para atualizar o estado de submissão
  const setIsSubmitting = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isSubmitting: value }));
  }, []);

  return {
    validationAttempted: state.validationAttempted,
    shouldShowToast: state.shouldShowToast,
    isSubmitting: state.isSubmitting,
    chartInfo,
    preview,
    isValidating,
    isLoadingPreview,
    validationError,
    setIsSubmitting,
    validateTemplateAuto,
    resetFormValidation
  };
}
