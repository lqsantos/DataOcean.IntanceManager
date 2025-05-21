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
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 md:grid-cols-2">
          {infoItems.map((item, index) => (
            <div key={index} className="space-y-0.5">
              <div className="text-xs font-medium text-muted-foreground">{item.label}:</div>
              <div className="font-mono text-xs">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchema = () => {
    if (!preview?.schema) {
      return (
        <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
          Nenhum schema encontrado (values.schema.json)
        </div>
      );
    }

    // Formato JSON com syntax highlighting simplificado
    return (
      <ScrollArea className="h-[350px] w-full rounded-md border">
        <pre className="p-3 font-mono text-[10px]">{JSON.stringify(preview.schema, null, 2)}</pre>
      </ScrollArea>
    );
  };

  const renderValues = () => {
    if (!preview?.values) {
      return (
        <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
          Nenhum arquivo values.yaml encontrado
        </div>
      );
    }

    // YAML como texto simples
    return (
      <ScrollArea className="h-[350px] w-full rounded-md border">
        <pre className="p-3 font-mono text-[10px]">{preview.values}</pre>
      </ScrollArea>
    );
  };

  // Mostrar spinner quando não houver dados de preview
  if (!preview || !chartInfo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <div className="flex h-[250px] w-full items-center justify-center">
            <Spinner size="md" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Pré-visualização do Template</DialogTitle>
          <DialogDescription className="text-xs">
            {chartInfo.name} v{chartInfo.version}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="chart"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'chart' | 'schema' | 'values')}
          className="mt-2"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="chart" className="h-7 flex-1 text-xs">
              Chart.yaml
            </TabsTrigger>
            <TabsTrigger value="schema" className="h-7 flex-1 text-xs">
              Schema
            </TabsTrigger>
            <TabsTrigger value="values" className="h-7 flex-1 text-xs">
              Values
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-3">
            {renderChartInfo()}
          </TabsContent>
          <TabsContent value="schema" className="mt-3">
            {renderSchema()}
          </TabsContent>
          <TabsContent value="values" className="mt-3">
            {renderValues()}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 text-xs">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
