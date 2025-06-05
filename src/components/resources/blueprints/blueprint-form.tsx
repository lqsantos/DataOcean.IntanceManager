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
    updateBlueprintData,
    // Não precisamos mais dessas propriedades, o backend gerará o helperTpl
    // generatedHelperTpl,
    // generateHelperTpl,
  } = useCreateBlueprint();

  // Form configuration with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
    mode: 'onSubmit',
  });

  const { handleStepSubmit, hasStepErrors } = useBlueprintForm(form, mode);

  /**
   * Get default form values based on mode
   */
  function getDefaultValues(): Partial<FormValues> {
    if (mode === 'edit' && blueprint) {
      return {
        name: blueprint.name,
        description: blueprint.description || '',
        applicationId: blueprint.applicationId || '',
        // Removido templateId
        selectedTemplates: blueprint.childTemplates || [],
        blueprintVariables: blueprint.variables || [],
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

      // Se não houver um applicationId definido e houver aplicações disponíveis,
      // vamos definir o applicationId padrão para a primeira aplicação
      const defaultApplicationId = blueprintData?.applicationId || '';

      console.warn('Default applicationId:', defaultApplicationId);

      return {
        name: blueprintData?.name || '',
        description: blueprintData?.description || '',
        applicationId: defaultApplicationId,
        // Removido templateId
        selectedTemplates,
        blueprintVariables: [],
      };
    }
  }

  // Função para validar apenas os campos específicos de cada passo
  const validateStepOnly = async (step: string, data: FormValues) => {
    // Desativa temporariamente outras validações
    form.clearErrors();

    // Validações específicas por passo
    if (step === 'basicInfo') {
      // Validamos nome, descrição e applicationId no primeiro passo
      let isValid = true;

      if (!data.name || data.name.length < 3) {
        form.setError('name', { message: 'Nome deve ter pelo menos 3 caracteres' });
        isValid = false;
      }

      if (!data.description || data.description.length < 1) {
        form.setError('description', { message: 'Descrição é obrigatória' });
        isValid = false;
      }

      // Verificar se o applicationId foi selecionado
      if (!data.applicationId) {
        form.setError('applicationId', { message: 'Selecione uma aplicação' });
        isValid = false;
        console.warn('ApplicationId não selecionado!');
      } else {
        console.warn('ApplicationId validado:', data.applicationId);

        // Atualizar o contexto imediatamente com o applicationId
        updateBlueprintData({
          applicationId: data.applicationId,
        });
      }

      return isValid;
    }

    if (step === 'templates') {
      // Validamos apenas templates no segundo passo
      if (!data.selectedTemplates || data.selectedTemplates.length < 1) {
        form.setError('selectedTemplates', {
          message: 'É necessário associar pelo menos um template',
        });

        return false;
      }

      return true;
    }

    // Por padrão, permitir avanço
    return true;
  };

  const handleStepSubmitWithNavigation =
    (step: keyof typeof handleStepSubmit) => async (data: FormValues) => {
      console.warn(`Processando submissão do passo ${step}`);

      // Garantir que applicationId seja passada para o contexto no passo 1
      if (step === 'basicInfo' && mode === 'create') {
        console.warn('Dados do formulário (passo 1):', JSON.stringify(data));
        updateBlueprintData({
          name: data.name,
          description: data.description,
          applicationId: data.applicationId,
        });
      }

      try {
        // Validar apenas os campos deste passo
        const isValid = await validateStepOnly(step, data);

        if (isValid) {
          handleStepSubmit[step](data);

          console.warn(`Avançando para o próximo passo após ${step}`);

          if (onNextStep) {
            onNextStep();
          }
        } else {
          console.warn(`Validação falhou para o passo ${step}`);
        }
      } catch (error) {
        console.error(`Erro ao processar passo ${step}:`, error);
      }
    };

  /**
   * Handle final form submission with validation
   */
  const handleFinalSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Não precisamos mais gerar o helper template no frontend
      // O backend se encarregará disso

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
          <form className="space-y-4 pb-20">
            <BasicInfoStep form={form} />
            <div>
              {/* Botão que substitui a navegação para diagnosticar o problema */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between border-t bg-background/95 px-6 py-4 backdrop-blur">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.warn('Validando e salvando dados do passo 1');
                    const data = form.getValues();

                    // Validar campos obrigatórios
                    if (!data.name || data.name.length < 3) {
                      form.setError('name', { message: 'Nome deve ter pelo menos 3 caracteres' });

                      return;
                    }

                    if (!data.description) {
                      form.setError('description', { message: 'Descrição é obrigatória' });

                      return;
                    }

                    // Se passou na validação, salvar e avançar
                    handleStepSubmit.basicInfo(data);

                    if (onNextStep) {
                      onNextStep();
                    }
                  }}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form className="space-y-4 pb-20">
            <TemplatesStep form={form} />
            <div>
              {/* Botão que substitui a navegação para diagnosticar o problema */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between border-t bg-background/95 px-6 py-4 backdrop-blur">
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  {onPrevStep && (
                    <Button type="button" variant="outline" onClick={onPrevStep}>
                      Anterior
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    console.warn('Validando e salvando dados do passo 2');
                    const data = form.getValues();

                    // Validar seleção de templates
                    if (!data.selectedTemplates || data.selectedTemplates.length === 0) {
                      form.setError('selectedTemplates', {
                        message: 'É necessário associar pelo menos um template',
                      });

                      return;
                    }

                    // Se passou na validação, salvar e avançar
                    handleStepSubmit.templates(data);

                    if (onNextStep) {
                      onNextStep();
                    }
                  }}
                >
                  Próximo
                </Button>
              </div>
            </div>
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
