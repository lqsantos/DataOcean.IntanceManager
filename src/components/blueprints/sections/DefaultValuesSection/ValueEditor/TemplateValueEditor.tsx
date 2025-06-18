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

  const [isExpandedMode, setIsExpandedMode] = useState<boolean>(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const [filterState, setFilterState] = useState<FilterState>({
    fieldName: '',
    exposed: false,
    overridable: false,
    customized: false,
  });

  const { filteredFields, hasActiveFilters, detectCustomization, matchingFieldPaths } =
    useSharedFiltering(templateValues.fields || [], filterState);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilterState(newFilters);
  }, []);

  const toggleExpandedMode = useCallback(() => {
    setIsExpandedMode((prev) => !prev);
  }, []);

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
            <EnhancedFilterControls
              currentFilters={filterState}
              onFilterChange={handleFilterChange}
              onExpandAllFields={expandAllFields}
              onCollapseAllFields={collapseAllFields}
            />

            <div className="h-full min-h-0 flex-1 overflow-hidden pb-1">
              <TableViewContainer
                templateValues={templateValues}
                blueprintVariables={blueprintVariables}
                filteredFields={filteredFields}
                hasActiveFilters={hasActiveFilters}
                expandedPaths={expandedPaths}
                setExpandedPaths={setExpandedPaths}
                matchingFieldPaths={matchingFieldPaths}
                expandAllFieldsRef={expandAllFieldsRef}
                collapseAllFieldsRef={collapseAllFieldsRef}
                onChange={(updatedValues) => {
                  if (hasActiveFilters) {
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

                    const mergeWithFullList = (
                      fullList: DefaultValueField[],
                      updatedFilteredList: DefaultValueField[]
                    ): DefaultValueField[] => {
                      const updMap = new Map(
                        updatedFilteredList.map((field) => [field.path.join('.'), field])
                      );

                      const applyChanges = (fields: DefaultValueField[]): DefaultValueField[] => {
                        return fields.map((field) => {
                          const path = field.path.join('.');
                          const updField = updMap.get(path);

                          if (updField) {
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

                    if (isSourceChanged) {
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

      {showBatchActions && onFieldsChange && (
        <BatchActions fields={templateValues.fields || []} onFieldsChange={onFieldsChange} />
      )}
    </div>
  );
};

TemplateValueEditorBase.displayName = 'TemplateValueEditorBase';

export const TemplateValueEditor = React.memo(TemplateValueEditorBase);
