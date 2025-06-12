/**
 * ContractPreview component
 * Provides a consolidated view of the blueprint configuration contract
 */

import { Download, Eye } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { DefaultValueField, DefaultValuesContract, TemplateDefaultValues } from './types';

interface ContractPreviewProps {
  contract: DefaultValuesContract;
}

/**
 * ContractPreview component that shows the consolidated configuration contract
 * between the blueprint and its instances
 */
export function ContractPreview({ contract }: ContractPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('yaml');

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
          This blueprint exposes {exposedCount} fields across {templateCount}{' '}
          templates, with {overridableCount} fields allowing instance override.
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
            <DialogTitle>Configuration Contract</DialogTitle>
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
              Download JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="mt-6" data-testid="contract-preview">
      <CardHeader className="pb-3">
        <CardTitle>Configuration Contract</CardTitle>
        <CardDescription>
          Preview the configuration contract between this blueprint and its instances
        </CardDescription>
      </CardHeader>

      <CardContent>
        {generateContractSummary()}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Contract
          </Button>
        </div>

        {renderContractPreview()}
      </CardContent>
    </Card>
  );
}
