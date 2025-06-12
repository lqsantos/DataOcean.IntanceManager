/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import Editor from '@monaco-editor/react';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { validateYamlAgainstSchema } from './utils/yaml-validator';
import { ViewMode, ViewToggle } from './ViewToggle';

export const TemplateValueEditor: React.FC<TemplateValueEditorProps> = ({
  templateValues,
  blueprintVariables = [],
  onChange,
  showBatchActions = false,
  onFieldsChange,
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

  // Filter options for the table view
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    showOnlyExposed: false,
    showOnlyCustomized: false,
    showOnlyOverridable: false,
  });

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  }, []);

  // Show validation feedback as toast notifications
  const showValidationToasts = useCallback(
    (validationState: ValidationState) => {
      // Dismiss all existing validation toasts
      toast.dismiss('validation-errors');
      toast.dismiss('validation-warnings');
      toast.dismiss('variable-warnings');

      // Show error toasts if any
      if (validationState.errors.length > 0) {
        toast.error(
          <div>
            <div className="mb-2 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('values.validation.errorTitle')}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validationState.errors.map((error, index) => (
                <li key={`error-${index}`} data-testid={`validation-error-${index}`}>
                  {error.message}
                  {error.path && (
                    <span className="block text-xs opacity-75">
                      {t('values.validation.atPath', { path: error.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          {
            id: 'validation-errors',
            duration: 8000,
          }
        );
      }

      // Show warning toasts if any
      if (validationState.warnings.length > 0) {
        toast.warning(
          <div>
            <div className="mb-2 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('values.validation.warningTitle')}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validationState.warnings.map((warning, index) => (
                <li key={`warning-${index}`} data-testid={`validation-warning-${index}`}>
                  {warning.message}
                  {warning.path && (
                    <span className="block text-xs opacity-75">
                      {t('values.validation.atPath', { path: warning.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          {
            id: 'validation-warnings',
            duration: 8000,
          }
        );
      }

      // Show variable warning toasts if any
      if (validationState.variableWarnings.length > 0) {
        toast.info(
          <div>
            <div className="mb-2 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">{t('values.validation.warningTitle')}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validationState.variableWarnings.map((warning, index) => (
                <li key={`var-warning-${index}`} data-testid={`variable-warning-${index}`}>
                  {warning.message}
                  {warning.variableName && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {warning.variableName}
                    </Badge>
                  )}
                  {warning.path && (
                    <span className="block text-xs opacity-75">
                      {t('values.validation.atPath', { path: warning.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          {
            id: 'variable-warnings',
            duration: 8000,
          }
        );
      }
    },
    [t]
  );

  // Validate editor content when it changes
  useEffect(() => {
    if (!debouncedContent) {
      return;
    }

    const validateContent = async () => {
      try {
        // Basic YAML validation
        const validationResult = validateYamlAgainstSchema(debouncedContent, templateValues.fields);

        // Update validation state with basic results
        if (validationResult.isValid) {
          const document = validationResult.document as Record<string, unknown>;

          // Set base validation state
          const validationState: ValidationState = {
            isValid: validationResult.isValid,
            errors: validationResult.errors,
            warnings: validationResult.warnings || [],
            variableWarnings: [],
          };

          // Check for variables usage (if document is valid)
          const declaredVariableNames = blueprintVariables.map((v) => v.name);
          const variableUsageRegex = /\${([\w.-]+)}/g;
          const yamlString = JSON.stringify(document);

          // Collect all unique variable names used in the YAML
          const usedVariables = new Set<string>();
          let match;

          while ((match = variableUsageRegex.exec(yamlString)) !== null) {
            usedVariables.add(match[1]);
          }

          const updatedState: ValidationState = {
            isValid: validationState.isValid,
            errors: validationState.errors,
            warnings: validationState.warnings,
            variableWarnings: [],
          };

          // Check for undeclared variables
          const variableWarnings: VariableWarning[] = [];

          usedVariables.forEach((variableName) => {
            if (!declaredVariableNames.includes(variableName)) {
              variableWarnings.push({
                message: `Variable "${variableName}" is not declared in blueprint variables`,
                variableName,
              });
            }
          });

          if (variableWarnings.length > 0) {
            updatedState.variableWarnings = variableWarnings;
          }

          // If schema validation is available for this template, perform it
          try {
            const { fetchTemplateJsonSchema } = await import('@/services/template-schema-service');

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

          // Show toast notifications for warnings and variable warnings
          if (updatedState.warnings.length > 0 || updatedState.variableWarnings.length > 0) {
            showValidationToasts(updatedState);
          }
        } else {
          // YAML is invalid, update state with parse errors
          const updatedState = {
            isValid: false,
            errors: validationResult.errors,
            warnings: validationResult.warnings || [],
            variableWarnings: [],
          };

          setValidation(updatedState);

          // Show toast notifications for errors
          showValidationToasts(updatedState);
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

        // Show toast notifications for errors
        showValidationToasts(errorState);
      }
    };

    validateContent().catch(console.error);
  }, [
    debouncedContent,
    blueprintVariables,
    t,
    templateValues.fields,
    templateValues.templateId,
    showValidationToasts,
  ]);

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

      // Apply overridable filter
      if (filters.fieldType === 'overridable' && !field.overridable) {
        return false;
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

  // Handle field updates from table view
  const handleFieldsUpdate = useCallback(
    (updatedTemplateValues: TemplateDefaultValues) => {
      onChange(updatedTemplateValues);
    },
    [onChange]
  );

  return (
    <div className="mt-4 rounded-md border p-4" data-testid="template-value-editor">
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
            <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} inline={true} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {viewMode === ViewMode.TABLE ? (
          <>
            {/* Filter Controls */}
            <FilterControls filters={filters} onFilterChange={handleFilterChange} />

            {/* Table View */}
            <TableView
              templateValues={{
                ...templateValues,
                fields: filteredFields,
              }}
              onChange={handleFieldsUpdate}
              blueprintVariables={blueprintVariables}
            />
          </>
        ) : (
          <>
            {/* YAML Editor */}
            <div
              className="relative h-[400px] rounded-md border"
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
                disabled={!validation.isValid}
                onClick={() => {
                  if (validation.isValid) {
                    // Apply changes if valid
                    onChange({
                      ...templateValues,
                      rawYaml: editorContent,
                    });

                    // Show success toast
                    toast.success('Changes applied successfully');
                  } else {
                    // Show validation errors as toast
                    showValidationToasts(validation);
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
};
