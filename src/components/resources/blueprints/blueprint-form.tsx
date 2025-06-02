'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';

import { ConfirmDialog } from './components/confirm-dialog';
import { StepNavigation } from './components/step-navigation';
import { BasicInfoStep } from './steps/basic-info-step';
import { PreviewStep } from './steps/preview-step';
import { TemplatesStep } from './steps/templates-step';
import { VariablesStep } from './steps/variables-step';
import { formSchema, type BlueprintFormProps, type FormValues } from './types';

/**
 * Main blueprint form component
 */
export function BlueprintForm({
  blueprint,
  onSave,
  onCancel,
  mode,
  currentStep = 1,
  totalSteps = 4,
  onNextStep,
  onPrevStep,
}: BlueprintFormProps) {
  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Context for blueprint creation
  const {
    blueprintData,
    selectedTemplates: contextSelectedTemplates,
    generatedHelperTpl,
    updateBlueprintData,
    updateSelectedTemplates,
    updateBlueprintVariables,
    generateHelperTpl,
  } = useCreateBlueprint();

  // Form configuration with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Check if there are validation errors for the current step
  const hasCurrentStepErrors = () => {
    const { errors } = form.formState;

    switch (currentStep) {
      case 1:
        return !!errors.name || !!errors.description;
      case 2:
        return !!errors.selectedTemplates;
      case 3:
        return !!errors.blueprintVariables || !!errors.helperTpl;
      default:
        return false;
    }
  };

  /**
   * Get default form values based on mode
   */
  function getDefaultValues(): Partial<FormValues> {
    if (mode === 'edit' && blueprint) {
      return {
        name: blueprint.name,
        description: blueprint.description || '',
        category: blueprint.category || '',
        templateId: blueprint.templateId,
        selectedTemplates: blueprint.childTemplates || [],
        blueprintVariables: blueprint.variables || [],
        helperTpl: blueprint.helperTpl || '',
      };
    } else {
      // Create mode with context data
      const selectedTemplates = Array.isArray(contextSelectedTemplates)
        ? contextSelectedTemplates.map((template) => ({
            templateId: template.templateId,
            identifier:
              'identifier' in template
                ? (template.identifier as string)
                : `template-${template.order}`,
            order: template.order,
            overrideValues: template.overrideValues,
          }))
        : [];

      return {
        name: blueprintData?.name || '',
        description: blueprintData?.description || '',
        category: blueprintData?.category || '',
        templateId: blueprintData?.templateId || '',
        selectedTemplates,
        blueprintVariables: [],
        helperTpl: generatedHelperTpl || '',
      };
    }
  }

  /**
   * Handle form submission for basic info step
   */
  const handleBasicInfoSubmit = (data: FormValues) => {
    if (mode === 'create') {
      updateBlueprintData({
        name: data.name,
        description: data.description,
      });

      if (onNextStep) {
        onNextStep();
      }
    }
  };

  /**
   * Handle form submission for templates step
   */
  const handleTemplatesSubmit = (data: FormValues) => {
    if (mode === 'create' && data.selectedTemplates) {
      updateSelectedTemplates(data.selectedTemplates);

      if (onNextStep) {
        onNextStep();
      }
    }
  };

  /**
   * Handle form submission for variables step
   */
  const handleVariablesSubmit = (data: FormValues) => {
    if (mode === 'create' && data.blueprintVariables) {
      // Type assertion to match expected interface
      const typedVariables = data.blueprintVariables.map((v) => ({
        ...v,
        value: v.value || '',
      }));

      // Use type assertion for the context function
      updateBlueprintVariables(typedVariables as Parameters<typeof updateBlueprintVariables>[0]);
      const helperTplContent = data.helperTpl || '';

      form.setValue('helperTpl', helperTplContent);

      if (generateHelperTpl) {
        generateHelperTpl();
      }

      if (onNextStep) {
        onNextStep();
      }
    }
  };

  /**
   * Handle final form submission
   */
  const handleFinalSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        generateHelperTpl();
      }

      await onSave(data);
    } catch (error) {
      console.error('Erro ao salvar blueprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel with confirmation for edit mode
   */
  const handleCancel = () => {
    const hasChanges = Object.keys(form.formState.dirtyFields).length > 0;

    if (mode === 'edit' && hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  };

  // Render content based on mode
  if (mode === 'edit') {
    return (
      <div className="space-y-6">
        <Form {...form}>
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="templates">Templates Associados</TabsTrigger>
              <TabsTrigger value="variables">Variáveis</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <BasicInfoStep form={form} />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <TemplatesStep form={form} />
            </TabsContent>

            <TabsContent value="variables" className="space-y-6">
              <VariablesStep form={form} />
            </TabsContent>

            <div className="mt-6 flex justify-end space-x-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="cancel-button"
              >
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(handleFinalSubmit)}
                disabled={isSubmitting}
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
          </Tabs>
        </Form>

        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Descartar alterações"
          description="Tem certeza que deseja descartar as alterações não salvas?"
          confirmText="Descartar"
          cancelText="Continuar editando"
          destructive={true}
          onConfirm={onCancel}
        />
      </div>
    );
  }

  // Create mode with step-by-step wizard
  return (
    <div className="space-y-6">
      <Form {...form}>
        {currentStep === 1 && (
          <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
            <BasicInfoStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onCancel={onCancel}
              isNextEnabled={!hasCurrentStepErrors()}
            />
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={form.handleSubmit(handleTemplatesSubmit)} className="space-y-4">
            <TemplatesStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isNextEnabled={!hasCurrentStepErrors()}
            />
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={form.handleSubmit(handleVariablesSubmit)} className="space-y-4">
            <VariablesStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isNextEnabled={!hasCurrentStepErrors()}
            />
          </form>
        )}

        {currentStep === 4 && (
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-4">
            <PreviewStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isFinalStep={true}
              isSubmitting={isSubmitting}
              isNextEnabled={!hasCurrentStepErrors()}
              labels={{ submit: 'Criar Blueprint' }}
            />
          </form>
        )}
      </Form>
    </div>
  );
}
