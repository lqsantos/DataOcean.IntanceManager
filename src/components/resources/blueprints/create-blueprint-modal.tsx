'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';
import { useTemplates } from '@/hooks/use-templates';

// Define form schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  templateId: z.string().min(1, { message: 'Template é obrigatório' }),
});

const variablesSchema = z.object({
  variables: z.array(
    z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
      description: z.string().optional(),
      defaultValue: z.string().optional(),
      required: z.boolean().default(false),
      type: z.enum(['string', 'number', 'boolean']),
      options: z.array(z.string()).optional(),
    })
  ),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
type VariablesFormValues = z.infer<typeof variablesSchema>;

interface CreateBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export function CreateBlueprintModal({ isOpen, onClose }: CreateBlueprintModalProps) {
  // Use the context
  const {
    isOpen: isContextOpen,
    isLoading,
    currentStep,
    blueprintData,
    variables,
    closeModal,
    nextStep,
    prevStep,
    updateBlueprintData,
    updateVariables,
    createBlueprint,
  } = useCreateBlueprint();

  // Combine props open state with context
  const isModalOpen = isOpen || isContextOpen;

  // Use the templates hook
  const { templates, isLoading: templatesLoading } = useTemplates();

  // Setup forms for each step
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: blueprintData.name || '',
      description: blueprintData.description || '',
      category: blueprintData.category || '',
      templateId: blueprintData.templateId || '',
    },
  });

  const variablesForm = useForm<VariablesFormValues>({
    resolver: zodResolver(variablesSchema),
    defaultValues: {
      variables:
        variables.length > 0
          ? variables
          : [{ name: '', description: '', defaultValue: '', required: true, type: 'string' }],
    },
  });

  // Update form values when context data changes
  useEffect(() => {
    if (isModalOpen) {
      basicInfoForm.reset({
        name: blueprintData.name || '',
        description: blueprintData.description || '',
        category: blueprintData.category || '',
        templateId: blueprintData.templateId || '',
      });

      variablesForm.reset({
        variables:
          variables.length > 0
            ? variables
            : [{ name: '', description: '', defaultValue: '', required: true, type: 'string' }],
      });
    }
  }, [isModalOpen, blueprintData, variables, basicInfoForm, variablesForm]);

  // Handle basic info form submission
  const onBasicInfoSubmit = (data: BasicInfoFormValues) => {
    updateBlueprintData(data);
    nextStep();
  };

  // Handle variables form submission
  const onVariablesSubmit = async (data: VariablesFormValues) => {
    // Filter out empty variables
    const filteredVariables = data.variables.filter((v) => v.name.trim() !== '');

    updateVariables(filteredVariables);

    // Create the blueprint
    await createBlueprint();
  };

  // Get unique categories from templates for suggestions
  const templateCategories = Array.from(
    new Set(templates.map((template) => template.category).filter(Boolean))
  );

  // Get template name from ID
  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);

    return template ? template.name : 'Unknown Template';
  };

  // Add a new variable field
  const addVariable = () => {
    const currentVariables = variablesForm.getValues('variables') || [];

    variablesForm.setValue('variables', [
      ...currentVariables,
      { name: '', description: '', defaultValue: '', required: true, type: 'string' },
    ]);
  };

  // Remove a variable field
  const removeVariable = (index: number) => {
    const currentVariables = variablesForm.getValues('variables') || [];

    if (currentVariables.length > 1) {
      const updatedVariables = [...currentVariables];

      updatedVariables.splice(index, 1);
      variablesForm.setValue('variables', updatedVariables);
    }
  };

  // Handle modal close
  const handleClose = () => {
    closeModal();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Blueprint</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? 'Defina as informações básicas do blueprint.'
              : 'Configure as variáveis para o blueprint.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 border-b pb-4">
          <Tabs value={`${currentStep}`} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1" disabled={currentStep !== 1}>
                1. Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="2" disabled={currentStep !== 2}>
                2. Variáveis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {currentStep === 1 ? (
          <Form {...basicInfoForm}>
            <form onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)} className="space-y-4">
              <FormField
                control={basicInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do blueprint" {...field} />
                    </FormControl>
                    <FormDescription>Nome único para identificar este blueprint.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={basicInfoForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição detalhada do blueprint" {...field} />
                    </FormControl>
                    <FormDescription>Descreva o propósito e uso deste blueprint.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={basicInfoForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="Custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Categoria para organização dos blueprints.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Base</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templatesLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando templates...
                            </SelectItem>
                          ) : templates.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Nenhum template disponível
                            </SelectItem>
                          ) : (
                            templates
                              .filter((template) => template.isActive)
                              .map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Template Helm que será utilizado como base para este blueprint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit">Próximo</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...variablesForm}>
            <form onSubmit={variablesForm.handleSubmit(onVariablesSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Variáveis do Blueprint</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addVariable}
                    className="h-7 gap-1 text-xs"
                  >
                    <PlusCircle className="h-3 w-3" />
                    Adicionar
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Configure as variáveis que serão utilizadas ao criar instâncias a partir deste
                  blueprint.
                  {blueprintData.templateId && (
                    <span>
                      {' '}
                      O blueprint será baseado no template{' '}
                      <strong>{getTemplateName(blueprintData.templateId)}</strong>.
                    </span>
                  )}
                </p>
              </div>

              <ScrollArea className="max-h-[350px] pr-4">
                {variablesForm.getValues('variables')?.map((_, index) => (
                  <div key={index} className="mb-6 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variável {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariable(index)}
                        className="h-6 w-6"
                        disabled={variablesForm.getValues('variables')?.length <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={variablesForm.control}
                        name={`variables.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: replicaCount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={variablesForm.control}
                        name={`variables.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="string">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="boolean">Booleano</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={variablesForm.control}
                        name={`variables.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Descrição da variável" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={variablesForm.control}
                        name={`variables.${index}.defaultValue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Padrão</FormLabel>
                            <FormControl>
                              <Input placeholder="Valor padrão" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={variablesForm.control}
                        name={`variables.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Obrigatório</FormLabel>
                              <FormDescription>
                                Esta variável deve ser fornecida ao criar uma instância
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={prevStep}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Blueprint'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
