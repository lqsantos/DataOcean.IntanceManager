import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { FormValues } from '@/components/resources/blueprints/types';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';
import { blueprintService } from '@/services/blueprint-service';

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export function useBlueprintForm(form: UseFormReturn<FormValues>, mode: 'create' | 'edit') {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { updateBlueprintData, updateSelectedTemplates, updateBlueprintVariables } =
    useCreateBlueprint();

  const handleStepSubmit = {
    basicInfo: (data: FormValues) => {
      if (mode === 'create') {
        // Incluir applicationId nos dados atualizados
        updateBlueprintData({
          name: data.name,
          description: data.description,
          applicationId: data.applicationId,
        });
        // Log para debug
        console.warn('ApplicationId being saved to context:', data.applicationId);
      }
    },

    templates: (data: FormValues) => {
      if (mode === 'create' && data.selectedTemplates) {
        const processedTemplates = data.selectedTemplates.map((template, index) => ({
          ...template,
          order: index + 1,
        }));

        updateSelectedTemplates(processedTemplates);
      }
    },

    variables: (data: FormValues) => {
      if (mode === 'create' && data.blueprintVariables) {
        const typedVariables = data.blueprintVariables.map((v) => ({
          ...v,
          value: v.value || '',
        }));

        updateBlueprintVariables(typedVariables);
        form.setValue('helperTpl', data.helperTpl || '');
      }
    },
  };

  const hasStepErrors = (step: number) => {
    const { errors } = form.formState;

    console.log('Form errors:', JSON.stringify(errors));

    const errorMap = {
      1: () => {
        // Verificando erros específicos no passo 1
        console.warn(
          'Step 1 errors check: name=',
          !!errors.name,
          'description=',
          !!errors.description
        );

        return false; // Temporariamente permitindo avançar independente de erros
      },
      2: () => !!errors.selectedTemplates,
      3: () => !!errors.blueprintVariables || !!errors.helperTpl,
      4: () => false,
    };

    const hasError = errorMap[step as keyof typeof errorMap]?.() || false;

    console.log(`Step ${step} has errors:`, hasError);

    return hasError;
  };

  const validateBlueprint = async (data: FormValues) => {
    // Cancel any existing validation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setValidationStatus('idle');
    setValidationMessage(undefined);

    // Create a new abort controller
    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setValidationStatus('validating');
      setValidationMessage(undefined);

      // Prepare data for validation - convert to proper format expected by API
      const blueprintData = {
        name: data.name,
        description: data.description,
        childTemplates: data.selectedTemplates || [],
        variables: data.blueprintVariables || [],
        helperTpl: data.helperTpl,
      };

      // Call the validation API
      const result = await blueprintService.validateBlueprint(
        // Type assertion necessária pois os tipos podem não corresponder exatamente
        blueprintData as unknown as Parameters<typeof blueprintService.validateBlueprint>[0],
        controller.signal
      );

      // Update status based on result
      if (result.valid) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
        setValidationMessage(result.message || 'Blueprint inválido');
      }

      return result; // Retornar o resultado completo (objeto com valid e message)
    } catch (error) {
      console.error('Blueprint validation error:', error);
      setValidationStatus('invalid');
      const errorMessage = 'Erro ao validar blueprint';

      setValidationMessage(errorMessage);

      return { valid: false, message: errorMessage };
    }
  };

  const cancelValidation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setValidationStatus('idle');
    setValidationMessage(undefined);
  };

  // Cancel validation when component unmounts
  useEffect(() => {
    return () => {
      cancelValidation();
    };
  }, []);

  return {
    handleStepSubmit,
    hasStepErrors,
    validationStatus,
    validationMessage,
    validateBlueprint,
    cancelValidation,
  };
}
