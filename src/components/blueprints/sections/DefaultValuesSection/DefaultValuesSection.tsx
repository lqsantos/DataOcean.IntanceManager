/**
 * DefaultValuesSection component
 * Main component for the Blueprint Values section that allows users to define
 * default values, exposure, and override permissions for template fields
 */

import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlueprintForm } from '@/contexts/blueprint-form-context';
import { fetchTemplateSchemaForDefaultValues } from '@/services/template-schema-service';
import type { ValueConfiguration } from '@/types/blueprint';
import { logError } from '@/utils/errorLogger';

import { ContractFloatingButton } from './ContractFloatingButton';
import { ErrorBoundary } from './ErrorBoundary';
import { TemplateTabsNavigation } from './TemplateTabsNavigation';
import { TemplateValueEditor } from './TemplateValueEditor';
import type { DefaultValueField, DefaultValuesContract, TemplateDefaultValues } from './types';
import { legacyFieldsToValueConfiguration } from './ValueConfigurationConverter';

// Flag para controlar a migração gradual para a nova estrutura tipada
// No futuro, quando toda a aplicação estiver migrada, pode ser removido e definido como true permanentemente
const USE_TYPED_VALUE_CONFIGURATION = true;

export const DefaultValuesSection = () => {
  // Get blueprint form data from context
  const { state, setSectionData } = useBlueprintForm();

  // Extract selected templates from form state
  const selectedTemplates = state.formData.templates.selectedTemplates.map((template) => ({
    id: template.templateId,
    name: template.identifier,
    version: '1.0.0', // This should come from the template data in a real implementation
  }));

  // Extract blueprint variables from form state
  const blueprintVariables = state.formData.variables.variables.map((variable) => ({
    name: variable.name,
    value: variable.defaultValue || '',
  }));

  const { t } = useTranslation(['blueprints']);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValuesContract, setDefaultValuesContract] = useState<DefaultValuesContract>({
    templateValues: [],
    initialized: false,
  });

  // Estados adicionais para ValueConfiguration
  const [valueConfigMap, setValueConfigMap] = useState<Record<string, ValueConfiguration>>({});

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templatesValidation, setTemplatesValidation] = useState<
    Record<
      string,
      {
        hasErrors: boolean;
        hasWarnings: boolean;
      }
    >
  >({});

  // Função para atualizar o estado de validação
  const updateTemplateValidation = useCallback(
    (
      templateId: string,
      isValid: boolean,
      errors: Array<{ message: string; path?: string[] }> = [],
      warnings: Array<{ message: string; path?: string[] }> = [],
      variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }> = []
    ) => {
      // Only update if the validation state has actually changed
      setTemplatesValidation((prev) => {
        const current = prev[templateId];
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0 || variableWarnings.length > 0;

        // If the validation state hasn't changed, don't trigger a re-render
        if (current && current.hasErrors === hasErrors && current.hasWarnings === hasWarnings) {
          return prev;
        }

        // Otherwise, update the state with the new values
        return {
          ...prev,
          [templateId]: { hasErrors, hasWarnings },
        };
      });
    },
    []
  );

  // Initialize or update the default values contract when templates change
  useEffect(() => {
    const initializeDefaultValues = async () => {
      if (selectedTemplates.length === 0) {
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Helper function to check if existing values match current templates
        const initialValuesMatchTemplates = (): boolean => {
          const currentValues = state.formData.values.values;

          return (
            Object.keys(currentValues).length === selectedTemplates.length &&
            selectedTemplates.every((template) => currentValues[template.id])
          );
        };

        // If we have existing values in the form context, use them
        if (initialValuesMatchTemplates()) {
          // Convert form context values to our contract format
          const templateValues = selectedTemplates.map((template) => {
            const templateValues = state.formData.values.values[template.id] || {};

            // Try to get fields from the stored context or default to empty array
            const fields = (templateValues.fields as DefaultValueField[]) || [];

            return {
              templateId: template.id,
              templateName: template.name,
              templateVersion: template.version,
              fields: fields,
              rawYaml:
                typeof templateValues.yaml === 'string'
                  ? templateValues.yaml
                  : JSON.stringify(templateValues.yaml || {}, null, 2),
            };
          });

          const contract: DefaultValuesContract = {
            templateValues,
            initialized: true,
          };

          setDefaultValuesContract(contract);

          // Only set the selected template ID if one isn't already selected or the current selection is invalid
          if (
            !selectedTemplateId ||
            !templateValues.some((t) => t.templateId === selectedTemplateId)
          ) {
            setSelectedTemplateId(templateValues[0]?.templateId || '');
          }
          setLoading(false);

          return;
        }

        // Otherwise fetch schema from API for each template
        const templateSchemas = await Promise.all(
          selectedTemplates.map(async (template) => {
            try {
              const schema = await fetchTemplateSchemaForDefaultValues(template.id);

              return {
                templateId: template.id,
                templateName: template.name,
                templateVersion: template.version,
                fields: schema.fields,
                rawYaml: schema.rawYaml,
              };
            } catch (err) {
              logError(err, `Failed to fetch schema for template ${template.id}`);
              throw err;
            }
          })
        );

        const newContract: DefaultValuesContract = {
          templateValues: templateSchemas,
          initialized: true,
        };

        setDefaultValuesContract(newContract);

        // Only set the selected template ID if one isn't already selected or the current selection is invalid
        if (
          !selectedTemplateId ||
          !templateSchemas.some((t) => t.templateId === selectedTemplateId)
        ) {
          setSelectedTemplateId(templateSchemas[0]?.templateId || '');
        }

        // Update the form context with new values
        const valuesForContext: Record<string, Record<string, unknown>> = {};

        templateSchemas.forEach((schema) => {
          valuesForContext[schema.templateId] = {
            yaml: schema.rawYaml,
            fields: schema.fields, // Preserve fields in the context
          };
        });

        setSectionData('values', { values: valuesForContext });
      } catch (err) {
        logError('Error initializing default values:', String(err));
        setError('Failed to load template schemas');
      } finally {
        setLoading(false);
      }
    };

    // Add a slight delay to simulate API call
    const timeoutId = setTimeout(initializeDefaultValues, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedTemplates, state.formData.values.values, setSectionData]);

  // Handle template tab selection
  const handleSelectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
  }, []);

  // Handle value configuration changes (nova função)
  const handleValueConfigurationChange = useCallback(
    (templateId: string, updatedValueConfig: ValueConfiguration, isFilteredConfig = false) => {
      // Se não for configuração filtrada, atualizamos o estado
      if (!isFilteredConfig) {
        // Check if the value config has actually changed
        setValueConfigMap((prev) => {
          const currentConfig = prev[templateId];

          // Skip update if the configuration is identical (deep comparison)
          if (
            currentConfig &&
            JSON.stringify(currentConfig) === JSON.stringify(updatedValueConfig)
          ) {
            return prev; // Return unchanged state to avoid re-render
          }

          // Otherwise update with new config
          return {
            ...prev,
            [templateId]: updatedValueConfig,
          };
        });

        // Atualizamos também no form context para ser salvo - only if needed
        const currentValues = { ...state.formData.values.values };
        const currentConfig = currentValues[templateId]?.valueConfiguration;

        // Skip update if the configuration is identical (deep comparison)
        if (currentConfig && JSON.stringify(currentConfig) === JSON.stringify(updatedValueConfig)) {
          return; // Skip update to avoid unnecessary state changes
        }

        if (!currentValues[templateId]) {
          currentValues[templateId] = {};
        }

        // Armazenamos a configuração tipada no formato do estado do formulário
        currentValues[templateId].valueConfiguration = updatedValueConfig;

        setSectionData('values', { values: currentValues });
      }
    },
    [state.formData.values.values, setSectionData]
  );

  // Handle template value changes
  const handleTemplateValueChange = useCallback(
    (updatedTemplateValues: TemplateDefaultValues) => {
      // Update the contract
      const updatedContract = {
        ...defaultValuesContract,
        templateValues: defaultValuesContract.templateValues.map((tv) =>
          tv.templateId === updatedTemplateValues.templateId ? updatedTemplateValues : tv
        ),
      };

      setDefaultValuesContract(updatedContract);

      // Se estamos usando a configuração tipada, convertemos os campos para ValueConfiguration
      if (USE_TYPED_VALUE_CONFIGURATION) {
        const valueConfig = legacyFieldsToValueConfiguration(updatedTemplateValues.fields);

        setValueConfigMap((prev) => ({
          ...prev,
          [updatedTemplateValues.templateId]: valueConfig,
        }));

        // Update form context with both formats
        const currentValues = { ...state.formData.values.values };

        if (!currentValues[updatedTemplateValues.templateId]) {
          currentValues[updatedTemplateValues.templateId] = {};
        }

        currentValues[updatedTemplateValues.templateId] = {
          yaml: updatedTemplateValues.rawYaml,
          fields: updatedTemplateValues.fields,
          valueConfiguration: valueConfig, // Adicionamos a configuração tipada
        };

        setSectionData('values', { values: currentValues });
      } else {
        // Original behavior without typed configuration
        const currentValues = { ...state.formData.values.values };

        currentValues[updatedTemplateValues.templateId] = {
          yaml: updatedTemplateValues.rawYaml,
          fields: updatedTemplateValues.fields,
        };

        setSectionData('values', { values: currentValues });
      }
    },
    [defaultValuesContract, state.formData.values.values, setSectionData]
  );

  // Render content based on state
  const renderContent = () => {
    if (selectedTemplates.length === 0) {
      return (
        <Alert data-testid="no-templates-alert">
          <div className="mb-2 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-muted-foreground" />
            <AlertTitle>{t('values.noTemplatesTitle')}</AlertTitle>
          </div>
          <AlertDescription>{t('values.noTemplatesDescription')}</AlertDescription>
        </Alert>
      );
    }

    if (loading) {
      return (
        <div className="space-y-4" data-testid="loading-skeleton">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" data-testid="error-alert">
          <div className="mb-2 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <AlertTitle>{t('values.errors.title')}</AlertTitle>
          </div>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    const selectedTemplate = defaultValuesContract.templateValues.find(
      (t) => t.templateId === selectedTemplateId
    );

    if (!selectedTemplate) {
      return null;
    }

    return (
      <>
        <ErrorBoundary>
          <TemplateTabsNavigation
            templates={selectedTemplates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            validationState={templatesValidation}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <TemplateValueEditor
            templateValues={selectedTemplate}
            blueprintVariables={blueprintVariables}
            onChange={handleTemplateValueChange}
            showBatchActions={true}
            onFieldsChange={(updatedFields: DefaultValueField[]) => {
              const updatedTemplate = {
                ...selectedTemplate,
                fields: updatedFields,
              };

              handleTemplateValueChange(updatedTemplate);
            }}
            onValidationChange={(isValid, errors, warnings, variableWarnings) => {
              updateTemplateValidation(
                selectedTemplate.templateId,
                isValid,
                errors,
                warnings,
                variableWarnings
              );
            }}
            // Nova estrutura tipada
            useTypedValueConfiguration={USE_TYPED_VALUE_CONFIGURATION}
            onValueConfigurationChange={(valueConfig, isFiltered) =>
              handleValueConfigurationChange(selectedTemplate.templateId, valueConfig, isFiltered)
            }
          />
        </ErrorBoundary>

        {/* Contract preview como botão flutuante no canto inferior direito */}
        <ErrorBoundary>
          <div className="fixed bottom-8 right-8 z-50">
            <ContractFloatingButton
              contract={defaultValuesContract}
              valueConfigMap={USE_TYPED_VALUE_CONFIGURATION ? valueConfigMap : undefined}
            />
          </div>
        </ErrorBoundary>
      </>
    );
  };

  return (
    <section className="flex h-full w-full flex-col" data-testid="default-values-section">
      <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>
    </section>
  );
};
