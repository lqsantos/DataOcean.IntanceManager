/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { DefaultValueField, EnhancedTableViewProps, TemplateDefaultValues } from '../types';
import { ValueSourceType } from '../types';
import { valueConfigurationToLegacyFields } from '../ValueConfigurationConverter';

// Importando componentes e constantes
import { EnhancedTableRows } from './EnhancedTableRows';
import * as FieldService from './fieldUpdateService';
import { COLUMN_WIDTHS } from './TableRows';
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
  // Novos props para expansão automática de campos aninhados
  expandedPaths?: Set<string>;
  toggleFieldExpansion?: (path: string) => void;
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
    expandedPaths,
    toggleFieldExpansion,
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
    <div className="mt-4 flex h-full min-h-0 flex-col" data-testid="table-view">
      {/* Validation Display Component */}
      <ValidationDisplay
        validationState={validationState}
        showValidationFeedback={showValidationFeedback}
      />

      {/* Table Container com uma única área de scroll para sincronizar cabeçalho e corpo */}
      <div className="flex h-full max-h-[calc(100vh-11rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
        <ScrollArea className="synchronized-scroll h-full flex-1">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full min-w-full table-fixed caption-bottom text-sm">
              <TableHeader className="sticky-table-header">
                <TableRow>
                  <TableHead style={{ width: COLUMN_WIDTHS.field }}>
                    {t('values.table.field')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.type }}>
                    {t('values.table.type')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.defaultValue }}>
                    {t('values.table.defaultValue')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.value }}>
                    {t('values.table.value')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: COLUMN_WIDTHS.exposed }}>
                    {t('values.table.exposed')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: COLUMN_WIDTHS.overridable }}>
                    {t('values.table.overridable')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="pb-8">
                {fields.length > 0 ? (
                  <EnhancedTableRows
                    fields={fields}
                    valueConfig={valueConfiguration || undefined}
                    useTypedValueConfiguration={useTypedValueConfiguration}
                    onSourceChange={handleSourceChange}
                    onValueChange={handleValueChange}
                    onExposeChange={handleExposeChange}
                    onOverrideChange={handleOverrideChange}
                    onValueConfigChange={onValueConfigurationChange}
                    blueprintVariables={blueprintVariables}
                    showValidationFeedback={showValidationFeedback}
                    expandedPaths={expandedPaths}
                    toggleFieldExpansion={toggleFieldExpansion}
                  />
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Alert>
                        <AlertDescription>{t('values.table.noFields')}</AlertDescription>
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </ScrollArea>
      </div>
      {/* Required Fields Legend - movida para dentro da área de scroll, mas fixada visualmente */}
      <div className="mb-2 text-right text-sm">
        <span className="mr-1 font-bold text-red-500">*</span>
        {t('values.validationMessages.required')}
      </div>
    </div>
  );
});

TableView.displayName = 'TableView';
