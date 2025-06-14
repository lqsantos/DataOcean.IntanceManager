/**
 * ContractPreview component
 * Provides a consolidated view of the blueprint configuration contract
 */

import { Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField, DefaultValuesContract, TemplateDefaultValues } from './types';
import { countFieldsWithProperty, getExposedFields } from './ValueConfigurationConverter';

interface ContractPreviewProps {
  contract: DefaultValuesContract;
  valueConfigMap?: Record<string, ValueConfiguration>;
}

/**
 * ContractPreview component that shows the consolidated configuration contract
 * between the blueprint and its instances
 */
export function ContractPreview({ contract, valueConfigMap }: ContractPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('yaml');
  const { t } = useTranslation(['blueprints']);

  // Flag para controlar o uso da nova estrutura tipada
  const useTypedValueConfiguration = !!valueConfigMap && Object.keys(valueConfigMap).length > 0;

  // Don't render anything if the contract is not initialized
  if (!contract?.initialized) {
    return null;
  }

  /**
   * Extract only exposed fields from a field array (formato legado)
   */
  const getExposedFieldsLegacy = (
    fields: DefaultValueField[] | undefined
  ): Record<string, Record<string, unknown>> => {
    if (!fields || !Array.isArray(fields)) {
      return {};
    }

    return fields.reduce((acc: Record<string, Record<string, unknown>>, field) => {
      if (!field) {
        return acc;
      }

      if (field.exposed) {
        // For object fields, recursively process their children
        if (field.type === 'object' && field.children) {
          const exposedChildren = getExposedFieldsLegacy(field.children);

          if (Object.keys(exposedChildren).length > 0) {
            acc[field.key] = {
              value: exposedChildren,
              overridable: field.overridable,
              source: field.source,
            };
          }
        } else {
          // For simple fields, add them directly
          acc[field.key] = {
            value: field.value,
            overridable: field.overridable,
            source: field.source,
          };
        }
      }

      return acc;
    }, {});
  };

  /**
   * Count fields with a specific property set to true (formato legado)
   */
  const countFieldsWithPropertyLegacy = (
    fields: DefaultValueField[] | undefined,
    property: 'exposed' | 'overridable'
  ): number => {
    if (!fields || !Array.isArray(fields)) {
      return 0;
    }

    return fields.reduce((count, field) => {
      if (!field) {
        return count;
      }

      let fieldCount = field[property] ? 1 : 0;

      if (field.children) {
        fieldCount += countFieldsWithPropertyLegacy(field.children, property);
      }

      return count + fieldCount;
    }, 0);
  };

  /**
   * Count exposed fields in templates, usando a estrutura adequada
   */
  const countExposedFields = (templates: TemplateDefaultValues[] | undefined): number => {
    if (!templates || !Array.isArray(templates)) {
      return 0;
    }

    if (useTypedValueConfiguration && valueConfigMap) {
      // Usar a nova estrutura tipada para contar campos expostos
      return templates.reduce((count, template) => {
        const valueConfig = valueConfigMap[template.templateId];

        if (!valueConfig) {
          return count;
        }

        return count + countFieldsWithProperty(valueConfig, 'isExposed');
      }, 0);
    }

    // Fallback para o formato legado
    return templates.reduce((count, template) => {
      if (!template?.fields) {
        return count;
      }

      return count + countFieldsWithPropertyLegacy(template.fields, 'exposed');
    }, 0);
  };

  /**
   * Count overridable fields in templates, usando a estrutura adequada
   */
  const countOverridableFields = (templates: TemplateDefaultValues[] | undefined): number => {
    if (!templates || !Array.isArray(templates)) {
      return 0;
    }

    if (useTypedValueConfiguration && valueConfigMap) {
      // Usar a nova estrutura tipada para contar campos sobreescrevíveis
      return templates.reduce((count, template) => {
        const valueConfig = valueConfigMap[template.templateId];

        if (!valueConfig) {
          return count;
        }

        return count + countFieldsWithProperty(valueConfig, 'isOverridable');
      }, 0);
    }

    // Fallback para o formato legado
    return templates.reduce((count, template) => {
      if (!template?.fields) {
        return count;
      }

      return count + countFieldsWithPropertyLegacy(template.fields, 'overridable');
    }, 0);
  };

  /**
   * Generate an exposed contract with only exposed fields
   */
  const generateExposedContract = () => {
    if (!contract?.templateValues) {
      return { templateValues: [] };
    }

    if (useTypedValueConfiguration && valueConfigMap) {
      // Usar a nova estrutura tipada para gerar o contrato
      return {
        templateValues: contract.templateValues.map((template) => {
          const valueConfig = valueConfigMap[template.templateId];

          if (!valueConfig) {
            return {
              templateId: template.templateId,
              templateName: template.templateName,
              templateVersion: template.templateVersion,
              exposedFields: {},
            };
          }

          const exposedFields = getExposedFields(valueConfig);

          // Convertemos para o formato esperado pelo contrato
          const exposedContract: Record<string, Record<string, unknown>> = {};

          Object.entries(exposedFields).forEach(([path, field]) => {
            exposedContract[path] = {
              value: field.value,
              overridable: field.isOverridable,
              source: field.isCustomized ? 'blueprint' : 'template',
            };
          });

          return {
            templateId: template.templateId,
            templateName: template.templateName,
            templateVersion: template.templateVersion,
            exposedFields: exposedContract,
          };
        }),
      };
    }

    // Fallback para o formato legado
    return {
      templateValues: contract.templateValues.map((template) => ({
        templateId: template.templateId,
        templateName: template.templateName,
        templateVersion: template.templateVersion,
        exposedFields: getExposedFieldsLegacy(template.fields),
      })),
    };
  };

  /**
   * Download the contract as a JSON file
   */
  const downloadContract = () => {
    const exposedContract = generateExposedContract();
    const blob = new Blob([JSON.stringify(exposedContract, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'blueprint-contract.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  /**
   * Generate a human-readable summary of the contract
   */
  const generateContractSummary = () => {
    if (!contract?.templateValues) {
      return (
        <div className="space-y-4 text-sm">
          <p>No template values available.</p>
        </div>
      );
    }

    const exposedCount = countExposedFields(contract.templateValues);
    const overridableCount = countOverridableFields(contract.templateValues);
    const templateCount = contract.templateValues.length;

    return (
      <div className="space-y-4 text-sm">
        <p>
          This blueprint exposes {exposedCount} fields across {templateCount} templates, with{' '}
          {overridableCount} fields allowing instance override.
        </p>

        <div className="space-y-2">
          {contract.templateValues.map((template) => {
            if (!template) {
              return null;
            }

            const templateExposedCount = countExposedFields([template]);

            return (
              <div key={template.templateId} className="flex justify-between">
                <span>{template.templateName}</span>
                <span className="text-muted-foreground">{templateExposedCount} fields</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render the contract preview dialog content
   */
  const renderContractPreview = () => {
    const exposedContract = generateExposedContract();

    return (
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('values.contractPreview.dialogTitle')}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="yaml">YAML</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="yaml" className="data-[state=active]:block">
              <div className="relative max-h-[400px] overflow-auto rounded-md bg-muted p-4">
                <pre className="text-sm">{JSON.stringify(exposedContract, null, 2)}</pre>
              </div>
            </TabsContent>

            <TabsContent value="json" className="data-[state=active]:block">
              <div className="relative max-h-[400px] overflow-auto rounded-md bg-muted p-4">
                <pre className="text-sm">{JSON.stringify(exposedContract, null, 2)}</pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={downloadContract}>
              <Download className="mr-2 h-4 w-4" />
              {t('values.contractPreview.downloadJson')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="mt-6 rounded-md border p-4" data-testid="contract-preview">
      <div className="mb-4 border-b pb-3">
        <h3 className="text-lg font-medium">{t('values.contractPreview.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('values.contractPreview.description')}</p>
      </div>

      <div className="space-y-4">
        {generateContractSummary()}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            {t('values.contractPreview.viewContract')}
          </Button>
        </div>

        {renderContractPreview()}
      </div>
    </div>
  );
}
