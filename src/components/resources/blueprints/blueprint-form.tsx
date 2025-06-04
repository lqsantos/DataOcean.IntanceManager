'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';
import { useBlueprintForm } from '@/hooks/use-blueprint-form';

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
    generateHelperTpl,
  } = useCreateBlueprint();

  // Form configuration with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const { handleStepSubmit, hasStepErrors, validateBlueprint } = useBlueprintForm(form, mode);

  /**
   * Get default form values based on mode
   */
  function getDefaultValues(): Partial<FormValues> {
    if (mode === 'edit' && blueprint) {
      return {
        name: blueprint.name,
        description: blueprint.description || '',
        category: blueprint.category || '',
        // Removido templateId
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
        // Removido templateId
        selectedTemplates,
        blueprintVariables: [],
        helperTpl: generatedHelperTpl || '',
      };
    }
  }

  const handleStepSubmitWithNavigation =
    (step: keyof typeof handleStepSubmit) => (data: FormValues) => {
      handleStepSubmit[step](data);

      if (onNextStep) {
        onNextStep();
      }
    };

  /**
   * Handle final form submission with validation
   */
  const handleFinalSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Gerar o helper template se estiver no modo de criação
      if (mode === 'create') {
        generateHelperTpl();

        // Validar o blueprint antes de salvar (apenas no modo de criação)
        const validationResult = await validateBlueprint(data);

        if (!validationResult.valid) {
          // Mostrar toast de erro com a mensagem específica do backend
          toast.error('Erro de validação', {
            description:
              validationResult.message ||
              'O blueprint não passou na validação do servidor. Por favor, verifique os dados.',
          });

          return;
        }
      }

      // Chamar a função de salvamento
      await onSave(data);

      // Mostrar toast de sucesso apenas no modo de edição (o modo de criação já mostra um toast)
      if (mode === 'edit') {
        toast.success('Blueprint atualizado', {
          description: `${data.name} foi atualizado com sucesso.`,
        });
      }

      // No modo de criação, o modal será fechado pela função onSave (handleSave no CreateBlueprintModal)
    } catch (error) {
      console.error('Erro ao salvar blueprint:', error);

      // Mostrar toast de erro em caso de falha
      toast.error('Erro ao salvar blueprint', {
        description: 'Ocorreu um erro ao tentar salvar o blueprint. Tente novamente.',
      });
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
          <form
            onSubmit={form.handleSubmit(handleStepSubmitWithNavigation('basicInfo'))}
            className="space-y-4 pb-20"
          >
            <BasicInfoStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              onCancel={onCancel}
              isNextEnabled={!hasStepErrors(currentStep)}
            />
          </form>
        )}

        {currentStep === 2 && (
          <form
            onSubmit={form.handleSubmit(handleStepSubmitWithNavigation('templates'))}
            className="space-y-4 pb-20"
          >
            <TemplatesStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isNextEnabled={!hasStepErrors(currentStep)}
            />
          </form>
        )}

        {currentStep === 3 && (
          <form
            onSubmit={form.handleSubmit(handleStepSubmitWithNavigation('variables'))}
            className="space-y-4 pb-20"
          >
            <VariablesStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isNextEnabled={!hasStepErrors(currentStep)}
            />
          </form>
        )}

        {currentStep === 4 && (
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-4">
            <PreviewStep form={form} />
            <StepNavigation
              currentStep={currentStep}
              onCancel={onCancel}
              onPrevStep={onPrevStep}
              isFinalStep={true}
              isSubmitting={isSubmitting}
              isNextEnabled={!hasStepErrors(currentStep)}
              labels={{ submit: 'Criar Blueprint' }}
            />
          </form>
        )}
      </Form>
    </div>
  );
}
