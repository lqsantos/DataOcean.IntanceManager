'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TemplateChartInfo, TemplatePreview } from '@/types/template';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: TemplatePreview | null;
  chartInfo: TemplateChartInfo | null;
}

export function TemplatePreviewModal({
  open,
  onOpenChange,
  preview,
  chartInfo,
}: TemplatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'schema' | 'values'>('chart');

  const renderChartInfo = () => {
    if (!chartInfo) {
      return null;
    }

    const infoItems = [
      { label: 'Nome', value: chartInfo.name },
      { label: 'Versão', value: chartInfo.version },
      { label: 'Descrição', value: chartInfo.description || 'Sem descrição' },
      { label: 'API Version', value: preview?.chartYaml?.apiVersion || 'v1' },
      { label: 'Tipo', value: preview?.chartYaml?.type || 'application' },
    ];

    // Adiciona keywords se existirem
    if (preview?.chartYaml?.keywords && preview.chartYaml.keywords.length > 0) {
      infoItems.push({
        label: 'Keywords',
        value: preview.chartYaml.keywords.join(', '),
      });
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
          {infoItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">{item.label}:</div>
              <div className="font-mono text-sm">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchema = () => {
    if (!preview?.schema) {
      return (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum schema encontrado (values.schema.json)
        </div>
      );
    }

    // Formato JSON com syntax highlighting simplificado
    return (
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <pre className="p-4 font-mono text-xs">{JSON.stringify(preview.schema, null, 2)}</pre>
      </ScrollArea>
    );
  };

  const renderValues = () => {
    if (!preview?.values) {
      return (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum arquivo values.yaml encontrado
        </div>
      );
    }

    // YAML como texto simples
    return (
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <pre className="p-4 font-mono text-xs">{preview.values}</pre>
      </ScrollArea>
    );
  };

  // Mostrar spinner quando não houver dados de preview
  if (!preview || !chartInfo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex h-[300px] w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Pré-visualização do Template</DialogTitle>
          <DialogDescription>
            {chartInfo.name} v{chartInfo.version}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="chart"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'chart' | 'schema' | 'values')}
          className="mt-2"
        >
          <TabsList className="w-full">
            <TabsTrigger value="chart" className="flex-1">
              Chart.yaml
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex-1">
              Schema
            </TabsTrigger>
            <TabsTrigger value="values" className="flex-1">
              Values
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4">
            {renderChartInfo()}
          </TabsContent>
          <TabsContent value="schema" className="mt-4">
            {renderSchema()}
          </TabsContent>
          <TabsContent value="values" className="mt-4">
            {renderValues()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
