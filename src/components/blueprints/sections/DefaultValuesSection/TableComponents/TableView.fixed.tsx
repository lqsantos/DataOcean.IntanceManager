/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { DefaultValueField, EnhancedTableViewProps, TemplateDefaultValues } from '../types';
import { ValueSourceType } from '../types';
import { valueConfigurationToLegacyFields } from '../ValueConfigurationConverter';

import * as FieldService from './fieldUpdateService';
// Importando componentes e constantes
import { COLUMN_WIDTHS, TableRows } from './TableRows';
import { ValidationDisplay } from './ValidationDisplay';
// Import do serviço para atualização da nova estrutura tipada
import * as ValueConfigFieldService from './valueConfigFieldUpdateService';

// Props clássicas (legado)
export interface TableViewProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables: Array<{ name: string; value: string }>;
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;
  validationState?: {
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>;
  };
  showValidationFeedback?: boolean;
}

// Props tipadas para o componente
type CombinedTableViewProps = TableViewProps | EnhancedTableViewProps;

// O componente agora aceita tanto a interface antiga quanto a estendida
export const TableView: React.FC<CombinedTableViewProps> = React.memo((props) => {
  const {
    blueprintVariables,
    templateValues,
    validationState,
    showValidationFeedback = false,
  } = props;

  const { t } = useTranslation(['blueprints']);

  // Verificamos se estamos usando a interface estendida com suporte a ValueConfiguration
  const isEnhancedProps = 'useTypedValueConfiguration' in props;

  // Se for enhanced, extraímos as propriedades adicionais
  const useTypedValueConfiguration = isEnhancedProps
    ? (props as EnhancedTableViewProps).useTypedValueConfiguration
    : false;

  // Função de callback para mudanças no ValueConfiguration
  const onValueConfigurationChange = isEnhancedProps
    ? (props as EnhancedTableViewProps).onValueConfigurationChange
    : undefined;

  // Value configuration (se disponível)
  const valueConfiguration = isEnhancedProps
    ? (props as EnhancedTableViewProps).valueConfiguration
    : null;

  // Função onChange básica
  const onChange = props.onChange;

  // Safety check for fields array
  const fields = templateValues?.fields || [];

  // Handle value source change (template vs blueprint)
  const handleSourceChange = useCallback(
    (field: DefaultValueField, source: ValueSourceType) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const isCustomized = source === ValueSourceType.BLUEPRINT;
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldCustomized(
          valueConfiguration,
          path,
          isCustomized
        );

        // Se o campo não está customizado, restaura para o valor padrão
        const updatedConfig = isCustomized
          ? updatedValueConfig
          : ValueConfigFieldService.resetFieldToDefault(updatedValueConfig, path);

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldSource(templateValues.fields, field, source);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (field: DefaultValueField, newValue: unknown) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldValue(
          valueConfiguration,
          path,
          newValue
        );

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldValue(templateValues.fields, field, newValue);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  // Handle expose toggle
  const handleExposeChange = useCallback(
    (field: DefaultValueField, exposed: boolean) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
          valueConfiguration,
          path,
          exposed
        );

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldExposed(
          templateValues.fields,
          field,
          exposed
        );

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  // Handle override toggle
  const handleOverrideChange = useCallback(
    (field: DefaultValueField, overridable: boolean) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
          valueConfiguration,
          path,
          overridable
        );

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldOverridable(
          templateValues.fields,
          field,
          overridable
        );

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Espaço para validação */}
      {showValidationFeedback && validationState && !validationState.isValid && (
        <div className="mb-2">
          <Alert variant="error" className="py-2">
            <AlertDescription>
              <ValidationDisplay
                errors={validationState.errors}
                warnings={validationState.warnings}
              />
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tabela principal com scroll area */}
      <ScrollArea className="h-full overflow-auto">
        <div data-testid="table-view" className="pb-4">
          <Table className="border-separate border-spacing-0">
            {/* Cabeçalho fixo */}
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[45%]" style={{ width: COLUMN_WIDTHS.field }}>
                  {t('values.table.fieldName')}
                </TableHead>
                <TableHead className="w-[10%]" style={{ width: COLUMN_WIDTHS.type }}>
                  {t('values.table.type')}
                </TableHead>
                <TableHead className="w-[12%]" style={{ width: COLUMN_WIDTHS.defaultValue }}>
                  {t('values.table.defaultValue')}
                </TableHead>
                <TableHead className="w-[20%]" style={{ width: COLUMN_WIDTHS.value }}>
                  {t('values.table.value')}
                </TableHead>
                <TableHead className="w-[5%] text-center" style={{ width: COLUMN_WIDTHS.exposed }}>
                  {t('values.table.exposed')}
                </TableHead>
                <TableHead
                  className="w-[6%] text-center"
                  style={{ width: COLUMN_WIDTHS.overridable }}
                >
                  {t('values.table.overridable')}
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Corpo da tabela com campos */}
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t('values.table.noFields')}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRows
                  fields={fields}
                  onSourceChange={handleSourceChange}
                  onValueChange={handleValueChange}
                  onExposeChange={handleExposeChange}
                  onOverrideChange={handleOverrideChange}
                  blueprintVariables={blueprintVariables}
                  showValidationFeedback={showValidationFeedback}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
});

// Add display name to the memoized component
TableView.displayName = 'TableView';
