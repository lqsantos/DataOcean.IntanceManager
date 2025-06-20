'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { FormValues } from '../../types';

import { ExpressionVariableModal } from './expression-variable-modal';
import { FixedVariableModal } from './fixed-variable-modal';
import type { BlueprintVariable, ExpressionVariable, FixedVariable, VariableType } from './types';
import { useBlueprintVariables } from './use-blueprint-variables';
import { VariablesTable } from './variables-table';

interface VariablesStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * Convert old variable format to new variable format
 */
function convertOldVariables(oldVariables: FormValues['blueprintVariables']): BlueprintVariable[] {
  if (!oldVariables) {
    return [];
  }

  return oldVariables.map((oldVar): BlueprintVariable => {
    if (oldVar.type === 'advanced') {
      return {
        name: oldVar.name,
        description: oldVar.description,
        type: 'expression',
        expression: oldVar.value || '',
      };
    }

    return {
      name: oldVar.name,
      description: oldVar.description,
      type: 'fixed',
      value: oldVar.value || '',
    };
  });
}

/**
 * Third step in blueprint form to define variables
 */
export function VariablesStep({ form }: VariablesStepProps) {
  const { t } = useTranslation(['blueprints']);

  // Modal state
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isExpressionModalOpen, setIsExpressionModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<BlueprintVariable | null>(null);
  const [deletingVariable, setDeletingVariable] = useState<BlueprintVariable | null>(null);

  // Get form values and convert
  const formVariables = convertOldVariables(form.getValues('blueprintVariables'));

  // Blueprint variables hook
  const { variables, addVariable, removeVariable, updateVariable, isVariableNameDuplicate } =
    useBlueprintVariables(formVariables);

  // Update form values when variables change
  useEffect(() => {
    const oldFormatVariables = variables.map((v) => ({
      name: v.name,
      description: v.description,
      type: v.type === 'fixed' ? ('simple' as const) : ('advanced' as const),
      value: v.type === 'fixed' ? v.value : v.expression,
    }));

    form.setValue('blueprintVariables', oldFormatVariables, { shouldValidate: true });
    // O backend irá gerar o helperTpl
    form.setValue('helperTpl', '', { shouldValidate: true });
  }, [variables, form]);

  // Handle variable type selection
  const handleAddVariable = (type: VariableType) => {
    if (type === 'fixed') {
      setIsFixedModalOpen(true);
    } else {
      setIsExpressionModalOpen(true);
    }
  };

  // Handle fixed variable actions
  const handleFixedSubmit = (variable: FixedVariable) => {
    if (editingVariable && editingVariable.type === 'fixed') {
      const index = variables.findIndex((v) => v.name === editingVariable.name);

      if (index !== -1) {
        updateVariable(index, { ...variable, type: 'fixed' });
      }
    } else {
      addVariable({ ...variable, type: 'fixed' });
    }
    setEditingVariable(null);
    setIsFixedModalOpen(false);
  };

  // Handle expression variable actions
  const handleExpressionSubmit = (variable: ExpressionVariable) => {
    if (editingVariable && editingVariable.type === 'expression') {
      const index = variables.findIndex((v) => v.name === editingVariable.name);

      if (index !== -1) {
        updateVariable(index, { ...variable, type: 'expression' });
      }
    } else {
      addVariable({ ...variable, type: 'expression' });
    }
    setEditingVariable(null);
    setIsExpressionModalOpen(false);
  };

  // Handle variable edit
  const handleEdit = (variable: BlueprintVariable) => {
    setEditingVariable(variable);

    if (variable.type === 'fixed') {
      setIsFixedModalOpen(true);
    } else {
      setIsExpressionModalOpen(true);
    }
  };

  // Handle variable delete
  const handleDelete = (variable: BlueprintVariable) => {
    setDeletingVariable(variable);
  };

  // Handle remove variable confirmation
  const handleRemoveVariable = () => {
    if (deletingVariable) {
      const index = variables.findIndex((v) => v.name === deletingVariable.name);

      if (index !== -1) {
        removeVariable(index);
      }
    }
    setDeletingVariable(null);
  };

  // Renderização
  return (
    <div className="space-y-6" data-testid="variables-step">
      <VariablesTable
        variables={variables}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderAddButton={() => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('createBlueprint.fields.variables.add')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleAddVariable('fixed')}
                data-testid="add-fixed-variable-button"
              >
                {t('variablesTable.types.fixed')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAddVariable('expression')}
                data-testid="add-expression-variable-button"
              >
                {t('variablesTable.types.expression')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <FixedVariableModal
        open={isFixedModalOpen}
        onOpenChange={setIsFixedModalOpen}
        onSubmit={handleFixedSubmit}
        isVariableNameDuplicate={isVariableNameDuplicate}
        initialData={editingVariable?.type === 'fixed' ? editingVariable : undefined}
      />

      <ExpressionVariableModal
        open={isExpressionModalOpen}
        onOpenChange={setIsExpressionModalOpen}
        onSubmit={handleExpressionSubmit}
        isVariableNameDuplicate={isVariableNameDuplicate}
        initialData={editingVariable?.type === 'expression' ? editingVariable : undefined}
      />

      <AlertDialog open={!!deletingVariable} onOpenChange={() => setDeletingVariable(null)}>
        <AlertDialogContent data-testid="delete-variable-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteBlueprint.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteBlueprint.description', { name: deletingVariable?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeletingVariable(null)}
              data-testid="delete-variable-cancel-button"
            >
              {t('deleteBlueprint.buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveVariable}
              data-testid="delete-variable-confirm-button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteBlueprint.buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
