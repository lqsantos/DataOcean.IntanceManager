/**
 * ContractFloatingButton component
 * Provides a floating button to access the blueprint configuration contract
 */

import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { DefaultValueField, DefaultValuesContract, TemplateDefaultValues } from './types';

interface ContractFloatingButtonProps {
  contract: DefaultValuesContract;
}

/**
 * ContractFloatingButton component that shows a floating button
 * to access the configuration contract in a dialog
 */
export function ContractFloatingButton({ contract }: ContractFloatingButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const { t } = useTranslation(['blueprints']);

  // Posição do botão flutuante (pode ser ajustada via props)
  const buttonPosition = 'bottom-4 right-4';

  // Don't render anything if the contract is not initialized
  if (!contract?.initialized) {
    return null;
  }

  /**
   * Extract only exposed fields from a field array
   */
  const getExposedFields = (
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
          const exposedChildren = getExposedFields(field.children);

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
   * Count fields with a specific property set to true
   */
  const countFieldsWithProperty = (
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
        fieldCount += countFieldsWithProperty(field.children, property);
      }

      return count + fieldCount;
    }, 0);
  };

  /**
   * Count exposed fields in templates
   */
  const countExposedFields = (templates: TemplateDefaultValues[] | undefined): number => {
    if (!templates || !Array.isArray(templates)) {
      return 0;
    }

    return templates.reduce((count, template) => {
      if (!template?.fields) {
        return count;
      }

      return count + countFieldsWithProperty(template.fields, 'exposed');
    }, 0);
  };

  /**
   * Count overridable fields in templates
   */
  const countOverridableFields = (templates: TemplateDefaultValues[] | undefined): number => {
    if (!templates || !Array.isArray(templates)) {
      return 0;
    }

    return templates.reduce((count, template) => {
      if (!template?.fields) {
        return count;
      }

      return count + countFieldsWithProperty(template.fields, 'overridable');
    }, 0);
  };

  /**
   * Generate an exposed contract with only exposed fields
   */
  const generateExposedContract = () => {
    if (!contract?.templateValues) {
      return { templateValues: [] };
    }

    return {
      templateValues: contract.templateValues.map((template) => ({
        templateId: template.templateId,
        templateName: template.templateName,
        templateVersion: template.templateVersion,
        exposedFields: getExposedFields(template.fields),
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
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="data-[state=active]:block">
              <div className="space-y-4">{generateContractSummary()}</div>
            </TabsContent>

            <TabsContent value="json" className="data-[state=active]:block">
              <div className="relative max-h-[400px] overflow-auto rounded-md bg-muted p-4">
                <pre className="text-sm">{JSON.stringify(exposedContract, null, 2)}</pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={downloadContract}>
              <span className="mr-2">📥</span>
              {t('values.contractPreview.downloadJson')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Retorna apenas o botão flutuante com tooltip
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsPreviewOpen(true)}
              className={`floating-button floating-button-animation fixed ${buttonPosition} z-10 h-12 w-12`}
              variant="default"
              data-testid="contract-preview-button"
            >
              <Eye className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Visualizar contrato de configuração</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {renderContractPreview()}
    </>
  );
}
