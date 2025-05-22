'use client';

import { BookOpen, FileSymlink } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { StyledModal } from '@/components/ui/styled-modal';
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
      { label: 'API Version', value: 'v1' },
      { label: 'Tipo', value: 'application' },
    ];

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
    if (!preview?.valuesSchemaJson) {
      return (
        <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
          Nenhum schema encontrado (values.schema.json)
        </div>
      );
    }

    return (
      <ScrollArea className="h-[350px] w-full rounded-md border">
        <pre className="p-3 font-mono text-[10px]">{preview.valuesSchemaJson}</pre>
      </ScrollArea>
    );
  };

  const renderValues = () => {
    if (!preview?.valuesYaml) {
      return (
        <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
          Nenhum arquivo values.yaml encontrado
        </div>
      );
    }

    return (
      <ScrollArea className="h-[350px] w-full rounded-md border">
        <pre className="p-3 font-mono text-[10px]">{preview.valuesYaml}</pre>
      </ScrollArea>
    );
  };

  if (!preview || !chartInfo) {
    return (
      <StyledModal
        open={open}
        onOpenChange={onOpenChange}
        title="Carregando..."
        icon={BookOpen}
        testId="template-preview-loading"
      >
        <div className="flex h-[250px] w-full items-center justify-center">
          <Spinner size="md" />
        </div>
      </StyledModal>
    );
  }

  return (
    <StyledModal
      open={open}
      onOpenChange={onOpenChange}
      title="Pré-visualização do Template"
      description={`${chartInfo.name} v${chartInfo.version}`}
      icon={BookOpen}
      backgroundIcon={FileSymlink}
      testId="template-preview-modal"
      maxWidth="2xl"
    >
      <Tabs
        defaultValue="chart"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'chart' | 'schema' | 'values')}
        className="mt-2"
        data-testid="template-preview-tabs"
      >
        <TabsList className="h-8 w-full">
          <TabsTrigger
            value="chart"
            className="h-7 flex-1 text-xs"
            data-testid="template-tab-chart"
          >
            Chart.yaml
          </TabsTrigger>
          <TabsTrigger
            value="schema"
            className="h-7 flex-1 text-xs"
            data-testid="template-tab-schema"
          >
            Schema
          </TabsTrigger>
          <TabsTrigger
            value="values"
            className="h-7 flex-1 text-xs"
            data-testid="template-tab-values"
          >
            Values
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-3" data-testid="template-content-chart">
          {renderChartInfo()}
        </TabsContent>
        <TabsContent value="schema" className="mt-3" data-testid="template-content-schema">
          {renderSchema()}
        </TabsContent>
        <TabsContent value="values" className="mt-3" data-testid="template-content-values">
          {renderValues()}
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="h-9 text-sm"
          data-testid="template-preview-close"
        >
          Fechar
        </Button>
      </DialogFooter>
    </StyledModal>
  );
}
