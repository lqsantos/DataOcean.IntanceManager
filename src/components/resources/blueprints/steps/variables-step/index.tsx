'use client';

import type { UseFormReturn } from 'react-hook-form';

import { useBlueprintVariables } from '../../hooks/use-blueprint-variables';
import type { FormValues } from '../../types';

import { VariableForm } from './variable-form';
import { VariableList } from './variable-list';

interface VariablesStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * Third step in blueprint form to define variables
 */
export function VariablesStep({ form }: VariablesStepProps) {
  // Get form values
  const formVariables = form.getValues('blueprintVariables') || [];

  // Blueprint variables hook
  const {
    variables,
    addVariable,
    removeVariable,
    updateVariable,
    isVariableNameDuplicate,
    generateHelperTpl,
  } = useBlueprintVariables(formVariables);

  // Update form values when variables change
  const updateFormVariables = () => {
    form.setValue('blueprintVariables', variables);
    const helperTpl = generateHelperTpl();

    form.setValue('helperTpl', helperTpl);
  };

  // Add a new variable of specified type
  const handleAddVariable = (type: 'simple' | 'advanced') => {
    addVariable(type);
    updateFormVariables();

    return variables.length;
  };

  // Remove a variable by index
  const handleRemoveVariable = (index: number) => {
    removeVariable(index);
    updateFormVariables();
  };

  // Update variable property
  const handleUpdateVariable = (index: number, field: string, value: string) => {
    updateVariable(index, field as any, value);
    updateFormVariables();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Variáveis do Blueprint</h2>
        <p className="text-sm text-muted-foreground">
          Defina variáveis globais que estarão disponíveis para todos os templates.
        </p>
      </div>

      <VariableForm onAddVariable={handleAddVariable} />

      <VariableList
        variables={variables}
        onRemoveVariable={handleRemoveVariable}
        onUpdateVariable={handleUpdateVariable}
        isVariableNameDuplicate={isVariableNameDuplicate}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Como usar variáveis globais:</strong> As variáveis definidas aqui estarão
          disponíveis para uso em todos os templates associados a este blueprint.
        </p>
      </div>
    </div>
  );
}
