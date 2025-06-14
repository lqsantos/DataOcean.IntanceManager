/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import { Maximize, Minimize } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValueConfiguration } from '@/types/blueprint';

import { BatchActions } from './BatchActions';
import type { FilterState } from './EnhancedFilterControls';
import { EnhancedFilterControls } from './EnhancedFilterControls';
import { TableView } from './TableComponents/TableView';
import type { DefaultValueField, TemplateDefaultValues } from './types';
import { ValueSourceType } from './types';
import { legacyFieldsToValueConfiguration } from './ValueConfigurationConverter';

// Define TypedValueConfigurationProps type
export interface TypedValueConfigurationProps {
  useTypedValueConfiguration?: boolean;
  onValueConfigurationChange?: (
    valueConfig: ValueConfiguration,
    isFilteredConfig?: boolean
  ) => void;
}

// Update EnhancedTemplateValueEditorProps to extend TypedValueConfigurationProps
export interface EnhancedTemplateValueEditorProps extends TypedValueConfigurationProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables?: Array<{ name: string; value: string }>;
  onChange: (values: TemplateDefaultValues) => void;
  showBatchActions?: boolean;
  onFieldsChange?: (fields: DefaultValueField[]) => void;
  onValidationChange?: (
    isValid: boolean,
    errors: Array<{ message: string; path?: string[] }>,
    warnings: Array<{ message: string; path?: string[] }>,
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>
  ) => void;
}

export const TemplateValueEditor = React.memo<EnhancedTemplateValueEditorProps>(
  ({
    templateValues,
    blueprintVariables = [],
    onChange,
    showBatchActions = false,
    onFieldsChange,
    onValidationChange: _onValidationChange,
    useTypedValueConfiguration = false,
    onValueConfigurationChange,
  }) => {
    const { t } = useTranslation('blueprints');

    // Estado para controlar o modo expandido
    const [isExpandedMode, setIsExpandedMode] = useState<boolean>(false);

    // Estado para armazenar a configuração tipada quando useTypedValueConfiguration=true
    const [_valueConfig, setValueConfig] = useState<ValueConfiguration | null>(
      useTypedValueConfiguration ? legacyFieldsToValueConfiguration(templateValues.fields) : null
    );

    // Estado dos filtros inicial com a nova estrutura que inclui customized
    const [filterState, setFilterState] = useState<FilterState>({
      fieldName: '',
      exposed: false,
      overridable: false,
      customized: false,
    });

    // Compute typed config only when fields change
    const computedValueConfig = useMemo(() => {
      if (useTypedValueConfiguration) {
        return legacyFieldsToValueConfiguration(templateValues.fields);
      }

      return null;
    }, [useTypedValueConfiguration, templateValues.fields]);

    // Update local state only when computed config changes
    useEffect(() => {
      if (useTypedValueConfiguration && computedValueConfig) {
        // Compare with current state to avoid unnecessary updates
        if (!_valueConfig || JSON.stringify(computedValueConfig) !== JSON.stringify(_valueConfig)) {
          setValueConfig(computedValueConfig);
        }
      }
    }, [useTypedValueConfiguration, computedValueConfig, _valueConfig]);

    // Notify parent only when local state changes and we have a handler
    useEffect(() => {
      // Check if we need to notify the parent
      const shouldNotify =
        useTypedValueConfiguration &&
        _valueConfig &&
        computedValueConfig &&
        onValueConfigurationChange;

      if (shouldNotify) {
        // Deep comparison to avoid unnecessary updates
        const currentStr = JSON.stringify(_valueConfig);
        const computedStr = JSON.stringify(computedValueConfig);

        // Only notify parent if the actual content has changed
        if (currentStr !== computedStr) {
          // Pass false for isFilteredConfig to indicate this is the full config
          onValueConfigurationChange(_valueConfig, false);
        }
      }
    }, [useTypedValueConfiguration, _valueConfig, onValueConfigurationChange, computedValueConfig]);

    // Removido cálculo de tipos disponíveis que não é mais necessário com a nova interface de filtragem

    // Toggle function for expanded mode
    const toggleExpandedMode = useCallback(() => {
      setIsExpandedMode((prev) => !prev);
    }, []);

    // Handle filter changes with the correct type
    const handleFilterChange = useCallback(
      (newFilters: FilterState) => {
        // Só atualiza se houver alterações reais
        if (JSON.stringify(newFilters) === JSON.stringify(filterState)) {
          return;
        }

        setFilterState(newFilters);
      },
      [filterState]
    );

    // Implementação da lógica de filtragem de campos baseada nos novos filtros simplificados
    const filteredFields = useMemo(() => {
      if (!templateValues.fields) {
        return [];
      }

      // Se não há filtros ativos, retornamos todos os campos
      if (
        !filterState.fieldName &&
        !filterState.exposed &&
        !filterState.overridable &&
        !filterState.customized
      ) {
        return templateValues.fields;
      }

      // Função auxiliar que verifica se um campo ou seus filhos atendem aos critérios de busca
      const fieldMatchesFilters = (field: DefaultValueField): boolean => {
        // Verificação para o campo atual
        if (filterState.fieldName) {
          const searchTerm = filterState.fieldName.toLowerCase();
          const keyMatch = field.key.toLowerCase().includes(searchTerm);
          const displayNameMatch = field.displayName
            ? field.displayName.toLowerCase().includes(searchTerm)
            : false;
          const pathMatch = field.path.join('.').toLowerCase().includes(searchTerm);

          // Se este campo não corresponde diretamente, mas temos filhos, devemos verificá-los também
          if (!keyMatch && !displayNameMatch && !pathMatch) {
            // Se temos filhos, verificamos se algum deles corresponde
            if (field.children && field.children.length > 0) {
              // Se algum filho corresponder, este campo deve ser incluído
              const hasMatchingChild = field.children.some((childField) =>
                fieldMatchesFilters(childField)
              );

              if (!hasMatchingChild) {
                return false;
              }
            } else {
              // Sem filhos e sem correspondência direta
              return false;
            }
          }
        }

        // Filtro por campos expostos
        if (filterState.exposed && !field.exposed) {
          return false;
        }

        // Filtro por campos sobreescritíveis
        if (filterState.overridable && !field.overridable) {
          return false;
        }

        // Filtro por campos customizados (que foram alterados pelo blueprint)
        if (filterState.customized && field.source === ValueSourceType.TEMPLATE) {
          // Se o filtro está ativo, retorna falso para qualquer campo que NÃO foi customizado
          return false;
        }

        return true;
      };

      // Aplicamos o filtro em todos os campos raiz
      const filtered = templateValues.fields.filter(fieldMatchesFilters);

      return filtered;
    }, [templateValues.fields, filterState]);

    return (
      <div className="mb-4 h-full min-h-0 flex-1 space-y-4">
        <div
          className={cn(
            'template-value-editor mt-1 flex h-full min-h-0 flex-col overflow-hidden rounded-md border',
            isExpandedMode ? 'editor-expanded-mode editor-expanded-animation' : 'p-2'
          )}
          data-testid="template-value-editor"
        >
          {/* Header section */}
          <div className={isExpandedMode ? 'editor-header' : 'mb-1 border-b pb-1'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                {!isExpandedMode && (
                  <h3 className="mr-2 font-medium">{t('values.editor.title')}</h3>
                )}
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="mr-1">
                    {templateValues.templateName}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {templateValues.templateVersion}
                  </Badge>
                </div>
              </div>

              {/* View Mode Toggle, batch actions, and expand button in the same row */}
              <div className="flex items-center gap-1">
                {showBatchActions && onFieldsChange && (
                  <BatchActions
                    fields={templateValues.fields}
                    onFieldsChange={onFieldsChange}
                    compact={true}
                  />
                )}
                <Button
                  variant={isExpandedMode ? 'outline' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-8 w-8 transition-all',
                    isExpandedMode && 'border-primary text-primary hover:bg-primary/10'
                  )}
                  onClick={toggleExpandedMode}
                  title={isExpandedMode ? 'Exit Fullscreen' : 'Fullscreen Mode'}
                  data-testid="expand-mode-toggle"
                >
                  {isExpandedMode ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isExpandedMode ? 'Exit Fullscreen' : 'Fullscreen Mode'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          <div
            className={
              isExpandedMode
                ? 'editor-content'
                : 'flex h-full min-h-0 flex-1 flex-col overflow-hidden'
            }
          >
            <div className="flex flex-1 flex-col overflow-hidden">
              <EnhancedFilterControls
                currentFilters={filterState}
                onFilterChange={handleFilterChange}
              />

              <div className="h-full min-h-0 flex-1 overflow-hidden pb-1">
                <TableView
                  templateValues={{
                    ...templateValues,
                    fields: filteredFields,
                  }}
                  onChange={onChange}
                  blueprintVariables={blueprintVariables}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Add displayName to the memoized component
TemplateValueEditor.displayName = 'TemplateValueEditor';
