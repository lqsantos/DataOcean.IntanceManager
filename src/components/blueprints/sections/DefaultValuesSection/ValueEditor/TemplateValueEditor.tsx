/**
 * Refactored TemplateValueEditor Component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import { Maximize, Minimize } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
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
    filterState
  );

  // Registra alterações no estado de filtros para debugging
  // Comentado para evitar loops infinitos de logs
  /* useEffect(() => {
    console.warn(
      '[TemplateValueEditor] Estado de filtros atualizado:',
      JSON.stringify(filterState),
      'Filtros ativos:',
      hasActiveFilters,
      'Campos filtrados:',
      filteredFields.length
    );
  }, [filterState, hasActiveFilters, filteredFields.length]); */

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

  // Simplified expand/collapse functions - delegate to context
  const expandAllFieldsRef = useRef<(() => void) | null>(null);
  const collapseAllFieldsRef = useRef<(() => void) | null>(null);

  // Simple callbacks that will be connected to the context
  const expandAllFields = useCallback(() => {
    if (expandAllFieldsRef.current) {
      expandAllFieldsRef.current();
    }
  }, []);

  const collapseAllFields = useCallback(() => {
    if (collapseAllFieldsRef.current) {
      collapseAllFieldsRef.current();
    }
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
                // Pass refs for expand/collapse functionality
                expandAllFieldsRef={expandAllFieldsRef}
                collapseAllFieldsRef={collapseAllFieldsRef}
                onChange={(updatedValues) => {
                  // Solução elegante para o bug: Quando alteramos campos em uma lista filtrada,
                  // sempre aplicamos essas alterações à lista completa original

                  // Se temos filtros ativos, precisamos aplicar as alterações à lista completa
                  if (hasActiveFilters) {
                    console.warn('[TemplateValueEditor] Alteração em lista filtrada detectada');

                    // Verificar se houve alguma alteração de source comparando os valores
                    const isSourceChanged = (() => {
                      const compareSourceChanges = (
                        orig: DefaultValueField[],
                        upd: DefaultValueField[]
                      ): boolean => {
                        const updMap = new Map(upd.map((f) => [f.path.join('.'), f]));

                        for (const field of orig) {
                          const path = field.path.join('.');
                          const updField = updMap.get(path);

                          if (updField && field.source !== updField.source) {
                            return true;
                          }

                          if (field.children?.length && updField?.children?.length) {
                            if (compareSourceChanges(field.children, updField.children)) {
                              return true;
                            }
                          }
                        }

                        return false;
                      };

                      return compareSourceChanges(
                        templateValues.fields || [],
                        updatedValues.fields || []
                      );
                    })();

                    // Função simples para mesclar as alterações com a lista completa
                    const mergeWithFullList = (
                      fullList: DefaultValueField[],
                      updatedFilteredList: DefaultValueField[]
                    ): DefaultValueField[] => {
                      // Criar um mapa dos campos atualizados para acesso rápido
                      const updMap = new Map(
                        updatedFilteredList.map((field) => [field.path.join('.'), field])
                      );

                      // Função recursiva que aplica as alterações
                      const applyChanges = (fields: DefaultValueField[]): DefaultValueField[] => {
                        return fields.map((field) => {
                          const path = field.path.join('.');
                          const updField = updMap.get(path);

                          // Se o campo foi alterado na lista filtrada, usamos a versão atualizada
                          if (updField) {
                            // Processamento recursivo para os filhos
                            if (field.children?.length && updField.children?.length) {
                              return {
                                ...updField,
                                children: applyChanges(field.children),
                              };
                            }

                            return updField;
                          }

                          // Processamento recursivo para os filhos não alterados
                          if (field.children?.length) {
                            return {
                              ...field,
                              children: applyChanges(field.children),
                            };
                          }

                          return field;
                        });
                      };

                      return applyChanges(fullList);
                    };

                    // Criar valores mesclados
                    const mergedValues = {
                      ...templateValues,
                      fields: mergeWithFullList(
                        templateValues.fields || [],
                        updatedValues.fields || []
                      ),
                    };

                    // Chamar o handler original com os valores mesclados
                    onChange(mergedValues);

                    // Mesmo que tenha ocorrido alteração de source, mantemos os filtros ativos
                    // respeitando a decisão do usuário de quando limpar os filtros
                    if (isSourceChanged) {
                      console.warn(
                        '[TemplateValueEditor] Alteração de source detectada, mantendo filtros'
                      );

                      // SOLUÇÃO CRÍTICA: Após customização, é importante criar completamente
                      // um NOVO objeto Set para evitar problemas de referência e garantir que
                      // o React detecte a mudança e atualize corretamente o estado de expansão
                      setExpandedPaths((prev) => {
                        // Garantimos uma nova referência do Set
                        return new Set(Array.from(prev));
                      });
                    }
                  } else {
                    // Sem filtros ativos, apenas passamos a mudança normalmente
                    onChange(updatedValues);

                    // Detectar se houve alteração de source para incrementar o contador
                    const wasSourceChanged = detectCustomization(
                      templateValues.fields || [],
                      updatedValues.fields || []
                    );

                    if (wasSourceChanged) {
                      // SOLUÇÃO CRÍTICA: Mesmo para quando não temos filtros ativos
                      // Forçar novo Set para garantir referência atualizada
                      setExpandedPaths((prev) => {
                        // Sempre garantimos uma nova referência do Set após customização
                        return new Set(Array.from(prev));
                      });
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
