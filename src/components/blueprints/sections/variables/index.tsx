import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { useBlueprintForm } from '@/contexts/blueprint-form-context';

import type { BlueprintVariable } from './types';
import { useBlueprintVariables } from './use-blueprint-variables';
import { VariableEditor } from './variable-editor';
import { VariablesList } from './variables-list';

export function VariablesSection() {
  const { t } = useTranslation('blueprints');
  const { state, setSectionData, markSectionComplete } = useBlueprintForm();

  // Converter formato antigo para o novo formato (para compatibilidade)
  const formVariables = state.formData.variables.variables.map(
    (oldVar: {
      name: string;
      description?: string;
      type: string;
      defaultValue?: string;
    }): BlueprintVariable => {
      return {
        id: oldVar.name, // Usando o name como id para preservar referências
        name: oldVar.name,
        description: oldVar.description,
        type: 'expression', // Todas as variáveis agora são do tipo expression
        value: oldVar.defaultValue || '',
        isValid: true,
      };
    }
  );

  // Blueprint variables hook - fonte única de verdade
  const {
    variables,
    addVariable,
    updateVariable,
    deleteVariable,
    validateVariables,
    setVariables,
  } = useBlueprintVariables(formVariables);

  // Atualizar o contexto do formulário quando as variáveis mudarem
  const updateFormContext = (updatedVariables: BlueprintVariable[]) => {
    // Atualizar o estado de variáveis
    setVariables(updatedVariables);

    // Converter para o formato esperado pelo formulário
    const formattedVariables = updatedVariables.map((v) => ({
      name: v.name,
      description: v.description || '',
      type: 'advanced', // Todas as variáveis agora são do tipo avançado (expression)
      required: true,
      defaultValue: v.value,
    }));

    setSectionData('variables', { variables: formattedVariables });

    // Marcar seção como completa se houver pelo menos uma variável válida
    const isComplete = validateVariables() && formattedVariables.length > 0;

    markSectionComplete('variables', isComplete);
  };

  // Estado do modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentVariable, setCurrentVariable] = useState<BlueprintVariable | null>(null);
  const [deletingVariable, setDeletingVariable] = useState<BlueprintVariable | null>(null);

  // Abrir modal para adicionar variável
  const handleAddVariable = () => {
    setCurrentVariable(null);
    setIsEditorOpen(true);
  };

  // Abrir modal para editar variável
  const handleEditVariable = (variable: BlueprintVariable) => {
    setCurrentVariable(variable);
    setIsEditorOpen(true);
  };

  // Preparar deleção de variável
  const handleDeleteRequest = (variable: BlueprintVariable) => {
    setDeletingVariable(variable);
  };

  // Confirmar deleção de variável
  const handleConfirmDelete = () => {
    if (deletingVariable) {
      // Excluir a variável e obter a lista atualizada
      deleteVariable(deletingVariable.id);

      // Atualizar o contexto do formulário com a nova lista de variáveis
      const updatedVariables = variables.filter((v) => v.id !== deletingVariable.id);

      updateFormContext(updatedVariables);

      // Mostrar notificação
      toast.success(t('variables.notifications.deleted'), {
        description: t('variables.notifications.deletedDescription', {
          name: deletingVariable.name,
        }),
      });

      // Se o modal de edição estiver aberto e a variável sendo editada é a que estamos deletando,
      // feche o modal de edição também
      if (isEditorOpen && currentVariable && currentVariable.id === deletingVariable.id) {
        setIsEditorOpen(false);
        setCurrentVariable(null);
      }
    }
    setDeletingVariable(null);
  };

  // Salvar variável (adicionar ou editar)
  const handleSaveVariable = (variable: BlueprintVariable) => {
    let updatedVariables: BlueprintVariable[];

    if (currentVariable) {
      // Atualizar variável existente
      updateVariable(variable.id, variable);

      // Obter a lista atualizada
      updatedVariables = variables.map((v) => (v.id === variable.id ? variable : v));

      // Notificação
      toast.success(t('variables.notifications.updated'), {
        description: t('variables.notifications.updatedDescription', { name: variable.name }),
      });
    } else {
      // Adicionar nova variável
      const newId = addVariable(variable);

      // Criar a nova entrada com o ID gerado
      const newVariable = { ...variable, id: newId };

      // Obter a lista atualizada
      updatedVariables = [...variables, newVariable];

      // Notificação
      toast.success(t('variables.notifications.added'), {
        description: t('variables.notifications.addedDescription', { name: variable.name }),
      });
    }

    // Atualizar o contexto do formulário com a lista atualizada
    updateFormContext(updatedVariables);

    // Fechar o modal
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6" data-testid="variables-section">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('variables.title')}</h2>
        <Button onClick={handleAddVariable} data-testid="add-variable-button">
          <Plus className="mr-2 h-4 w-4" />
          {t('variables.addVariable')}
        </Button>
      </div>

      <VariablesList
        variables={variables}
        onEdit={handleEditVariable}
        onDelete={handleDeleteRequest}
        data-testid="variables-list-component"
      />

      <VariableEditor
        variable={currentVariable}
        existingVariables={variables}
        onSave={handleSaveVariable}
        onCancel={() => setIsEditorOpen(false)}
        onDelete={
          currentVariable
            ? () => {
                handleDeleteRequest(currentVariable);
                // We don't close the editor modal here since that will be handled by handleConfirmDelete
                // after deletion is confirmed in the alert dialog
              }
            : undefined
        }
        open={isEditorOpen}
      />

      <AlertDialog
        open={!!deletingVariable}
        onOpenChange={(open) => !open && setDeletingVariable(null)}
      >
        <AlertDialogContent data-testid="delete-variable-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('variables.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('variables.deleteDialog.description', { name: deletingVariable?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button">
              {t('variables.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              data-testid="confirm-delete-button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('variables.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
