/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField, TemplateDefaultValues } from '../types';
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

  // Props para expansão e navegação de campos aninhados
  expandedPaths?: Set<string>;
  toggleFieldExpansion?: (path: string) => void;

  // Função para propagar toggles para filhos
  onTogglePropagation?: (
    field: DefaultValueField,
    action: 'expose' | 'override',
    value: boolean
  ) => { fieldPath: string; childPaths: string[] } | undefined;

  // Flag que indica se estamos usando o novo contexto
  useFieldsContext?: boolean;
}

// Interface estendida com propriedades adicionais para o suporte a ValueConfiguration
export interface EnhancedTableViewProps extends TableViewProps {
  useTypedValueConfiguration: boolean;
  valueConfiguration: ValueConfiguration | null;
  onValueConfigurationChange?: (updatedConfig: ValueConfiguration) => void;
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

  // Função auxiliar para encontrar um campo pelo caminho
  const findFieldByPath = useCallback(
    (fieldsToSearch: DefaultValueField[], pathSegments: string[]): DefaultValueField | null => {
      for (const field of fieldsToSearch) {
        if (
          field.path.length === pathSegments.length &&
          field.path.every((segment, i) => segment === pathSegments[i])
        ) {
          return field;
        }

        if (field.children && field.children.length > 0) {
          const found = findFieldByPath(field.children, pathSegments);

          if (found) {
            return found;
          }
        }
      }

      return null;
    },
    []
  );

  // Handle expose toggle with propagation to children
  const handleExposeChange = useCallback(
    (field: DefaultValueField, exposed: boolean) => {
      const path = field.path.join('.');

      // Verifica se estamos lidando com um nó folha (sem filhos) que é filho de outro nó
      // Verifica se temos um nó filho (se tem pai)
      const hasParent = field.path.length > 1;

      // Get child paths for propagation (both when enabling and disabling exposure)
      // Propaga tanto ao habilitar quanto ao desabilitar a exposição
      const propagationData =
        field.children && field.children.length > 0 && props.onTogglePropagation
          ? props.onTogglePropagation(field, 'expose', exposed)
          : undefined;

      // Process with ValueConfiguration if available
      if (useTypedValueConfiguration && valueConfiguration) {
        // Update the main field
        let updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
          valueConfiguration,
          path,
          exposed
        );

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          // Update each child to not be exposed
          propagationData.childPaths.forEach((childPath: string) => {
            // Propaga o mesmo estado de exposed para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
              updatedValueConfig,
              childPath,
              exposed
            );

            // Se exposed = false, precisamos desabilitar overridable também
            if (!exposed) {
              updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
                updatedValueConfig,
                childPath,
                false
              );
            }
          });
        }

        // Bottom-up propagation: If enabling a field, ensure ALL ancestors (including root) are also enabled
        if (exposed) {
          // Primeiro habilitamos todos os ancestrais diretos (pais, avós, etc.)
          if (hasParent) {
            const segments = path.split('.');

            // Para cada nível na hierarquia, garantimos que o ancestral está habilitado
            // Começamos do pai e vamos subindo até o root
            for (let i = segments.length - 1; i > 0; i--) {
              const ancestorPath = segments.slice(0, i).join('.');

              // Habilita o ancestral
              updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
                updatedValueConfig,
                ancestorPath,
                true
              );
            }
          }

          // Explicitamente habilitamos o nó raiz (root)
          // O nó raiz tem o caminho 'root'
          updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
            updatedValueConfig,
            'root',
            true
          );
        }

        // Notify about the changes
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Convert to old format for compatibility
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Use traditional logic
        let updatedFields = FieldService.updateFieldExposed(templateValues.fields, field, exposed);

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          // Update each child field
          propagationData.childPaths.forEach((childPath: string) => {
            // Find the field by its path
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Propaga o mesmo estado de exposed para os filhos
              updatedFields = FieldService.updateFieldExposed(
                updatedFields,
                fieldToUpdate,
                exposed
              );

              // Se exposed = false, precisamos desabilitar overridable também
              if (!exposed && fieldToUpdate.overridable) {
                updatedFields = FieldService.updateFieldOverridable(
                  updatedFields,
                  fieldToUpdate,
                  false
                );
              }
            }
          });
        }

        // Bottom-up propagation: If enabling a field, ensure ALL ancestors (including root) are also enabled
        if (exposed) {
          // Primeiro habilitamos todos os ancestrais diretos (pais, avós, etc.)
          if (hasParent) {
            const segments = path.split('.');

            // Para cada nível na hierarquia, garantimos que o ancestral está habilitado
            // Começamos do pai e vamos subindo até o root
            for (let i = segments.length - 1; i > 0; i--) {
              const ancestorPath = segments.slice(0, i).join('.');
              const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

              if (ancestorField && !ancestorField.exposed) {
                // Habilita o ancestral
                updatedFields = FieldService.updateFieldExposed(updatedFields, ancestorField, true);
              }
            }
          }

          // Explicitamente habilitamos o nó raiz (root)
          // O nó raiz tem o caminho 'root'
          const rootField = findFieldByPath(updatedFields, ['root']);

          if (rootField && !rootField.exposed) {
            updatedFields = FieldService.updateFieldExposed(updatedFields, rootField, true);
          }
        }

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
      props.onTogglePropagation,
      findFieldByPath,
    ]
  );

  // Handle override toggle with propagation to children
  const handleOverrideChange = useCallback(
    (field: DefaultValueField, overridable: boolean) => {
      const path = field.path.join('.');
      const hasParent = field.path.length > 1;

      // Get child paths for propagation (both when enabling and disabling override)
      // Propaga tanto ao habilitar quanto ao desabilitar o override
      const propagationData =
        field.children && field.children.length > 0 && props.onTogglePropagation
          ? props.onTogglePropagation(field, 'override', overridable)
          : undefined;

      if (useTypedValueConfiguration && valueConfiguration) {
        // Update the main field first
        let updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
          valueConfiguration,
          path,
          overridable
        );

        // If we're making a field overridable, it must also be exposed
        if (overridable && !field.exposed) {
          updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
            updatedValueConfig,
            path,
            true
          );
        }

        // Propagate to children if needed (only when making fields overridable)
        if (propagationData && propagationData.childPaths.length > 0) {
          propagationData.childPaths.forEach((childPath: string) => {
            // Propaga o mesmo estado de overridable para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
              updatedValueConfig,
              childPath,
              overridable
            );

            // Se overridable é true, o campo deve estar exposto
            if (overridable) {
              updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
                updatedValueConfig,
                childPath,
                true
              );
            }
          });
        }

        // Bottom-up propagation: If enabling override, ensure ALL ancestors (including root) are also enabled
        if (overridable) {
          // Primeiro habilitamos todos os ancestrais diretos (pais, avós, etc.)
          if (hasParent) {
            const segments = path.split('.');

            // Para cada nível na hierarquia, garantimos que o ancestral está habilitado e overridable
            // Começamos do pai e vamos subindo até o root
            for (let i = segments.length - 1; i > 0; i--) {
              const ancestorPath = segments.slice(0, i).join('.');

              // Habilita o ancestral (exposed e overridable)
              updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
                updatedValueConfig,
                ancestorPath,
                true
              );

              updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
                updatedValueConfig,
                ancestorPath,
                true
              );
            }
          }

          // Explicitamente habilitamos o nó raiz (root)
          // O nó raiz tem o caminho 'root'
          updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
            updatedValueConfig,
            'root',
            true
          );

          updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
            updatedValueConfig,
            'root',
            true
          );
        }

        // Notify about the changes
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Convert to old format for compatibility
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Use traditional logic
        let updatedFields = FieldService.updateFieldOverridable(
          templateValues.fields,
          field,
          overridable
        );

        // If we're making a field overridable, it must also be exposed
        if (overridable && !field.exposed) {
          updatedFields = FieldService.updateFieldExposed(updatedFields, field, true);
        }

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          propagationData.childPaths.forEach((childPath: string) => {
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Update override state
              updatedFields = FieldService.updateFieldOverridable(
                updatedFields,
                fieldToUpdate,
                overridable
              );

              // If overridable, the field must be exposed
              if (overridable && !fieldToUpdate.exposed) {
                updatedFields = FieldService.updateFieldExposed(updatedFields, fieldToUpdate, true);
              }
            }
          });
        }

        // Bottom-up propagation: If enabling override, ensure ALL ancestors (including root) are also enabled
        if (overridable) {
          // Primeiro habilitamos todos os ancestrais diretos (pais, avós, etc.)
          if (hasParent) {
            const segments = path.split('.');

            // Para cada nível na hierarquia, garantimos que o ancestral está habilitado e overridable
            // Começamos do pai e vamos subindo até o root
            for (let i = segments.length - 1; i > 0; i--) {
              const ancestorPath = segments.slice(0, i).join('.');
              const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

              if (ancestorField) {
                // Make sure ancestor is exposed
                if (!ancestorField.exposed) {
                  updatedFields = FieldService.updateFieldExposed(
                    updatedFields,
                    ancestorField,
                    true
                  );
                }

                // Make sure ancestor is also overridable
                if (!ancestorField.overridable) {
                  updatedFields = FieldService.updateFieldOverridable(
                    updatedFields,
                    ancestorField,
                    true
                  );
                }
              }
            }
          }

          // Explicitamente habilitamos o nó raiz (root)
          // O nó raiz tem o caminho 'root'
          const rootField = findFieldByPath(updatedFields, ['root']);

          if (rootField) {
            // Make sure root is exposed
            if (!rootField.exposed) {
              updatedFields = FieldService.updateFieldExposed(updatedFields, rootField, true);
            }

            // Make sure root is also overridable
            if (!rootField.overridable) {
              updatedFields = FieldService.updateFieldOverridable(updatedFields, rootField, true);
            }
          }
        }

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
      props.onTogglePropagation,
      findFieldByPath,
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
