/**
 * Refactored TemplateValueEditor Component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import { Maximize, Minimize } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { BatchActions } from '../BatchActions';
import { EnhancedFilterControls } from '../EnhancedFilterControls';
import type { DefaultValueField } from '../types';

import { TableViewContainer } from './TableViewContainer';
import type { FilterState, TemplateValueEditorProps } from './types';
import { useSharedFiltering } from './useSharedFiltering';

// Componente base do editor de valores do template
const TemplateValueEditorBase: React.FC<TemplateValueEditorProps> = ({
  templateValues,
  blueprintVariables = [],
  onChange,
  showBatchActions = false,
  onFieldsChange,
  onValidationChange: _onValidationChange,
  useTypedValueConfiguration: _useTypedValueConfiguration = false,
  onValueConfigurationChange: _onValueConfigurationChange,
}) => {
  const { t: _t } = useTranslation('blueprints');

  // State to control expanded mode
  const [isExpandedMode, setIsExpandedMode] = useState<boolean>(false);

  // State for expanded paths
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Estado de refresh para forçar re-renders
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Estado de filtros centralizado aqui
  const [filterState, setFilterState] = useState<FilterState>({
    fieldName: '',
    exposed: false,
    overridable: false,
    customized: false,
  });

  // Use o hook de filtragem compartilhada para calcular os campos filtrados
  const { filteredFields, hasActiveFilters, detectCustomization } = useSharedFiltering(
    templateValues.fields || [],
    filterState,
    refreshCounter
  );

  // Create a filter change handler
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    console.warn('[TemplateValueEditor] Atualizando filtros:', newFilters);
    setFilterState(newFilters);
  }, []);

  // We'll handle typed value configuration through the TableViewContainer

  // Toggle function for expanded mode
  const toggleExpandedMode = useCallback(() => {
    setIsExpandedMode((prev) => !prev);
  }, []);

  // Function to expand all fields (passed to filter controls)
  const expandAllFields = useCallback(() => {
    // Helper function to recursively collect all expandable paths
    const collectExpandablePaths = (fields: DefaultValueField[]) => {
      const paths = new Set<string>();

      fields.forEach((field) => {
        if (field.type === 'object' && field.children && field.children.length > 0) {
          // Add this object field's path
          paths.add(field.path.join('.'));
          // Recursively process its children
          field.children.forEach((child: DefaultValueField) => {
            const childPaths = collectExpandablePaths([child]);

            childPaths.forEach((p) => paths.add(p));
          });
        }
      });

      return paths;
    };

    // Start collecting from root fields
    const allExpandablePaths = collectExpandablePaths(templateValues.fields || []);

    // Update the expanded paths state with all expandable paths
    setExpandedPaths(allExpandablePaths);
  }, [templateValues.fields]);

  // Function to collapse all fields
  const collapseAllFields = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  return (
    <div className="mb-4 h-full min-h-0 flex-1 space-y-4">
      <div
        className={cn(
          'template-value-editor mt-1 flex h-full min-h-0 flex-col overflow-hidden rounded-md border',
          isExpandedMode ? 'editor-expanded-mode editor-expanded-animation' : 'p-2'
        )}
        data-testid="template-value-editor"
      >
        {/* Header bar with template name and actions */}
        <div
          className={cn(
            'flex items-center justify-between bg-muted/40 px-3 py-1',
            isExpandedMode && 'bg-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              Template Values
              <Badge variant="outline" className="ml-2">
                {templateValues.fields?.length || 0} fields
              </Badge>
            </h3>
          </div>

          <Button
            className="h-7 w-7 p-0"
            variant="ghost"
            size="icon"
            onClick={toggleExpandedMode}
            title={isExpandedMode ? 'Collapse mode' : 'Expand mode'}
          >
            {isExpandedMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>

        <div
          className={cn(
            'flex h-full min-h-0 flex-1 flex-col overflow-hidden',
            isExpandedMode && 'editor-expanded-content p-2'
          )}
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Filter controls */}
            <EnhancedFilterControls
              currentFilters={filterState}
              onFilterChange={handleFilterChange}
              onExpandAllFields={expandAllFields}
              onCollapseAllFields={collapseAllFields}
            />

            {/* Table view container */}
            <div className="h-full min-h-0 flex-1 overflow-hidden pb-1">
              <TableViewContainer
                templateValues={templateValues}
                blueprintVariables={blueprintVariables}
                // Passando os campos filtrados como props separadas
                filteredFields={filteredFields}
                hasActiveFilters={hasActiveFilters}
                expandedPaths={expandedPaths}
                setExpandedPaths={setExpandedPaths}
                onChange={(updatedValues) => {
                  // BUG FIX: Quando customizamos um campo filtrado, precisamos mesclar
                  // a customização com a lista completa original, não apenas com os campos filtrados

                  // Verificar se houve customização
                  const wasCustomized = detectCustomization(
                    templateValues.fields || [],
                    updatedValues.fields || []
                  );

                  if (wasCustomized && hasActiveFilters) {
                    console.warn('[TemplateValueEditor] Customização detectada em lista filtrada!');

                    // Função para mesclar a customização com a lista completa
                    const mergeCustomization = (
                      origFields: DefaultValueField[],
                      updatedFields: DefaultValueField[]
                    ): DefaultValueField[] => {
                      // Criar um mapa dos campos atualizados para fácil acesso
                      const updatedFieldsMap = new Map<string, DefaultValueField>();

                      updatedFields.forEach((field) => {
                        updatedFieldsMap.set(field.path.join('.'), field);
                      });

                      // Função recursiva para aplicar as customizações
                      const applyCustomizations = (
                        fields: DefaultValueField[]
                      ): DefaultValueField[] => {
                        return fields.map((field) => {
                          const path = field.path.join('.');
                          const updatedField = updatedFieldsMap.get(path);

                          // Se o campo foi atualizado, usamos a versão atualizada
                          if (updatedField) {
                            // Aplicar recursivamente para os filhos, se existirem
                            if (field.children && updatedField.children) {
                              return {
                                ...updatedField,
                                children: applyCustomizations(field.children),
                              };
                            }

                            return updatedField;
                          }

                          // Se tem filhos, processamos recursivamente
                          if (field.children && field.children.length > 0) {
                            return {
                              ...field,
                              children: applyCustomizations(field.children),
                            };
                          }

                          // Caso contrário, mantemos o campo original
                          return field;
                        });
                      };

                      return applyCustomizations(origFields);
                    };

                    // Criar uma nova versão dos valores mesclando as customizações
                    const origFields = templateValues.fields || [];
                    const updFields = updatedValues.fields || [];
                    const mergedValues = {
                      ...templateValues,
                      fields: mergeCustomization(origFields, updFields),
                    };

                    // Chamar o handler original com os valores mesclados
                    onChange(mergedValues);

                    console.warn('[TemplateValueEditor] Customização mesclada com lista completa');

                    // Limpar os filtros
                    setFilterState({
                      fieldName: '',
                      exposed: false,
                      overridable: false,
                      customized: false,
                    });

                    // Força re-render
                    setRefreshCounter((prev) => prev + 1);
                  } else {
                    // Sem customização ou sem filtros ativos, apenas propaga a mudança normalmente
                    onChange(updatedValues);

                    // Se houve customização mas sem filtros ativos, ainda atualizamos o contador
                    if (wasCustomized) {
                      setRefreshCounter((prev) => prev + 1);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Batch actions component */}
      {showBatchActions && onFieldsChange && (
        <BatchActions fields={templateValues.fields || []} onFieldsChange={onFieldsChange} />
      )}
    </div>
  );
};

// Adiciona o nome de exibição para o componente base
TemplateValueEditorBase.displayName = 'TemplateValueEditorBase';

// Exporta o componente memorizado
export const TemplateValueEditor = React.memo(TemplateValueEditorBase);
