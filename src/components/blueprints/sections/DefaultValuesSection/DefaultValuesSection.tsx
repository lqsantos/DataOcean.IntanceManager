/**
 * DefaultValuesSection component
 * Main component for the Blueprint Values section that allows users to define
 * default values, exposure, and override permissions for template fields
 */

import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlueprintForm } from '@/contexts/blueprint-form-context';
import { fetchTemplateSchemaForDefaultValues } from '@/services/template-schema-service';
import { logError } from '@/utils/errorLogger';

import { BatchActions } from './BatchActions';
import { ContractPreview } from './ContractPreview';
import { ErrorBoundary } from './ErrorBoundary';
import { TemplateTabsNavigation } from './TemplateTabsNavigation';
import { TemplateValueEditor } from './TemplateValueEditor';
import type { DefaultValuesContract, TemplateDefaultValues } from './types';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Variable warnings are now handled by the TemplateValueEditor

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

            return {
              templateId: template.id,
              templateName: template.name,
              templateVersion: template.version,
              fields: [], // In a real implementation, this would be reconstructed from the values
              rawYaml:
                typeof templateValues === 'string'
                  ? templateValues
                  : JSON.stringify(templateValues, null, 2),
            };
          });

          const contract: DefaultValuesContract = {
            templateValues,
            initialized: true,
          };

          setDefaultValuesContract(contract);
          setSelectedTemplateId(templateValues[0]?.templateId || '');
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
        setSelectedTemplateId(templateSchemas[0]?.templateId || '');

        // Update the form context with new values
        const valuesForContext: Record<string, Record<string, string>> = {};

        templateSchemas.forEach((schema) => {
          valuesForContext[schema.templateId] = { yaml: schema.rawYaml };
        });

        setSectionData('values', { values: valuesForContext });
      } catch (error) {
        logError(error, 'Error initializing default values contract');
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

      // Update form context
      const currentValues = { ...state.formData.values.values };

      currentValues[updatedTemplateValues.templateId] = { yaml: updatedTemplateValues.rawYaml };

      setSectionData('values', { values: currentValues });
    },
    [defaultValuesContract, state.formData.values.values, setSectionData, blueprintVariables]
  );

  // Render content based on state
  const renderContent = () => {
    if (selectedTemplates.length === 0) {
      return (
        <Alert data-testid="no-templates-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('defaultValues.noTemplatesTitle')}</AlertTitle>
          <AlertDescription>{t('defaultValues.noTemplatesDescription')}</AlertDescription>
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('defaultValues.errors.title')}</AlertTitle>
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
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="mb-4">
            <BatchActions
              fields={selectedTemplate.fields}
              onFieldsChange={(updatedFields) => {
                const updatedTemplate = {
                  ...selectedTemplate,
                  fields: updatedFields,
                };

                handleTemplateValueChange(updatedTemplate);
              }}
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <TemplateValueEditor
            templateValues={selectedTemplate}
            blueprintVariables={blueprintVariables}
            onChange={handleTemplateValueChange}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <ContractPreview contract={defaultValuesContract} />
        </ErrorBoundary>
      </>
    );
  };

  return (
    <Card className="w-full" data-testid="default-values-section">
      <CardHeader>
        <CardTitle>{t('defaultValues.title')}</CardTitle>
        <CardDescription>{t('defaultValues.description')}</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
