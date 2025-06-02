'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

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
  // Modal state
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isExpressionModalOpen, setIsExpressionModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<BlueprintVariable | null>(null);
  const [deletingVariable, setDeletingVariable] = useState<BlueprintVariable | null>(null);

  // Get form values and convert
  const formVariables = convertOldVariables(form.getValues('blueprintVariables'));

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
    // Convert new variables back to old format for form
    const oldFormatVariables = variables.map((v) => ({
      name: v.name,
      description: v.description,
      type: v.type === 'fixed' ? ('simple' as const) : ('advanced' as const),
      value: v.type === 'fixed' ? v.value : v.expression,
    }));

    form.setValue('blueprintVariables', oldFormatVariables);
    form.setValue('helperTpl', generateHelperTpl());
  };

  // Handle variable addition
  const handleAddVariable = (type: VariableType) => {
    if (type === 'fixed') {
      setIsFixedModalOpen(true);
    } else {
      setIsExpressionModalOpen(true);
    }
  };

  // Handle fixed variable submission
  const handleFixedSubmit = (data: FixedVariable) => {
    if (editingVariable) {
      const index = variables.findIndex((v: BlueprintVariable) => v.name === editingVariable.name);

      if (index !== -1) {
        updateVariable(index, data);
      }
    } else {
      addVariable(data);
    }
    updateFormVariables();
    setEditingVariable(null);
    setIsFixedModalOpen(false);
  };

  // Handle expression variable submission
  const handleExpressionSubmit = (data: ExpressionVariable) => {
    if (editingVariable) {
      const index = variables.findIndex((v: BlueprintVariable) => v.name === editingVariable.name);

      if (index !== -1) {
        updateVariable(index, data);
      }
    } else {
      addVariable(data);
    }
    updateFormVariables();
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

  const handleConfirmDelete = () => {
    if (deletingVariable) {
      const index = variables.findIndex((v: BlueprintVariable) => v.name === deletingVariable.name);

      if (index !== -1) {
        removeVariable(index);
        updateFormVariables();
      }
    }
    setDeletingVariable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Variáveis do Blueprint</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Variável
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddVariable('fixed')}>
              Valor Fixo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddVariable('expression')}>
              Expressão Go Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <VariablesTable variables={variables} onEdit={handleEdit} onDelete={handleDelete} />

      <FixedVariableModal
        open={isFixedModalOpen}
        onOpenChange={setIsFixedModalOpen}
        onSubmit={handleFixedSubmit}
        initialData={editingVariable?.type === 'fixed' ? editingVariable : undefined}
        isVariableNameDuplicate={isVariableNameDuplicate}
      />

      <ExpressionVariableModal
        open={isExpressionModalOpen}
        onOpenChange={setIsExpressionModalOpen}
        onSubmit={handleExpressionSubmit}
        initialData={editingVariable?.type === 'expression' ? editingVariable : undefined}
        isVariableNameDuplicate={isVariableNameDuplicate}
      />

      <AlertDialog open={!!deletingVariable} onOpenChange={() => setDeletingVariable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Variável</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a variável {deletingVariable?.name}? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingVariable(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
