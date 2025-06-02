'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTemplates } from '@/hooks/use-templates';

import { ConfirmDialog } from './components/confirm-dialog';
import { StepNavigation } from './components/step-navigation';
import { BasicInfoStep } from './steps/basic-info-step';
import { PreviewStep } from './steps/preview-step';
import { TemplatesStep } from './steps/templates-step';
import { VariablesStep } from './steps/variables-step';
import { formSchema, type BlueprintFormProps, type FormValues } from './types';

import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/client';

/**
 * Blueprint form component for creating and editing blueprints
 * Supports both a multi-step wizard mode and a tabbed edit mode
 */
export function BlueprintForm({
  blueprint,
  onSave,
  onCancel,
  mode = 'create',
  currentStep = 1,
  totalSteps = 4,
  onNextStep,
  onPrevStep,
}: BlueprintFormProps) {
  const { t } = useTranslation(['common', 'blueprints']);
  const { templates } = useTemplates();

  // States for UI control
  const [activeTab, setActiveTab] = useState('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Form state
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: blueprint?.name || '',
      description: blueprint?.description || '',
      category: blueprint?.category || '',
      templateId: blueprint?.templateId,
      selectedTemplates: blueprint?.childTemplates || [],
      blueprintVariables: blueprint?.variables || [],
      helperTpl: blueprint?.helperTpl || '',
    },
    mode: 'onChange',
  });

  // Form submission handler
  const handleSubmit = async (data: FormValues) => {
    try {
      // If we're in the wizard flow and not on the final step, move to next step
      if (mode === 'create' && !isFinalStep && onNextStep) {
        onNextStep();

        return;
      }

      setIsSubmitting(true);
      await onSave(data);

      toast({
        title: mode === 'create' ? 'Blueprint criado' : 'Blueprint atualizado',
        description: 'Operação realizada com sucesso',
      });
    } catch (error) {
      console.error('Error saving blueprint:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o blueprint',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if this is the final step
  const isFinalStep = mode === 'edit' || currentStep === totalSteps;

  // Functions for tab and wizard navigation
  const handleTabSelect = (value: string) => {
    setActiveTab(value);
  };

  const handleCancel = () => {
    // If there are changes, show confirm dialog
    if (form.formState.isDirty) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  // Form section rendering based on mode
  const renderContent = () => {
    // For create mode with wizard
    if (mode === 'create') {
      let stepComponent;

      switch (currentStep) {
        case 1:
          stepComponent = <BasicInfoStep form={form} />;
          break;
        case 2:
          stepComponent = <TemplatesStep form={form} />;
          break;
        case 3:
          stepComponent = <VariablesStep form={form} />;
          break;
        case 4:
          stepComponent = <PreviewStep form={form} />;
          break;
        default:
          stepComponent = <BasicInfoStep form={form} />;
      }

      return (
        <>
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            <ScrollArea className="h-full w-full">{stepComponent}</ScrollArea>
          </div>
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNextStep={onNextStep}
            onPrevStep={onPrevStep}
            onCancel={handleCancel}
            isFinalStep={isFinalStep}
            isSubmitting={isSubmitting}
            isNextEnabled={!form.formState.isSubmitting}
          />
        </>
      );
    }

    // For edit mode with tabs
    return (
      <>
        <Tabs value={activeTab} onValueChange={handleTabSelect}>
          <TabsList className="mb-4">
            <TabsTrigger value="basics">Informações Básicas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="variables">Variáveis</TabsTrigger>
            <TabsTrigger value="preview">Visão Geral</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <TabsContent value="basics" className="h-full">
              <BasicInfoStep form={form} />
            </TabsContent>
            <TabsContent value="templates" className="h-full">
              <TemplatesStep form={form} />
            </TabsContent>
            <TabsContent value="variables" className="h-full">
              <VariablesStep form={form} />
            </TabsContent>
            <TabsContent value="preview" className="h-full">
              <PreviewStep form={form} />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="mt-6 flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            data-testid="cancel-button"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || isSubmitting}
            data-testid="save-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {renderContent()}
        </form>
      </Form>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar edição"
        description="Você tem alterações não salvas que serão perdidas. Deseja realmente cancelar?"
        confirmText="Sim, cancelar"
        cancelText="Não, continuar editando"
        onConfirm={onCancel}
        destructive
      />
    </>
  );
}
