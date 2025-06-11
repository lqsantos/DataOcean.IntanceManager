/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { FilterOptions } from './FilterControls';
import { FilterControls } from './FilterControls';
import { TableView } from './TableView';
import type { DefaultValueField, TemplateValueEditorProps } from './types';
import { updateFieldsFromYaml, validateYamlAgainstSchema } from './utils/yaml-validator';
import { ValidationFeedback } from './ValidationFeedback';
import { ViewMode, ViewToggle } from './ViewToggle';

export const TemplateValueEditor: React.FC<TemplateValueEditorProps> = ({
  templateValues,
  blueprintVariables = [],
  onChange,
}) => {
  const { t } = useTranslation(['blueprints']);

  // View mode state (table or YAML)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);

  // Editor state
  const [editorContent, setEditorContent] = useState(templateValues.rawYaml);
  const [debouncedContent] = useDebounce(editorContent, 500);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
  }>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Filter state for table view
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    fieldType: null,
    onlyCustomized: false,
    onlyExposed: false,
  });

  // Function to handle editor content changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  }, []);

  // Validate YAML when debounced content changes
  useEffect(() => {
    if (!debouncedContent) {
      return;
    }

    const validationResult = validateYamlAgainstSchema(debouncedContent, templateValues.fields);

    setValidation({
      isValid: validationResult.isValid,
      errors: validationResult.errors || [],
      warnings: validationResult.warnings || [],
    });

    // If valid, update the template values with new values from YAML
    if (validationResult.isValid && validationResult.document) {
      const document = validationResult.document as Record<string, unknown>;
      const updatedFields = updateFieldsFromYaml(templateValues.fields, document);

      onChange({
        ...templateValues,
        fields: updatedFields,
        rawYaml: debouncedContent,
      });
    }
  }, [debouncedContent, templateValues, onChange]);

  // Setup completion items for variables
  const handleEditorMount = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  // Reset editor content when template changes
  useEffect(() => {
    setEditorContent(templateValues.rawYaml);
  }, [templateValues.templateId, templateValues.rawYaml]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  // Filtered fields for table view
  const filteredFields = useMemo(() => {
    if (
      !filters.searchQuery &&
      !filters.fieldType &&
      !filters.onlyCustomized &&
      !filters.onlyExposed
    ) {
      return templateValues.fields;
    }

    const filterField = (field: DefaultValueField): boolean => {
      // Filter by search query
      const hasSearchQuery = !!filters.searchQuery;
      const fieldKey = field.key.toLowerCase();
      const searchQuery = filters.searchQuery.toLowerCase();
      const matchesKey = !hasSearchQuery || fieldKey.includes(searchQuery);
      const matchesDisplay =
        !hasSearchQuery ||
        (field.displayName && field.displayName.toLowerCase().includes(searchQuery));
      const matchesSearch = matchesKey || matchesDisplay;

      // Filter by field type
      const matchesType = !filters.fieldType || field.type === filters.fieldType;

      // Filter by customization
      const matchesCustomized = !filters.onlyCustomized || field.source === 'blueprint';

      // Filter by exposure
      const matchesExposed = !filters.onlyExposed || field.exposed;

      return Boolean(matchesSearch && matchesType && matchesCustomized && matchesExposed);
    };

    // Deep copy and filter
    const deepFilter = (fields: DefaultValueField[]): DefaultValueField[] => {
      return fields
        .filter(filterField)
        .map((field) => {
          if (field.children && field.children.length) {
            return {
              ...field,
              children: deepFilter(field.children),
            };
          }

          return field;
        })
        .filter((field) => {
          // Keep fields that match filters or have children that match
          return filterField(field) || (field.children && field.children.length > 0);
        });
    };

    return deepFilter(templateValues.fields);
  }, [templateValues.fields, filters]);

  return (
    <Card className="mt-4" data-testid="template-value-editor">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('defaultValues.editor.title')}</CardTitle>
          <div>
            <Badge variant="outline" className="mr-2">
              {templateValues.templateName}
            </Badge>
            <Badge variant="secondary">{templateValues.templateVersion}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* View Toggle */}
        <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />

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
              blueprintVariables={blueprintVariables}
              onChange={onChange}
            />
          </>
        ) : (
          <>
            {/* YAML Editor View */}
            <div
              className="relative h-[400px] rounded-md border"
              data-testid="monaco-editor-container"
            >
              {!isEditorReady && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              <Editor
                height="400px"
                language="yaml"
                value={editorContent}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  folding: true,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                }}
              />
            </div>

            {/* Variable Help */}
            {blueprintVariables.length > 0 && (
              <div className="mt-4 text-sm">
                <p className="mb-2 font-medium">{t('defaultValues.editor.availableVariables')}</p>
                <div className="flex flex-wrap gap-2">
                  {blueprintVariables.map((variable) => (
                    <Badge
                      key={variable.name}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        // Insert variable placeholder at cursor position
                        const placeholder = `{{ .Values.${variable.name} }}`;

                        setEditorContent((prev) => `${prev || ''}\n${placeholder}`);
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
                {t('defaultValues.editor.resetButton')}
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
                  }
                }}
                data-testid="apply-changes-button"
              >
                {t('defaultValues.editor.applyButton')}
              </Button>
            </div>
          </>
        )}

        {/* Validation Feedback - shown in both views */}
        <div className="mt-4">
          <ValidationFeedback errors={validation.errors} warnings={validation.warnings} />
        </div>
      </CardContent>
    </Card>
  );
};
