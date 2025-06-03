import type { UseFormReturn } from 'react-hook-form';

import type { FormValues } from '@/components/resources/blueprints/types';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';

export function useBlueprintForm(form: UseFormReturn<FormValues>, mode: 'create' | 'edit') {
  const {
    updateBlueprintData,
    updateSelectedTemplates,
    updateBlueprintVariables,
    generateHelperTpl,
  } = useCreateBlueprint();

  const handleStepSubmit = {
    basicInfo: (data: FormValues) => {
      if (mode === 'create') {
        updateBlueprintData({
          name: data.name,
          description: data.description,
        });
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
        generateHelperTpl?.();
      }
    },
  };

  const hasStepErrors = (step: number) => {
    const { errors } = form.formState;
    const errorMap = {
      1: () => !!errors.name || !!errors.description,
      2: () => !!errors.selectedTemplates,
      3: () => !!errors.blueprintVariables || !!errors.helperTpl,
      4: () => false,
    };

    return errorMap[step as keyof typeof errorMap]?.() || false;
  };

  return {
    handleStepSubmit,
    hasStepErrors,
  };
}
