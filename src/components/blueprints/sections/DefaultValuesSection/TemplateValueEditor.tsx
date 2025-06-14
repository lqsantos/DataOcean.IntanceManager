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

    // Estado para controlar campos expandidos na tabela (usado para expansão automática na busca)
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

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

    // Toggle function for field expansion - improved to handle both adding and removing paths
    const toggleFieldExpansion = useCallback((path: string) => {
      setExpandedPaths((prev) => {
        const newPaths = new Set(prev);

        if (newPaths.has(path)) {
          newPaths.delete(path);

          // If a parent path is collapsed, also collapse all child paths
          // This prevents orphaned expanded child paths when parent is collapsed
          const pathWithDot = `${path}.`;

          [...newPaths].forEach((existingPath) => {
            if (existingPath.startsWith(pathWithDot)) {
              newPaths.delete(existingPath);
            }
          });
        } else {
          newPaths.add(path);
        }

        return newPaths;
      });
    }, []);

    // Function to expand all object fields at all levels
    const expandAllFields = useCallback(() => {
      const allExpandablePaths = new Set<string>();

      // Helper function to recursively collect all expandable paths
      const collectExpandablePaths = (fields: DefaultValueField[]) => {
        fields.forEach((field) => {
          if (field.type === 'object' && field.children && field.children.length > 0) {
            // Add this object field's path
            allExpandablePaths.add(field.path.join('.'));
            // Recursively process its children
            collectExpandablePaths(field.children);
          }
        });
      };

      // Start collecting from root fields
      collectExpandablePaths(templateValues.fields || []);

      // Update the expanded paths state with all expandable paths
      setExpandedPaths(allExpandablePaths);
    }, [templateValues.fields]);

    // Function to collapse all fields (clear all expanded paths)
    const collapseAllFields = useCallback(() => {
      setExpandedPaths(new Set());
    }, []);

    // Function to expand all parent paths of a given field path
    // This ensures all parent nodes are expanded to reveal a nested match
    const expandParentPaths = useCallback((fieldPath: string) => {
      if (!fieldPath) {
        return;
      }

      const segments = fieldPath.split('.');

      // Create all parent paths (all paths except the full path itself)
      const parentPaths: string[] = [];

      for (let i = 1; i < segments.length; i++) {
        parentPaths.push(segments.slice(0, i).join('.'));
      }

      // Add all parent paths to the expanded set
      setExpandedPaths((prev) => {
        const newPaths = new Set(prev);

        // Add all parent paths
        parentPaths.forEach((path) => newPaths.add(path));

        return newPaths;
      });
    }, []);

    // Effect to automatically expand parent fields when search text changes
    // or when filter criteria change that might affect which fields are shown
    useEffect(() => {
      // If search is cleared, reset expanded paths
      if (!filterState.fieldName) {
        setExpandedPaths(new Set());

        return;
      }

      // Array to collect all paths of fields that match the search
      const matchingPaths: string[] = [];

      // Helper function to recursively search through all fields and their children
      const findMatchingFields = (fields: DefaultValueField[]) => {
        fields.forEach((field) => {
          const fieldPath = field.path.join('.');
          const searchTerm = filterState.fieldName.toLowerCase();

          // Check if this field matches the search in any way
          const keyMatch = field.key.toLowerCase().includes(searchTerm);
          const displayNameMatch = field.displayName
            ? field.displayName.toLowerCase().includes(searchTerm)
            : false;
          const pathMatch = fieldPath.toLowerCase().includes(searchTerm);

          if (keyMatch || displayNameMatch || pathMatch) {
            matchingPaths.push(fieldPath);
          }

          // Recursively check children
          if (field.children && field.children.length > 0) {
            findMatchingFields(field.children);
          }
        });
      };

      // Start recursive search from the root fields
      if (templateValues.fields) {
        findMatchingFields(templateValues.fields);
      }

      // Expand parent paths for all matching fields
      matchingPaths.forEach(expandParentPaths);
    }, [filterState.fieldName, templateValues.fields, expandParentPaths]);

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

    // Efeito para preservar o estado de campos expandidos quando os campos são modificados
    // Este efeito resolve o problema de colapso automático ao customizar campos
    useEffect(() => {
      // Se não houver campos expandidos ou filtros de busca ativos, não faz nada
      if (expandedPaths.size === 0) {
        return;
      }

      // Precisamos criar uma estrutura de referência para os campos atuais
      const pathsMap = new Map<string, DefaultValueField>();

      // Função recursiva para mapear todos os campos pela sua path
      const mapFieldsByPath = (fields: DefaultValueField[]) => {
        fields.forEach((field) => {
          const fullPath = field.path.join('.');

          pathsMap.set(fullPath, field);

          // Recursivamente mapeia os filhos
          if (field.children && field.children.length > 0) {
            mapFieldsByPath(field.children);
          }
        });
      };

      // Inicia o mapeamento a partir dos campos raiz
      if (templateValues.fields) {
        mapFieldsByPath(templateValues.fields);
      }

      // Preservar os campos expandidos, mas remover aqueles que não existem mais
      setExpandedPaths((prev) => {
        const validPaths = new Set<string>();

        // Verifica cada caminho expandido e mantém apenas os que ainda existem
        [...prev].forEach((path) => {
          if (pathsMap.has(path)) {
            validPaths.add(path);
          }
        });

        // Se o número de caminhos válidos for igual ao número original, não há alterações
        if (validPaths.size === prev.size) {
          return prev;
        }

        // Caso contrário, retorna o conjunto atualizado de caminhos expandidos
        return validPaths;
      });
    }, [templateValues.fields, expandedPaths]);

    // Efeito adicional para garantir que campos customizados permaneçam expandidos
    useEffect(() => {
      // Procura por campos customizados na estrutura
      const customizedFields: DefaultValueField[] = [];

      // Função recursiva para encontrar todos os campos customizados
      const findCustomizedFields = (fields: DefaultValueField[]) => {
        fields.forEach((field) => {
          if (field.source === ValueSourceType.BLUEPRINT) {
            customizedFields.push(field);
          }

          // Recursivamente procura nos filhos
          if (field.children && field.children.length > 0) {
            findCustomizedFields(field.children);
          }
        });
      };

      // Inicia a busca a partir dos campos raiz
      if (templateValues.fields) {
        findCustomizedFields(templateValues.fields);
      }

      // Se encontrarmos campos customizados, garantimos que seus pais estejam expandidos
      if (customizedFields.length > 0) {
        // Mantém um registro de quais campos adicionamos para expansão
        const pathsToExpand = new Set<string>();

        // Para cada campo customizado, expandimos seus campos pai
        customizedFields.forEach((field) => {
          // Obtém o caminho do campo customizado
          const fullPath = field.path.join('.');
          const segments = field.path;

          // Se o campo for um objeto aninhado, também garantimos que ele esteja expandido
          if (field.type === 'object' && !expandedPaths.has(fullPath)) {
            pathsToExpand.add(fullPath);
          }

          // Expandimos todos os pais deste campo (exceto o próprio campo)
          for (let i = 1; i < segments.length; i++) {
            const parentPath = segments.slice(0, i).join('.');

            if (!expandedPaths.has(parentPath)) {
              pathsToExpand.add(parentPath);
            }
          }
        });

        // Se temos novos caminhos para expandir, atualizamos o estado
        if (pathsToExpand.size > 0) {
          setExpandedPaths((prev) => {
            const newPaths = new Set(prev);

            pathsToExpand.forEach((path) => newPaths.add(path));

            return newPaths;
          });
        }
      }
    }, [templateValues.fields, expandedPaths]);

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
                onExpandAllFields={expandAllFields}
                onCollapseAllFields={collapseAllFields}
              />

              <div className="h-full min-h-0 flex-1 overflow-hidden pb-1">
                <TableView
                  templateValues={{
                    ...templateValues,
                    fields: filteredFields,
                  }}
                  onChange={onChange}
                  blueprintVariables={blueprintVariables}
                  expandedPaths={expandedPaths}
                  toggleFieldExpansion={toggleFieldExpansion}
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
