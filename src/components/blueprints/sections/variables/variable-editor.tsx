import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { MonacoExpressionEditor } from './monaco-expression-editor';
import type { BlueprintVariable } from './types';

interface VariableEditorProps {
  variable: BlueprintVariable | null;
  existingVariables: BlueprintVariable[];
  onSave: (variable: BlueprintVariable) => void;
  onCancel: () => void;
  onDelete?: () => void;
  open: boolean;
}

export function VariableEditor({
  variable,
  existingVariables,
  onSave,
  onCancel,
  onDelete,
  open,
}: VariableEditorProps) {
  const { t } = useTranslation('blueprints');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar com os valores do variable quando abrir ou quando variable mudar
  useEffect(() => {
    if (variable) {
      setName(variable.name);
      setDescription(variable.description || '');
      setValue(variable.value);
    } else {
      setName('');
      setDescription('');
      setValue('');
    }
    setErrors({});
  }, [variable, open]);

  // Validar nome de variável
  const validateName = (newName: string): boolean => {
    if (!newName) {
      setErrors((prev) => ({
        ...prev,
        name: t('variables.variableEditor.validation.nameRequired'),
      }));

      return false;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newName)) {
      setErrors((prev) => ({
        ...prev,
        name: t('variables.variableEditor.validation.nameFormat'),
      }));

      return false;
    }

    // Check for duplicates (skip current variable)
    const isDuplicate = existingVariables.some(
      (v) => v.name === newName && (!variable || v.id !== variable.id)
    );

    if (isDuplicate) {
      setErrors((prev) => ({
        ...prev,
        name: t('variables.variableEditor.validation.nameDuplicate'),
      }));

      return false;
    }

    setErrors((prev) => ({ ...prev, name: '' }));

    return true;
  };

  // Validar valor
  const validateValue = (newValue: string): boolean => {
    if (!newValue) {
      setErrors((prev) => ({
        ...prev,
        value: t('variables.variableEditor.validation.valueRequired'),
      }));

      return false;
    }

    // Validar delimitadores de template para expressões
    const openingBraces = (newValue.match(/{{-?/g) || []).length;
    const closingBraces = (newValue.match(/-?}}/g) || []).length;

    if (openingBraces !== closingBraces) {
      setErrors((prev) => ({
        ...prev,
        value: t('variables.variableEditor.validation.unbalancedDelimiters'),
      }));

      return false;
    }

    setErrors((prev) => ({ ...prev, value: '' }));

    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;

    setName(newName);
    validateName(newName);
  };

  const handleValueChange = (newValue: string | undefined) => {
    const valueToSet = newValue || '';

    setValue(valueToSet);
    validateValue(valueToSet);
  };

  // Não precisamos mais de função para alternar o tipo, pois só usamos 'expression'

  const handleSave = () => {
    const isNameValid = validateName(name);
    const isValueValid = validateValue(value);

    if (!isNameValid || !isValueValid) {
      return;
    }

    const updatedVariable: BlueprintVariable = {
      id: variable?.id || crypto.randomUUID(),
      name,
      description,
      value,
      type: 'expression',
      isValid: true,
    };

    onSave(updatedVariable);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[750px]" data-testid="variable-editor">
        <DialogHeader>
          <DialogTitle>
            {variable
              ? t('variables.variableEditor.editTitle')
              : t('variables.variableEditor.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="block">
              {t('variables.variableEditor.name')}
            </Label>
            <div className="space-y-1">
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder={t('variables.variableEditor.namePlaceholder')}
                data-testid="variable-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-500" data-testid="variable-name-error">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="block">
              {t('variables.variableEditor.description')}
            </Label>
            <div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('variables.variableEditor.descriptionPlaceholder')}
                data-testid="variable-description-input"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="value" className="block">
              {t('variables.variableEditor.expression')}
            </Label>
            <div className="space-y-1">
              <div className="rounded-md border">
                <MonacoExpressionEditor
                  value={value}
                  onChange={handleValueChange}
                  availableVariables={existingVariables
                    .filter((v) => v.id !== variable?.id)
                    .map((v) => v.name)}
                  height="250px"
                  data-testid="variable-expression-editor"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm" data-testid="show-syntax-help-button">
                  {t('variables.variableEditor.showSyntaxHelp')}
                </Button>
              </div>
              {errors.value && (
                <p className="text-sm text-red-500" data-testid="variable-expression-error">
                  {errors.value}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {variable && onDelete && (
              <Button variant="destructive" onClick={onDelete} data-testid="delete-variable-button">
                {t('variables.variableEditor.deleteVariable')}
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} data-testid="cancel-button">
              {t('variables.variableEditor.cancel')}
            </Button>
            <Button onClick={handleSave} data-testid="save-variable-button">
              {t('variables.variableEditor.saveVariable')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
