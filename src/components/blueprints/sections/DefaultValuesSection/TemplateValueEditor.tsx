/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { BatchActions } from './BatchActions';
import type { FilterOptions } from './FilterControls';
import { FilterControls } from './FilterControls';
import { TableView } from './TableView';
import type { TemplateDefaultValues, TemplateValueEditorProps } from './types';
import { formatYaml, validateYamlAgainstSchema } from './utils';
import { ViewMode, ViewToggle } from './ViewToggle';

export const TemplateValueEditor: React.FC<TemplateValueEditorProps> = React.memo(
  ({
    templateValues,
    blueprintVariables = [],
    onChange,
    showBatchActions = false,
    onFieldsChange,
    onValidationChange,
  }) => {
    const { t } = useTranslation(['blueprints']);

    // View mode state (table or YAML)
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);

    // Editor state
    const [editorContent, setEditorContent] = useState(templateValues.rawYaml);
    const [debouncedContent] = useDebounce(editorContent, 500);

    type ValidationWarning = { message: string; path?: string[] };
    type VariableWarning = { message: string; path?: string[]; variableName?: string };

    interface ValidationState {
      isValid: boolean;
      errors: Array<{ message: string; path?: string[] }>;
      warnings: Array<ValidationWarning>;
      variableWarnings: Array<VariableWarning>;
    }

    const [validation, setValidation] = useState<ValidationState>({
      isValid: true,
      errors: [],
      warnings: [],
      variableWarnings: [],
    });

    // Estado para controlar quando mostrar erros de validação
    const [showValidationFeedback, setShowValidationFeedback] = useState(false);

    // Filter options for the table view
    const [filters, setFilters] = useState<FilterOptions>({
      searchQuery: '',
      fieldType: null,
      onlyExposed: false,
      onlyCustomized: false,
    });

    const handleEditorChange = useCallback((value: string | undefined) => {
      if (value !== undefined) {
        setEditorContent(value);
      }
    }, []);

    // Removed showValidationToasts - validation feedback is now shown in TableView modal

    // Validate editor content when it changes
    useEffect(() => {
      if (!debouncedContent) {
        return;
      }

      const validateContent = async () => {
        try {
          // Enhanced YAML validation with built-in variable validation
          const validationResult = validateYamlAgainstSchema(
            debouncedContent,
            templateValues.fields,
            blueprintVariables
          );

          // Update validation state with complete results
          if (validationResult.isValid) {
            // Document is already validated and processed

            // Set complete validation state
            const updatedState: ValidationState = {
              isValid: validationResult.isValid,
              errors: validationResult.errors,
              warnings: validationResult.warnings || [],
              variableWarnings: validationResult.variableWarnings || [],
            };

            // If schema validation is available for this template, perform it
            try {
              const { fetchTemplateJsonSchema } = await import(
                '@/services/template-schema-service'
              );

              // Check if we have a template ID to validate against
              if (templateValues.templateId) {
                const schemas = await fetchTemplateJsonSchema(templateValues.templateId);

                // Validate against all schema parts
                // Assuming schemas is an array of json schema objects
                const validationResults = Array.isArray(schemas)
                  ? schemas.map((_: unknown) => {
                      try {
                        return { isValid: true, errors: [] }; // Placeholder for actual validation
                      } catch (err) {
                        return { isValid: false, errors: [{ message: String(err) }] };
                      }
                    })
                  : [];

                // Collect errors from schema validation
                const schemaErrors = validationResults
                  .filter((result: { isValid: boolean }) => !result.isValid)
                  .flatMap((result: { errors: Array<{ message: string }> }) => result.errors);

                // Update validation state with schema results
                const hasSchemaErrors = schemaErrors.length > 0;

                if (hasSchemaErrors) {
                  updatedState.isValid = false;
                  updatedState.errors = [...updatedState.errors, ...schemaErrors];
                }
              }
            } catch (err) {
              // Schema validation is optional, so we just log the error
              console.warn('Schema validation failed', err);
            }

            setValidation(updatedState);

            // We'll notify the parent at the end of the effect
          } else {
            // YAML is invalid, update state with parse errors
            setValidation({
              isValid: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings || [],
              variableWarnings: validationResult.variableWarnings || [],
            });

            // We'll notify the parent at the end of the effect
          }
        } catch (error) {
          // Something went wrong with validation
          const errorState = {
            isValid: false,
            errors: [{ message: String(error) }],
            warnings: [],
            variableWarnings: [],
          };

          setValidation(errorState);

          // We'll notify the parent at the end of the effect
        }
      };

      validateContent().catch(console.error);
      // Exclude onValidationChange and t from dependencies to prevent an infinite loop
    }, [debouncedContent, blueprintVariables, templateValues.fields, templateValues.templateId]);

    // Add a separate effect to notify parent of validation changes
    // This prevents validation updates from re-triggering the main validation effect
    useEffect(() => {
      // Only notify parent when showValidationFeedback is true or if we have no errors/warnings
      if (onValidationChange && (showValidationFeedback || validation.isValid)) {
        onValidationChange(
          validation.isValid,
          validation.errors,
          validation.warnings,
          validation.variableWarnings
        );
      }
    }, [validation, showValidationFeedback, onValidationChange]);

    // Filter fields based on current filters
    const filteredFields = useMemo(() => {
      return templateValues.fields.filter((field) => {
        if (!field) {
          return false;
        }

        // Apply text search filter
        if (
          filters.searchQuery &&
          !field.key.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !(field.description || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !field.path.join('.').toLowerCase().includes(filters.searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Apply exposed filter
        if (filters.onlyExposed && !field.exposed) {
          return false;
        }

        // Apply customized filter
        if (filters.onlyCustomized && field.source !== 'blueprint') {
          return false;
        }

        // Apply type filter
        if (filters.fieldType) {
          if (filters.fieldType === 'overridable' && !field.overridable) {
            return false;
          } else if (filters.fieldType === 'required' && !field.required) {
            return false;
          }
        }

        return true;
      });
    }, [templateValues.fields, filters]);

    // Update view mode
    const handleViewModeChange = useCallback((mode: ViewMode) => {
      setViewMode(mode);
    }, []);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters: FilterOptions) => {
      setFilters(newFilters);
    }, []);

    const handleValueChange = useCallback(() => {
      // Se o usuário está interagindo com os campos, ativamos o feedback de validação
      if (!showValidationFeedback) {
        // Opcionalmente, podemos adicionar um delay para não mostrar imediatamente
        setTimeout(() => {
          setShowValidationFeedback(true);
        }, 1000); // Espera 1 segundo após interação antes de mostrar
      }
    }, [showValidationFeedback]);

    // Handle field updates from table view
    const handleFieldsUpdate = useCallback(
      (updatedTemplateValues: TemplateDefaultValues) => {
        handleValueChange();
        onChange(updatedTemplateValues);
      },
      [onChange, handleValueChange]
    );

    return (
      <div
        className="mt-4 flex flex-col overflow-hidden rounded-md border p-4"
        data-testid="template-value-editor"
      >
        <div className="mb-4 border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="mr-4 text-lg font-medium">{t('values.editor.title')}</h3>
              <div>
                <Badge variant="outline" className="mr-2">
                  {templateValues.templateName}
                </Badge>
                <Badge variant="secondary">{templateValues.templateVersion}</Badge>
              </div>
            </div>

            {/* View Mode Toggle and batch actions in the same row */}
            <div className="flex items-center gap-2">
              {showBatchActions && onFieldsChange && (
                <BatchActions
                  fields={templateValues.fields}
                  onFieldsChange={onFieldsChange}
                  compact={true}
                />
              )}
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                inline={true}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {viewMode === ViewMode.TABLE ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Filter Controls */}
              <FilterControls filters={filters} onFilterChange={handleFilterChange} />

              {/* Table View com h-full e flex-1 para preencher o espaço disponível */}
              <div className="h-full min-h-0 flex-1 overflow-hidden pb-1">
                <TableView
                  templateValues={{
                    ...templateValues,
                    fields: filteredFields,
                  }}
                  onChange={handleFieldsUpdate}
                  blueprintVariables={blueprintVariables}
                  validationState={validation}
                  showValidationFeedback={showValidationFeedback}
                />
              </div>
            </div>
          ) : (
            <>
              {/* YAML Editor - adapt to available space */}
              <div
                className="relative min-h-[400px] flex-1 rounded-md border"
                data-testid="yaml-editor-container"
              >
                <Editor
                  height="400px"
                  language="yaml"
                  value={editorContent}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                  loading={
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  }
                />
              </div>

              {/* Blueprint Variables References */}
              {blueprintVariables.length > 0 && (
                <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
                  <div className="mb-1 text-sm text-slate-600">
                    {t('values.editor.availableVariables')}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {blueprintVariables.map((variable) => (
                      <Badge
                        key={variable.name}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          const pattern = `\${${variable.name}}`;

                          setEditorContent((content) => `${content}${pattern}`);
                        }}
                      >
                        {variable.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditorContent(templateValues.rawYaml)}
                  data-testid="reset-editor-button"
                >
                  {t('values.editor.resetButton')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedYaml = formatYaml(editorContent);

                    setEditorContent(formattedYaml);
                  }}
                  data-testid="format-yaml-button"
                >
                  {t('values.editor.formatYaml')}
                </Button>
                <Button
                  disabled={!validation.isValid}
                  onClick={() => {
                    // Sempre ativar o feedback de validação ao tentar aplicar
                    setShowValidationFeedback(true);

                    if (validation.isValid) {
                      // Format the YAML for consistency
                      const formattedYaml = formatYaml(editorContent);

                      // Apply changes if valid with formatted YAML
                      onChange({
                        ...templateValues,
                        rawYaml: formattedYaml,
                      });

                      // Update editor with formatted YAML
                      setEditorContent(formattedYaml);

                      // Show success toast
                      toast.success(t('values.toast.successApplied'));

                      // Reset o estado da validação após aplicar mudanças válidas
                      setShowValidationFeedback(false);
                    } else {
                      // Validation errors are now shown in the TableView modal
                      toast.error(t('values.toast.errorApplied'));
                    }
                  }}
                  data-testid="apply-changes-button"
                >
                  {t('values.editor.applyButton')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

// Add display name to the memoized component
TemplateValueEditor.displayName = 'TemplateValueEditor';
