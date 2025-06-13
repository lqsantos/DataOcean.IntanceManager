/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 * Includes both table view and YAML editor view with toggle
 */

import { Maximize, Minimize } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValueConfiguration, ValueType } from '@/types/blueprint';
import { valueConfigurationToYaml, yamlToValueConfiguration } from '@/types/blueprint';

import { BatchActions } from './BatchActions';
import { EnhancedFilterControls } from './EnhancedFilterControls';
import type { FilterOptions } from './FilterControls';
import { TableView } from './TableComponents/TableView';
import type { EnhancedTemplateValueEditorProps, TemplateDefaultValues } from './types';
import { ValueSourceType } from './types';
// Importamos apenas a função de validação que ainda é necessária para o TableView
import { validateYamlAgainstSchema } from './utils';
import {
  filterValueConfigurationFields,
  legacyFieldsToValueConfiguration,
} from './ValueConfigurationConverter';

export const TemplateValueEditor: React.FC<EnhancedTemplateValueEditorProps> = React.memo(
  ({
    templateValues,
    blueprintVariables = [],
    onChange,
    showBatchActions = false,
    onFieldsChange,
    onValidationChange,
    useTypedValueConfiguration = false,
    onValueConfigurationChange,
  }) => {
    const { t } = useTranslation(['blueprints']);

    // Estado para controlar o modo expandido
    const [isExpandedMode, setIsExpandedMode] = useState<boolean>(false);

    // Estado para armazenar a configuração tipada quando useTypedValueConfiguration=true
    const [valueConfig, setValueConfig] = useState<ValueConfiguration | null>(
      useTypedValueConfiguration ? legacyFieldsToValueConfiguration(templateValues.fields) : null
    );

    // Efeito para converter os campos quando mudam e estamos usando a configuração tipada
    useEffect(() => {
      if (useTypedValueConfiguration) {
        // Converter os campos da estrutura antiga para a nova quando mudam
        const newConfig = legacyFieldsToValueConfiguration(templateValues.fields);

        setValueConfig(newConfig);

        // Notificar o componente pai sobre a mudança na configuração tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(newConfig);
        }
      }
    }, [useTypedValueConfiguration, templateValues.fields, onValueConfigurationChange]);

    // Toggle function for expanded mode
    const toggleExpandedMode = useCallback(() => {
      setIsExpandedMode((prev) => !prev);
    }, []);

    // Mantemos o debouncedContent para validação, mas agora sempre baseado no rawYaml
    const [debouncedContent] = useDebounce(templateValues.rawYaml, 500);

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

    // handleEditorChange removido - não é mais necessário

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
      // Se estamos usando a nova estrutura tipada, usamos o filterValueConfigurationFields
      if (useTypedValueConfiguration && valueConfig) {
        const filteredConfig = filterValueConfigurationFields(valueConfig, filters);
        // Converte de volta para o formato antigo para compatibilidade com os componentes atuais

        type FieldValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

        return Object.values(filteredConfig).map((fieldConfig) => {
          const pathString = fieldConfig.path;
          const pathParts = pathString.split('.');

          return {
            key: pathString,
            displayName: pathParts[pathParts.length - 1],
            value: fieldConfig.value as FieldValue,
            originalValue: fieldConfig.templateDefault as FieldValue | undefined,
            source: fieldConfig.isCustomized ? ValueSourceType.BLUEPRINT : ValueSourceType.TEMPLATE,
            exposed: fieldConfig.isExposed,
            overridable: fieldConfig.isOverridable,
            required: fieldConfig.isRequired ?? false,
            type: fieldConfig.type,
            path: pathParts,
            children: [],
          };
        });
      }

      // Caso contrário, usamos o filtro tradicional
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
        if (filters.fieldType && filters.fieldType !== 'all') {
          if (field.type !== filters.fieldType) {
            return false;
          }
        }

        return true;
      });
    }, [templateValues.fields, filters, useTypedValueConfiguration, valueConfig]);

    // Funcionalidades para conversão YAML <-> ValueConfiguration
    // Estas funções estão disponíveis para uso futuro na integração com outras partes do sistema
    const _convertYamlToValueConfig = useCallback(
      (yaml: string): ValueConfiguration => {
        // Extrair as informações de tipo e valores padrão dos campos atuais
        const templateFieldsInfo = templateValues.fields.map((field) => ({
          path: field.path.join('.'),
          type: field.type as ValueType,
          defaultValue: field.originalValue,
        }));

        return yamlToValueConfiguration(yaml, templateFieldsInfo);
      },
      [templateValues.fields]
    );

    const _convertValueConfigToYaml = useCallback((config: ValueConfiguration): string => {
      return valueConfigurationToYaml(config);
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

        // Se estamos usando a configuração tipada, atualizamos o estado e notificamos o pai
        if (useTypedValueConfiguration) {
          const newConfig = legacyFieldsToValueConfiguration(updatedTemplateValues.fields);

          setValueConfig(newConfig);

          if (onValueConfigurationChange) {
            onValueConfigurationChange(newConfig);
          }
        }

        onChange(updatedTemplateValues);
      },
      [onChange, handleValueChange, useTypedValueConfiguration, onValueConfigurationChange]
    );

    return (
      <>
        {isExpandedMode && <div className="fullscreen-overlay" />}
        <div
          className={cn(
            'template-value-editor mt-1 flex flex-col overflow-hidden rounded-md border',
            isExpandedMode ? 'editor-expanded-mode editor-expanded-animation' : 'p-2'
          )}
          data-testid="template-value-editor"
        >
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
                {/* ViewToggle removido, mantendo apenas o modo TABLE */}
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
            className={isExpandedMode ? 'editor-content' : 'flex flex-1 flex-col overflow-hidden'}
          >
            {/* Table View é a única opção disponível agora */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Filter Controls */}
              <EnhancedFilterControls
                filters={filters}
                onFilterChange={handleFilterChange}
                valueConfiguration={valueConfig || undefined}
                useTypedValueConfiguration={useTypedValueConfiguration}
                onFilteredValueConfigChange={(filteredFields) => {
                  // Se estamos usando a estrutura tipada e temos um handler para notificar mudanças
                  if (useTypedValueConfiguration && onValueConfigurationChange && valueConfig) {
                    // Criamos uma nova configuração com apenas os campos filtrados
                    const filteredConfig = {
                      ...valueConfig,
                      fields: filteredFields,
                    };

                    // Opcionalmente, podemos notificar o componente pai sobre os campos filtrados
                    // Isso permite que componentes externos façam otimizações com base no filtro
                    if (onValueConfigurationChange) {
                      onValueConfigurationChange(filteredConfig, true); // O segundo parâmetro indica que são campos filtrados
                    }
                  }
                }}
                compact={true}
                _isExpandedMode={isExpandedMode}
              />

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
          </div>
        </div>
      </>
    );
  }
);

// Add display name to the memoized component
TemplateValueEditor.displayName = 'TemplateValueEditor';
