'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  Check,
  CheckCircle,
  Code,
  FileText,
  Loader2,
  PlusCircle,
  Search,
  Trash,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';
import { useTemplates } from '@/hooks/use-templates';
import type { Blueprint } from '@/types/blueprint';

// Atualizando o esquema de validação para remover categoria e templateId da etapa 1
const formSchema = z.object({
  // Etapa 1: Informações Gerais - apenas nome e descrição conforme especificação blue.md
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória'),

  // Estes campos seriam definidos em outras etapas ou pelo sistema
  category: z.string().optional(),
  templateId: z.string().optional(),

  // Etapa 2: Templates Associados
  selectedTemplates: z
    .array(
      z.object({
        templateId: z.string().min(1, 'Template é obrigatório'),
        identifier: z.string().min(1, 'Identificador é obrigatório'),
        order: z.number(),
        overrideValues: z.string().optional(),
      })
    )
    .optional(),

  // Etapa 3: Blueprint Variables
  blueprintVariables: z
    .array(
      z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        description: z.string().optional(),
        value: z.string().optional(),
        type: z.enum(['simple', 'advanced']).default('simple'),
      })
    )
    .optional(),

  // Campo gerado a partir das variáveis
  helperTpl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BlueprintFormProps {
  // Se blueprint for fornecido, estamos editando; caso contrário, criando
  blueprint?: Blueprint;
  // Função chamada ao salvar o formulário (pode ser para criar ou atualizar)
  onSave: (data: FormValues) => Promise<void>;
  // Função para cancelar a operação
  onCancel: () => void;
  // Tipo de operação
  mode: 'create' | 'edit';
  // Para o modo create, pode-se especificar a etapa atual e total (para wizard)
  currentStep?: number;
  totalSteps?: number; // Alterado para 4 etapas
  // Para o modo create, funções de navegação entre etapas (para wizard)
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onGoToStep?: (step: number) => void;
}

export function BlueprintForm({
  blueprint,
  onSave,
  onCancel,
  mode,
  currentStep = 1,
  totalSteps = 4, // Alterado para 4 etapas
  onNextStep,
  onPrevStep,
  onGoToStep,
}: BlueprintFormProps) {
  const { t } = useTranslation(['common', 'blueprints']);
  const { templates, isLoading: templatesLoading } = useTemplates();

  // Para o modo de edição, usamos tabs para navegar entre seções
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [showHelperTplPreview, setShowHelperTplPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<string>('helper');

  // Estado do contexto de criação (usado apenas no modo create)
  const {
    blueprintData,
    variables: contextVariables,
    childTemplates: contextChildTemplates,
    generatedHelperTpl,
    updateBlueprintData,
    updateVariables,
    updateChildTemplates,
    generateHelperTpl: generateContextHelperTpl,
  } = useCreateBlueprint();

  // Form setup com valores iniciais dependendo do modo
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      mode === 'edit' && blueprint
        ? {
            name: blueprint.name,
            description: blueprint.description || '',
            category: blueprint.category || '',
            templateId: blueprint.templateId,
            selectedTemplates: blueprint.childTemplates || [],
            blueprintVariables: blueprint.variables || [],
            helperTpl: blueprint.helperTpl || '',
          }
        : {
            name: blueprintData?.name || '',
            description: blueprintData?.description || '',
            category: blueprintData?.category || '',
            templateId: blueprintData?.templateId || '',
            selectedTemplates: contextChildTemplates || [],
            blueprintVariables: contextVariables.length > 0 ? contextVariables : [],
            helperTpl: generatedHelperTpl || '',
          },
  });

  // Atualizar os valores do formulário quando os dados do contexto mudarem (apenas no modo create)
  useEffect(() => {
    if (mode === 'create') {
      form.reset({
        name: blueprintData?.name || '',
        description: blueprintData?.description || '',
        category: blueprintData?.category || '',
        templateId: blueprintData?.templateId || '',
        selectedTemplates: contextChildTemplates || [],
        blueprintVariables: contextVariables.length > 0 ? contextVariables : [],
        helperTpl: generatedHelperTpl || '',
      });
    }
  }, [mode, blueprintData, contextVariables, contextChildTemplates, generatedHelperTpl, form]);

  // Get unique categories from templates
  const templateCategories = useMemo(
    () => Array.from(new Set(templates.map((template) => template.category).filter(Boolean))),
    [templates]
  );

  // Get template name from ID
  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);

    return template ? template.name : 'Template desconhecido';
  };

  // Field arrays for managing template selection
  const {
    fields: selectedTemplatesFields,
    append: appendTemplate,
    remove: removeTemplate,
    update: updateTemplate,
  } = useFieldArray({
    control: form.control,
    name: 'selectedTemplates',
  });

  // Field arrays for managing blueprint variables
  const {
    fields: blueprintVariablesFields,
    append: appendBlueprintVariable,
    remove: removeBlueprintVariable,
    update: updateBlueprintVariable,
  } = useFieldArray({
    control: form.control,
    name: 'blueprintVariables',
  });

  // Estado para controle da edição de variáveis
  const [expandedVariable, setExpandedVariable] = useState<number | null>(null);
  const [showVariablePreview, setShowVariablePreview] = useState(false);

  // Estado para controlar filtros e busca de templates
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Filtragem de templates para o catálogo
  const filteredCatalogTemplates = useMemo(() => {
    return templates
      .filter((template) => template.isActive)
      .filter((template) => {
        // Filtro por categoria
        if (selectedCategoryFilter && template.category !== selectedCategoryFilter) {
          return false;
        }

        // Filtro por texto de busca
        if (templateSearchQuery) {
          const searchLower = templateSearchQuery.toLowerCase();
          const nameMatch = template.name.toLowerCase().includes(searchLower);
          const descMatch = template.description?.toLowerCase().includes(searchLower) || false;
          const categoryMatch = template.category?.toLowerCase().includes(searchLower) || false;

          return nameMatch || descMatch || categoryMatch;
        }

        return true;
      });
  }, [templates, templateSearchQuery, selectedCategoryFilter]);

  // Verifica se um template já está adicionado
  const isTemplateSelected = (templateId: string) => {
    return form.getValues('selectedTemplates')?.some((t) => t.templateId === templateId) || false;
  };

  // Adiciona um template à lista
  const addTemplateToSelection = (template: any) => {
    // Se já estiver selecionado, não fazer nada
    if (isTemplateSelected(template.id)) {
      return;
    }

    // Criar um identificador único baseado no nome do template
    let baseIdentifier = template.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Se já existe um template com esse identificador, adicionar um número
    const existingIds = form.getValues('selectedTemplates')?.map((t) => t.identifier) || [];

    if (existingIds.includes(baseIdentifier)) {
      let counter = 1;

      while (existingIds.includes(`${baseIdentifier}-${counter}`)) {
        counter++;
      }
      baseIdentifier = `${baseIdentifier}-${counter}`;
    }

    // Adicionar à lista com a próxima ordem disponível
    const selectedTemplates = form.getValues('selectedTemplates') || [];
    const nextOrder =
      selectedTemplates.length > 0 ? Math.max(...selectedTemplates.map((t) => t.order)) + 1 : 1;

    appendTemplate({
      templateId: template.id,
      identifier: baseIdentifier,
      order: nextOrder,
      overrideValues: '',
    });

    // Atualizar o contexto se estiver no modo de criação
    if (mode === 'create') {
      const updatedTemplates = form.getValues('selectedTemplates') || [];

      // Verificar se a função updateChildTemplates existe antes de chamá-la
      if (typeof updateChildTemplates === 'function') {
        updateChildTemplates(updatedTemplates);
      } else {
        console.warn(
          'Warning: updateChildTemplates is not a function in addTemplateToSelection. Templates may not be saved in context.'
        );
      }
    }
  };

  // Atualiza o identificador de um template
  const updateTemplateIdentifier = (index: number, newIdentifier: string) => {
    const updatedTemplates = [...(form.getValues('selectedTemplates') || [])];

    // Verificar se o novo identificador já existe
    if (updatedTemplates.some((t, i) => i !== index && t.identifier === newIdentifier)) {
      // Não permitir identificadores duplicados
      return false;
    }

    // Atualizar o identificador
    updatedTemplates[index] = {
      ...updatedTemplates[index],
      identifier: newIdentifier,
    };

    form.setValue('selectedTemplates', updatedTemplates);

    // Atualizar o contexto se estiver no modo de criação
    if (mode === 'create') {
      updateChildTemplates(updatedTemplates);
    }

    return true;
  };

  // Adicionar uma variável de blueprint (simple ou advanced)
  const addBlueprintVariable = (type: 'simple' | 'advanced') => {
    const blueprintVariables = form.getValues('blueprintVariables') || [];
    const namePrefix = 'helper.';
    const baseName = type === 'simple' ? 'variable' : 'expression';
    const index = blueprintVariables.length + 1;

    // Gerar nome único
    let varName = `${namePrefix}${baseName}_${index}`;
    let counter = 1;

    while (blueprintVariables.some((v) => v.name === varName)) {
      counter++;
      varName = `${namePrefix}${baseName}_${counter}`;
    }

    const variableForm = {
      name: varName,
      description: '',
      value: '',
      type: type,
    };

    // Adicionar a variável ao formulário
    appendBlueprintVariable(variableForm);

    // Expandir a nova variável para edição
    setExpandedVariable(blueprintVariables.length);

    // Atualizar o contexto se estiver no modo de criação
    if (mode === 'create') {
      const updatedVariables = [...blueprintVariables, variableForm];

      // Verificamos se a função existe antes de chamá-la
      if (typeof updateBlueprintVariables === 'function') {
        updateBlueprintVariables(updatedVariables);
      } else if (typeof updateVariables === 'function') {
        // Fallback para o método antigo
        // Converter para o formato antigo se necessário
        const oldFormatVariables = updatedVariables.map((v) => ({
          name: v.name.replace('helper.', ''),
          description: v.description,
          defaultValue: v.value,
          required: true,
          type: 'string',
        }));

        updateVariables(oldFormatVariables);
      }
    }
  };

  // Verificar se um nome de variável já existe
  const isVariableNameDuplicate = (name: string, currentIndex: number): boolean => {
    const blueprintVariables = form.getValues('blueprintVariables') || [];

    return blueprintVariables.some((v, idx) => idx !== currentIndex && v.name === name);
  };

  // Gerar o conteúdo do helper.tpl a partir das variáveis do blueprint
  const generateHelperTplContent = () => {
    const variables = form.getValues('blueprintVariables') || [];

    if (variables.length === 0) {
      return '# Nenhuma variável definida';
    }

    const helperContent = variables
      .map((variable) => {
        const description = variable.description ? `{{/* ${variable.description} */}}\n` : '';

        return `${description}{{- define "${variable.name}" -}}
${variable.value || ''}
{{- end }}`;
      })
      .join('\n\n');

    return helperContent;
  };

  // Atualizar o conteúdo do helper.tpl no formulário
  const updateHelperTpl = () => {
    const content = generateHelperTplContent();

    form.setValue('helperTpl', content);
    setShowHelperTplPreview(true);

    // Atualizar o contexto se estiver no modo de criação
    if (mode === 'create') {
      if (generateHelperTpl) {
        generateHelperTpl();
      }
    }

    return content;
  };

  // Renderizar o catálogo de templates
  const renderTemplateCatalog = () => {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle>Catálogo de Templates</CardTitle>
          <CardDescription>Selecione os templates para adicionar ao blueprint.</CardDescription>
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou categoria..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] overflow-auto pb-0">
          {templatesLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando templates...</span>
            </div>
          ) : filteredCatalogTemplates.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <div className="text-muted-foreground">Nenhum template encontrado</div>
              <p className="text-xs text-muted-foreground">
                {templateSearchQuery || selectedCategoryFilter
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há templates disponíveis'}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredCatalogTemplates.map((template) => {
                const isSelected = isTemplateSelected(template.id);

                return (
                  <Card
                    key={template.id}
                    className={`overflow-hidden transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between p-3">
                      <div>
                        <h4 className="text-sm font-medium">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {template.description || 'Sem descrição'}
                        </p>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {template.category || 'Sem categoria'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'secondary' : 'ghost'}
                        onClick={() => !isSelected && addTemplateToSelection(template)}
                        disabled={isSelected}
                        className="gap-1"
                      >
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                        <span className="sr-only">{isSelected ? 'Adicionado' : 'Adicionar'}</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderizar os templates selecionados
  const renderSelectedTemplatesList = () => {
    const selectedTemplates = form.getValues('selectedTemplates') || [];

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Templates no Blueprint</h3>
              {/* Badge integrado ao título para melhor impacto visual */}
              {selectedTemplates.length > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {selectedTemplates.length}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] overflow-auto">
          {selectedTemplates.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Selecione templates do catálogo ao lado para adicionar aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTemplates.map((template, index) => {
                const templateInfo = templates.find((t) => t.id === template.templateId);

                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="border-l-4 border-primary">
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{template.identifier}</Badge>
                              <h4 className="text-sm font-medium">
                                {templateInfo?.name || 'Template desconhecido'}
                              </h4>
                            </div>
                            {templateInfo?.category && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {templateInfo.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTemplate(index)}
                            className="h-6 w-6"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium">Identificador</label>
                            <Input
                              value={template.identifier}
                              onChange={(e) => updateTemplateIdentifier(index, e.target.value)}
                              className="mt-1 h-8 text-xs"
                              placeholder="identificador-unico"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Ordem</label>
                            <Input
                              type="number"
                              min={1}
                              value={template.order}
                              onChange={(e) => {
                                const updatedTemplates = [...selectedTemplates];

                                updatedTemplates[index] = {
                                  ...updatedTemplates[index],
                                  order: parseInt(e.target.value) || 1,
                                };
                                form.setValue('selectedTemplates', updatedTemplates);
                              }}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium">
                              Valores de Sobrescrita (opcional)
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Expandir/colapsar área de texto
                                const updatedTemplates = [...selectedTemplates];

                                updatedTemplates[index] = {
                                  ...updatedTemplates[index],
                                  expanded: !template.expanded,
                                };
                                form.setValue('selectedTemplates', updatedTemplates);
                              }}
                              className="h-5 p-0 text-xs"
                            >
                              {template.expanded ? 'Colapsar' : 'Expandir'}
                            </Button>
                          </div>
                          <Textarea
                            value={template.overrideValues || ''}
                            onChange={(e) => {
                              const updatedTemplates = [...selectedTemplates];

                              updatedTemplates[index] = {
                                ...updatedTemplates[index],
                                overrideValues: e.target.value,
                              };
                              form.setValue('selectedTemplates', updatedTemplates);
                            }}
                            className="mt-1 font-mono text-xs"
                            placeholder="# Valores YAML para sobrescrever os padrões\nreplicaCount: 2\nresources:\n  limits:\n    cpu: 100m"
                            rows={template.expanded ? 5 : 2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderizar o formulário de variáveis do blueprint
  const renderBlueprintVariablesForm = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Variáveis do Blueprint</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Adicionar Variável
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addBlueprintVariable('simple')}>
                <FileText className="mr-2 h-4 w-4" />
                Valor Fixo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlueprintVariable('advanced')}>
                <Code className="mr-2 h-4 w-4" />
                Expressão Avançada
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure variáveis reutilizáveis que serão utilizadas nos templates do blueprint.
          <br />
          Estas variáveis serão incluídas no arquivo helper.tpl.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Coluna 1: Definição de Variáveis */}
          <Card>
            <CardContent className="pt-6">
              {(form.getValues('blueprintVariables') || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma variável definida</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clique em "Adicionar Variável" para criar uma nova variável.
                  </p>
                </div>
              ) : (
                <div className="max-h-[500px] space-y-4 overflow-auto pr-2">
                  {(form.getValues('blueprintVariables') || []).map((variable, index) => (
                    <Card
                      key={index}
                      className={`overflow-hidden border-l-4 ${variable.type === 'advanced' ? 'border-l-blue-500' : 'border-l-primary'}`}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={variable.type === 'advanced' ? 'secondary' : 'outline'}>
                              {variable.type === 'advanced' ? 'Expressão' : 'Valor Fixo'}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() =>
                                setExpandedVariable(expandedVariable === index ? null : index)
                              }
                            >
                              {expandedVariable === index ? 'Colapsar' : 'Expandir'}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBlueprintVariable(index)}
                            className="h-6 w-6 opacity-70 hover:opacity-100"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium">Nome</label>
                            <div className="relative mt-1">
                              {isVariableNameDuplicate(variable.name, index) && (
                                <AlertCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                              )}
                              <Input
                                value={variable.name}
                                onChange={(e) => {
                                  const updatedVariables = [
                                    ...(form.getValues('blueprintVariables') || []),
                                  ];

                                  updatedVariables[index] = {
                                    ...updatedVariables[index],
                                    name: e.target.value,
                                  };
                                  form.setValue('blueprintVariables', updatedVariables);
                                }}
                                className={`h-7 text-xs ${isVariableNameDuplicate(variable.name, index) ? 'border-destructive pr-8' : ''}`}
                                placeholder="helper.nome_variavel"
                              />
                            </div>
                            {isVariableNameDuplicate(variable.name, index) && (
                              <p className="mt-1 text-xs text-destructive">
                                Este nome já está em uso por outra variável
                              </p>
                            )}
                          </div>

                          {expandedVariable === index && (
                            <div>
                              <label className="text-xs font-medium">Descrição (opcional)</label>
                              <Input
                                value={variable.description || ''}
                                onChange={(e) => {
                                  const updatedVariables = [
                                    ...(form.getValues('blueprintVariables') || []),
                                  ];

                                  updatedVariables[index] = {
                                    ...updatedVariables[index],
                                    description: e.target.value,
                                  };
                                  form.setValue('blueprintVariables', updatedVariables);
                                }}
                                className="mt-1 h-7 text-xs"
                                placeholder="Descreva o propósito desta variável"
                              />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium">
                                {variable.type === 'advanced' ? 'Expressão Go Template' : 'Valor'}
                              </label>
                              {variable.type === 'advanced' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 p-0 text-xs"
                                  onClick={() => {
                                    // Verificar sintaxe da expressão (básico)
                                    const value = variable.value || '';
                                    const openBraces = (value.match(/{{/g) || []).length;
                                    const closeBraces = (value.match(/}}/g) || []).length;

                                    if (openBraces !== closeBraces) {
                                      toast.error('Erro de sintaxe', {
                                        description:
                                          'Número de chaves de abertura e fechamento não coincide',
                                      });
                                    } else {
                                      toast.success('Sintaxe válida', {
                                        description:
                                          'A expressão parece estar corretamente formatada',
                                      });
                                    }
                                  }}
                                >
                                  Verificar
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={variable.value || ''}
                              onChange={(e) => {
                                const updatedVariables = [
                                  ...(form.getValues('blueprintVariables') || []),
                                ];

                                updatedVariables[index] = {
                                  ...updatedVariables[index],
                                  value: e.target.value,
                                };
                                form.setValue('blueprintVariables', updatedVariables);
                              }}
                              className={`mt-1 text-xs ${variable.type === 'advanced' ? 'font-mono' : ''}`}
                              rows={
                                expandedVariable === index
                                  ? variable.type === 'advanced'
                                    ? 6
                                    : 3
                                  : 1
                              }
                              placeholder={
                                variable.type === 'advanced'
                                  ? '{{- if eq .Values.environment "production" -}}\nprod\n{{- else -}}\ndev\n{{- end -}}'
                                  : 'Valor fixo que será substituído'
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(form.getValues('blueprintVariables') || []).length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={updateHelperTpl}
                    variant="outline"
                    className="gap-1"
                    data-testid="generate-helper-tpl-button"
                  >
                    <Code className="h-4 w-4" />
                    Gerar helper.tpl
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna 2: Preview do helper.tpl */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview do helper.tpl</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setShowVariablePreview(!showVariablePreview)}
                >
                  <FileText className="h-3 w-3" />
                  {showVariablePreview ? 'Ver Código' : 'Documentação'}
                </Button>
              </div>
              <CardDescription>
                Visualize como o arquivo helper.tpl será gerado a partir das variáveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showVariablePreview ? (
                // Documentação das variáveis
                <div className="rounded-md border bg-muted/30 p-4">
                  <h4 className="mb-3 text-sm font-medium">Documentação de Variáveis</h4>

                  {(form.getValues('blueprintVariables') || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma variável definida.</p>
                  ) : (
                    <div className="space-y-4">
                      {(form.getValues('blueprintVariables') || []).map((variable, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={variable.type === 'advanced' ? 'secondary' : 'default'}>
                              {variable.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {variable.type === 'advanced' ? 'Expressão' : 'Valor Fixo'}
                            </span>
                          </div>
                          {variable.description && (
                            <p className="text-xs text-muted-foreground">{variable.description}</p>
                          )}
                          <div className="rounded border bg-muted p-2 font-mono text-xs">
                            {variable.value || '<vazio>'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Código do helper.tpl
                <div className="rounded-md border bg-muted p-4">
                  <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm">
                    <code>{form.getValues('helperTpl') || generateHelperTplContent()}</code>
                  </pre>
                </div>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  Este arquivo define funções helper que serão usadas nas instâncias do blueprint.
                  Clique em "Gerar helper.tpl" para atualizar o conteúdo com base nas variáveis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Form submission handlers
  const onBasicInfoSubmit = (data: FormValues) => {
    if (mode === 'create') {
      // Atualizar dados básicos no contexto
      updateBlueprintData({
        name: data.name,
        description: data.description,
      });

      // Avançar para próxima etapa
      if (onNextStep) {
        onNextStep();
      }
    }
  };

  const onTemplateAssociationSubmit = (data: FormValues) => {
    if (mode === 'create') {
      // Atualizar templates selecionados no contexto
      if (data.selectedTemplates) {
        // Verificar se a função updateChildTemplates existe antes de chamá-la
        if (typeof updateChildTemplates === 'function') {
          updateChildTemplates(data.selectedTemplates);
        } else {
          console.warn(
            'Warning: updateChildTemplates is not a function. Templates may not be saved in context.'
          );
        }
      }

      // Avançar para próxima etapa
      if (onNextStep) {
        onNextStep();
      }
    }
  };

  const onVariablesSubmit = (data: FormValues) => {
    if (mode === 'create') {
      // Atualizar variáveis no contexto
      if (data.blueprintVariables) {
        // Usamos a nova função para variáveis estendidas
        updateBlueprintVariables(data.blueprintVariables);

        // Geramos o helper.tpl baseado nas novas variáveis
        generateHelperTpl();
      }

      // Avançar para próxima etapa
      if (onNextStep) {
        onNextStep();
      }
    }
  };

  const handleFinalSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Para o modo create, geramos o helper.tpl final se necessário
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

  // Componente para os campos de informações básicas (Etapa 1)
  const renderBasicInfoFields = (isWizard: boolean) => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required-field">Nome do Blueprint</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: E-commerce Platform"
                {...field}
                data-testid="blueprint-name-input"
              />
            </FormControl>
            <FormDescription>Nome único para identificar este blueprint.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="required-field">Descrição</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                  className="h-7 gap-1 text-xs"
                >
                  {showMarkdownPreview ? (
                    <Code className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {showMarkdownPreview ? 'Editar' : 'Preview'}
                </Button>
              </div>
              <FormControl>
                {showMarkdownPreview ? (
                  <div className="min-h-[150px] rounded-md border bg-muted/30 p-3">
                    <MarkdownPreview content={field.value || '*Sem descrição*'} />
                  </div>
                ) : (
                  <Textarea
                    placeholder="Descrição detalhada do blueprint (suporta markdown)"
                    {...field}
                    rows={5}
                    data-testid="blueprint-description-input"
                  />
                )}
              </FormControl>
              <FormDescription>
                Descreva o propósito e uso deste blueprint. Suporta formatação Markdown.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  // Renderiza o conteúdo adequado ao modo atual
  const renderContent = () => {
    // No modo de edição, usamos as tabs
    if (mode === 'edit') {
      return (
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="templates">Templates Associados</TabsTrigger>
            <TabsTrigger value="variables">Variáveis</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {renderBasicInfoFields(false)}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {renderTemplateCatalog()}
              {renderSelectedTemplatesList()}
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-6">
            {renderBlueprintVariablesForm()}
          </TabsContent>

          <div className="mt-6 flex justify-end space-x-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const hasChanges = JSON.stringify(form.formState.dirtyFields) !== '{}';

                if (hasChanges) {
                  setShowConfirmDialog(true);
                } else {
                  onCancel();
                }
              }}
            >
              Cancelar
            </Button>
            <Button onClick={form.handleSubmit(handleFinalSubmit)} disabled={isSubmitting}>
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
      );
    }

    // No modo de criação, mostramos o conteúdo adequado à etapa atual
    switch (currentStep) {
      case 1:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onBasicInfoSubmit)} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Informações Gerais</h2>
                <p className="text-sm text-muted-foreground">
                  Defina as informações básicas do blueprint.
                </p>
              </div>

              {renderBasicInfoFields(true)}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" data-testid="next-step-button">
                  Próximo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onTemplateAssociationSubmit)} className="space-y-4">
              {/* Grid para conter ambas as colunas com alinhamento perfeito */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Coluna da esquerda: Catálogo de Templates */}
                <div className="flex flex-col">
                  <div className="mb-3 flex h-8 items-center justify-between">
                    <h3 className="text-sm font-medium">Catálogo de Templates</h3>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar templates..."
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Lista de templates disponíveis com altura fixa */}
                  <div
                    className="flex-grow overflow-auto rounded-md border"
                    style={{ height: '450px' }}
                  >
                    {templatesLoading ? (
                      <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Carregando templates...</span>
                      </div>
                    ) : filteredCatalogTemplates.length === 0 ? (
                      <div className="flex h-40 flex-col items-center justify-center text-center">
                        <div className="text-muted-foreground">Nenhum template encontrado</div>
                        <p className="text-xs text-muted-foreground">
                          {templateSearchQuery
                            ? 'Tente ajustar os termos de busca'
                            : 'Não há templates disponíveis'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {filteredCatalogTemplates.map((template) => {
                          const isSelected = isTemplateSelected(template.id);

                          return (
                            <div
                              key={template.id}
                              className={`flex items-center justify-between p-3 hover:bg-muted/50 ${
                                isSelected ? 'border-l-2 border-l-primary bg-primary/5' : ''
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium">{template.name}</h4>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {template.description || 'Sem descrição'}
                                </p>
                                <div className="mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {template.category || 'Sem categoria'}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? 'secondary' : 'ghost'}
                                onClick={() => !isSelected && addTemplateToSelection(template)}
                                disabled={isSelected}
                                className="self-start"
                              >
                                {isSelected ? 'Adicionado' : 'Adicionar'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna da direita: Templates Selecionados */}
                <div className="flex flex-col">
                  <div className="mb-3 flex h-8 items-center justify-end">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">Templates no Blueprint</h3>
                      {/* Badge integrado ao título para melhor impacto visual */}
                      {(form.getValues('selectedTemplates') || []).length > 0 && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                          {(form.getValues('selectedTemplates') || []).length}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Lista de templates selecionados com mesma altura fixa */}
                  <div
                    className="flex-grow overflow-auto rounded-md border"
                    style={{ height: '450px' }}
                  >
                    {(form.getValues('selectedTemplates') || []).length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <div className="mb-4 h-16 w-16 text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100%"
                            height="100%"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Selecione templates do catálogo para adicionar ao blueprint
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {(form.getValues('selectedTemplates') || [])
                          .sort((a, b) => a.order - b.order)
                          .map((template, index) => {
                            const templateInfo = templates.find(
                              (t) => t.id === template.templateId
                            );

                            return (
                              <div key={index} className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                                      {template.order}
                                    </span>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        {templateInfo?.name || 'Template desconhecido'}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        Identificador:{' '}
                                        <span className="font-medium">{template.identifier}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTemplate(index)}
                                    className="h-7 w-7"
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Remover</span>
                                  </Button>
                                </div>
                                <div className="mt-3 space-y-2">
                                  <div>
                                    <label className="text-xs font-medium">Identificador</label>
                                    <Input
                                      value={template.identifier}
                                      onChange={(e) =>
                                        updateTemplateIdentifier(index, e.target.value)
                                      }
                                      className="mt-1 h-7 text-xs"
                                      placeholder="identificador-unico"
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <label className="text-xs font-medium">
                                        Ordem de execução
                                      </label>
                                      <div className="flex gap-1">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={() => {
                                            // ...existing code...
                                          }}
                                          disabled={index === 0}
                                          className="h-5 w-5"
                                        >
                                          <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={() => {
                                            // ...existing code...
                                          }}
                                          disabled={
                                            index ===
                                            (form.getValues('selectedTemplates') || []).length - 1
                                          }
                                          className="h-5 w-5"
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M12 5v14" />
                                            <path d="m19 12-7 7-7-7" />
                                          </svg>
                                        </Button>
                                      </div>
                                    </div>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={template.order}
                                      onChange={(e) => {
                                        // ...existing code...
                                      }}
                                      className="mt-1 h-7 text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onPrevStep}>
                  Voltar
                </Button>
                <Button type="submit" data-testid="templates-next-button">
                  Próximo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        );

      case 3:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onVariablesSubmit)} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Blueprint Variables</h2>
                <p className="text-sm text-muted-foreground">
                  Defina variáveis reutilizáveis que serão usadas nos templates do blueprint.
                </p>
              </div>

              {renderBlueprintVariablesForm()}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onPrevStep}>
                  Voltar
                </Button>
                <Button type="submit" data-testid="variables-next-button">
                  Próximo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Resumo e Confirmação</h2>
              <p className="text-sm text-muted-foreground">
                Confirme as informações do blueprint antes de criar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Informações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">Nome</div>
                    <div className="text-sm">{form.getValues('name')}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Descrição</div>
                    <div className="text-sm text-muted-foreground">
                      {form.getValues('description') || 'Nenhuma descrição fornecida'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Categoria</div>
                    <div className="text-sm">{form.getValues('category')}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Template Principal</div>
                    <div className="text-sm">{getTemplateName(form.getValues('templateId'))}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Templates Associados */}
              <Card>
                <CardHeader>
                  <CardTitle>Templates Associados</CardTitle>
                  <CardDescription>
                    {(form.getValues('selectedTemplates') || []).length} templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[120px]">
                    <div className="space-y-2">
                      {(form.getValues('selectedTemplates') || []).map((template, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.identifier}
                            </Badge>
                            <span className="text-sm">{getTemplateName(template.templateId)}</span>
                          </div>
                          <Badge className="text-xs">Ordem: {template.order}</Badge>
                        </div>
                      ))}
                      {!(form.getValues('selectedTemplates') || []).length && (
                        <div className="text-sm text-muted-foreground">
                          Nenhum template associado além do principal.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Blueprint Variables */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Blueprint Variables</CardTitle>
                  <CardDescription>
                    {(form.getValues('blueprintVariables') || []).length} variáveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(form.getValues('blueprintVariables') || []).map((variable, index) => (
                        <Badge
                          key={index}
                          className={`${variable.type === 'advanced' ? 'bg-blue-500' : 'bg-primary'}`}
                        >
                          {variable.name}
                          {variable.type === 'advanced' && <Code className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                      {!(form.getValues('blueprintVariables') || []).length && (
                        <div className="text-sm text-muted-foreground">
                          Nenhuma variável definida.
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border bg-muted p-4">
                      <div className="mb-2 text-sm font-medium">Preview do helper.tpl</div>
                      <pre className="max-h-[200px] overflow-auto whitespace-pre-wrap text-sm">
                        <code>{form.getValues('helperTpl') || '# Nenhuma variável definida.'}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validações */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Validação do Blueprint</CardTitle>
                </CardHeader>
                <CardContent>{renderValidations()}</CardContent>
              </Card>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevStep}
                data-testid="summary-back-button"
              >
                Voltar
              </Button>
              <Button
                onClick={form.handleSubmit(handleFinalSubmit)}
                disabled={isSubmitting || hasValidationErrors()}
                data-testid="create-blueprint-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Criar Blueprint
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderiza as validações na etapa de confirmação
  const renderValidations = () => {
    // Array para armazenar as validações
    const validations: Array<{ type: 'error' | 'warning' | 'success'; message: string }> = [];

    // 1. Verificar nome e descrição
    if (!form.getValues('name')?.trim()) {
      validations.push({ type: 'error', message: 'Nome do blueprint é obrigatório' });
    }

    if (!form.getValues('description')?.trim()) {
      validations.push({ type: 'error', message: 'Descrição do blueprint é obrigatória' });
    }

    // 3. Verificar templates selecionados (identifiers únicos)
    const selectedTemplates = form.getValues('selectedTemplates') || [];
    const identifiers = selectedTemplates.map((t) => t.identifier);
    const uniqueIdentifiers = new Set(identifiers);

    if (identifiers.length > uniqueIdentifiers.size) {
      validations.push({
        type: 'error',
        message: 'Existem identificadores duplicados nos templates',
      });
    }

    // 4. Verificar variáveis de blueprint (nomes únicos e sintaxe)
    const blueprintVariables = form.getValues('blueprintVariables') || [];
    const variableNames = blueprintVariables.map((v) => v.name);
    const uniqueNames = new Set(variableNames);

    if (variableNames.length > uniqueNames.size) {
      validations.push({ type: 'error', message: 'Existem nomes duplicados nas variáveis' });
    }

    // Verificar sintaxe Go Template nas expressões avançadas
    blueprintVariables
      .filter((v) => v.type === 'advanced')
      .forEach((variable, index) => {
        const value = variable.value || '';
        const openBraces = (value.match(/{{/g) || []).length;
        const closeBraces = (value.match(/}}/g) || []).length;

        if (openBraces !== closeBraces) {
          validations.push({
            type: 'error',
            message: `Variável "${variable.name}" tem chaves não balanceadas`,
          });
        }
      });

    // Avisos
    if (blueprintVariables.length === 0) {
      validations.push({ type: 'warning', message: 'Nenhuma variável definida' });
    }

    if (selectedTemplates.length === 0) {
      validations.push({
        type: 'warning',
        message: 'Nenhum template associado',
      });
    }

    // Se não houver erros, mostrar mensagem de sucesso
    if (!validations.some((v) => v.type === 'error')) {
      validations.push({
        type: 'success',
        message: 'Blueprint válido e pronto para ser criado',
      });
    }

    // Renderizar as validações
    return (
      <div className="space-y-2">
        {validations.map((validation, index) => (
          <Alert key={index} variant={validation.type === 'error' ? 'destructive' : 'default'}>
            {validation.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : validation.type === 'warning' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {validation.type === 'error'
                ? 'Erro'
                : validation.type === 'warning'
                  ? 'Aviso'
                  : 'Sucesso'}
            </AlertTitle>
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  // Verifica se há erros de validação
  const hasValidationErrors = () => {
    // Verificações básicas que impedem a criação
    if (!form.getValues('name')?.trim() || !form.getValues('description')?.trim()) {
      return true;
    }

    // Verificar identificadores duplicados
    const selectedTemplates = form.getValues('selectedTemplates') || [];
    const identifiers = selectedTemplates.map((t) => t.identifier);
    const uniqueIdentifiers = new Set(identifiers);

    if (identifiers.length > uniqueIdentifiers.size) {
      return true;
    }

    // Verificar nomes de variáveis duplicados
    const blueprintVariables = form.getValues('blueprintVariables') || [];
    const variableNames = blueprintVariables.map((v) => v.name);
    const uniqueNames = new Set(variableNames);

    if (variableNames.length > uniqueNames.size) {
      return true;
    }

    // Verificar sintaxe Go Template
    const hasTemplateErrors = blueprintVariables
      .filter((v) => v.type === 'advanced')
      .some((variable) => {
        const value = variable.value || '';
        const openBraces = (value.match(/{{/g) || []).length;
        const closeBraces = (value.match(/}}/g) || []).length;

        return openBraces !== closeBraces;
      });

    return hasTemplateErrors;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>{renderContent()}</Form>

      {/* Diálogo de confirmação para descartar alterações (apenas no modo edit) */}
      {mode === 'edit' && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Descartar alterações?</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja descartar as alterações feitas? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowConfirmDialog(false);
                  onCancel();
                }}
              >
                Descartar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
