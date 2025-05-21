'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TemplatePreview as TemplatePreviewType } from '@/types/template';

import { Spinner } from '@/components/ui/spinner';

interface TemplatePreviewProps {
  preview: TemplatePreviewType | null;
  isLoading: boolean;
  error: string | null;
  'data-testid'?: string;
}

export function TemplatePreview({
  preview,
  isLoading,
  error,
  'data-testid': dataTestId = 'template-preview',
}: TemplatePreviewProps) {
  const [activeTab, setActiveTab] = useState('chart');

  if (isLoading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-testid={`${dataTestId}-loading`}
        data-state="loading"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        data-testid={`${dataTestId}-error`}
        data-state="error"
        data-error-message={error}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription data-testid={`${dataTestId}-error-text`}>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!preview) {
    return (
      <Alert variant="default" data-testid={`${dataTestId}-empty`} data-state="empty">
        <AlertDescription data-testid={`${dataTestId}-empty-text`}>
          Selecione um caminho válido para pré-visualizar os arquivos do template.
        </AlertDescription>
      </Alert>
    );
  }

  const hasChartYaml = !!preview.chartYaml;
  const hasValuesSchema = !!preview.valuesSchemaJson;
  const hasValuesYaml = !!preview.valuesYaml;

  return (
    <div
      className="rounded-md border"
      data-testid={dataTestId}
      data-state="loaded"
      data-has-chart={hasChartYaml ? 'true' : 'false'}
      data-has-schema={hasValuesSchema ? 'true' : 'false'}
      data-has-values={hasValuesYaml ? 'true' : 'false'}
      data-active-tab={activeTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid={`${dataTestId}-tabs`}>
        <TabsList className="w-full border-b" data-testid={`${dataTestId}-tabs-list`}>
          <TabsTrigger
            value="chart"
            disabled={!hasChartYaml}
            data-testid={`${dataTestId}-tab-chart`}
            data-available={hasChartYaml ? 'true' : 'false'}
          >
            Chart.yaml {!hasChartYaml && '(não encontrado)'}
          </TabsTrigger>
          <TabsTrigger
            value="schema"
            disabled={!hasValuesSchema}
            data-testid={`${dataTestId}-tab-schema`}
            data-available={hasValuesSchema ? 'true' : 'false'}
          >
            values.schema.json {!hasValuesSchema && '(não encontrado)'}
          </TabsTrigger>
          <TabsTrigger
            value="values"
            disabled={!hasValuesYaml}
            data-testid={`${dataTestId}-tab-values`}
            data-available={hasValuesYaml ? 'true' : 'false'}
          >
            values.yaml {!hasValuesYaml && '(não encontrado)'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="p-4" data-testid={`${dataTestId}-content-chart`}>
          {hasChartYaml ? (
            <pre
              className="max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-sm"
              data-testid={`${dataTestId}-chart-yaml-content`}
            >
              {preview.chartYaml}
            </pre>
          ) : (
            <Alert variant="default" data-testid={`${dataTestId}-chart-yaml-missing`}>
              <AlertDescription>
                O arquivo Chart.yaml não foi encontrado no caminho selecionado.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="schema" className="p-4" data-testid={`${dataTestId}-content-schema`}>
          {hasValuesSchema ? (
            <pre
              className="max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-sm"
              data-testid={`${dataTestId}-values-schema-content`}
            >
              {preview.valuesSchemaJson}
            </pre>
          ) : (
            <Alert variant="default" data-testid={`${dataTestId}-values-schema-missing`}>
              <AlertDescription>
                O arquivo values.schema.json não foi encontrado no caminho selecionado.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="values" className="p-4" data-testid={`${dataTestId}-content-values`}>
          {hasValuesYaml ? (
            <pre
              className="max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-sm"
              data-testid={`${dataTestId}-values-yaml-content`}
            >
              {preview.valuesYaml}
            </pre>
          ) : (
            <Alert variant="default" data-testid={`${dataTestId}-values-yaml-missing`}>
              <AlertDescription>
                O arquivo values.yaml não foi encontrado no caminho selecionado.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
