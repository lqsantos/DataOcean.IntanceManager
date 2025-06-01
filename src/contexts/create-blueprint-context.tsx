'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { blueprintService } from '@/services/blueprint-service';
import type {
  Blueprint,
  BlueprintChildTemplate,
  BlueprintVariable,
  CreateBlueprintDto,
} from '@/types/blueprint';

// Novo tipo de variável conforme blue.md
interface BlueprintVariableExtended {
  name: string;
  description?: string;
  value: string;
  type: 'simple' | 'advanced';
}

interface CreateBlueprintContextType {
  isOpen: boolean;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  blueprintData: Partial<CreateBlueprintDto>;
  variables: BlueprintVariable[];
  blueprintVariables: BlueprintVariableExtended[]; // Novo tipo de variáveis
  selectedTemplates: Omit<BlueprintChildTemplate, 'templateName'>[]; // Renomeado para clareza
  generatedHelperTpl: string;
  openModal: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateBlueprintData: (data: Partial<CreateBlueprintDto>) => void;
  updateVariables: (variables: BlueprintVariable[]) => void;
  updateBlueprintVariables: (variables: BlueprintVariableExtended[]) => void; // Nova função
  updateSelectedTemplates: (templates: Omit<BlueprintChildTemplate, 'templateName'>[]) => void; // Renomeado
  generateHelperTpl: () => string;
  createBlueprint: () => Promise<Blueprint | null>;
  resetForm: () => void;
}

const CreateBlueprintContext = createContext<CreateBlueprintContextType | undefined>(undefined);

export function CreateBlueprintProvider({ children }: { children: ReactNode }) {
  // Estado do modal
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Navegação entre etapas
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Alterado para 4 etapas conforme blue.md

  // Dados do blueprint
  const [blueprintData, setBlueprintData] = useState<Partial<CreateBlueprintDto>>({});
  const [variables, setVariables] = useState<BlueprintVariable[]>([]);
  const [blueprintVariables, setBlueprintVariables] = useState<BlueprintVariableExtended[]>([]); // Novas variáveis
  const [selectedTemplates, setSelectedTemplates] = useState<
    Omit<BlueprintChildTemplate, 'templateName'>[]
  >([]);
  const [generatedHelperTpl, setGeneratedHelperTpl] = useState('');

  // Funções de controle do modal
  const openModal = () => {
    setIsOpen(true);
    resetForm();
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Funções de navegação
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Funções de atualização de dados
  const updateBlueprintData = (data: Partial<CreateBlueprintDto>) => {
    setBlueprintData((prev) => ({ ...prev, ...data }));
  };

  const updateVariables = (newVariables: BlueprintVariable[]) => {
    setVariables(newVariables);
    // Ao atualizar variáveis, regeneramos o helper.tpl
    setGeneratedHelperTpl(generateHelperTplContent(newVariables));
  };

  // Nova função para atualizar blueprint variables conforme blue.md
  const updateBlueprintVariables = (newVariables: BlueprintVariableExtended[]) => {
    setBlueprintVariables(newVariables);

    // Converter para o formato antigo para compatibilidade
    const convertedVariables: BlueprintVariable[] = newVariables.map((v) => ({
      name: v.name.replace('helper.', ''),
      description: v.description,
      defaultValue: v.value,
      required: true,
      type: 'string', // Por padrão, considerar como string
    }));

    setVariables(convertedVariables);

    // Gerar helper.tpl a partir das novas variáveis
    setGeneratedHelperTpl(generateHelperTplFromExtended(newVariables));
  };

  // Função para gerar helper.tpl a partir das variáveis estendidas
  const generateHelperTplFromExtended = (vars: BlueprintVariableExtended[]): string => {
    if (!vars || vars.length === 0) {
      return '';
    }

    const helperContent = vars
      .map((variable) => {
        const description = variable.description ? `{{/* ${variable.description} */}}\n` : '';

        return `${description}{{- define "${variable.name}" -}}
${variable.value || ''}
{{- end }}`;
      })
      .join('\n\n');

    return helperContent;
  };

  const updateSelectedTemplates = (templates: Omit<BlueprintChildTemplate, 'templateName'>[]) => {
    // Garantir que cada template tenha uma ordem sequencial
    const templatesWithOrder = templates.map((template, index) => ({
      ...template,
      order: template.order || index + 1,
    }));

    setSelectedTemplates(templatesWithOrder);
  };

  // Gerar o conteúdo do helper.tpl com base nas variáveis (para compatibilidade)
  const generateHelperTplContent = (vars: BlueprintVariable[]): string => {
    if (!vars || vars.length === 0) {
      return '';
    }

    const helperContent = vars
      .map((variable) => {
        let defaultValue = '';

        // Formatar o valor padrão de acordo com o tipo
        if (variable.defaultValue !== undefined) {
          if (variable.type === 'string') {
            defaultValue = variable.defaultValue;
          } else if (variable.type === 'number') {
            defaultValue = String(Number(variable.defaultValue) || 0);
          } else if (variable.type === 'boolean') {
            defaultValue = variable.defaultValue.toLowerCase() === 'true' ? 'true' : 'false';
          }
        }

        return `{{- define "helper.${variable.name}" -}}
${defaultValue}
{{- end }}`;
      })
      .join('\n\n');

    return helperContent;
  };

  // Função para regenerar o helper.tpl (útil para a etapa de preview)
  const generateHelperTpl = (): string => {
    let content;

    // Se tivermos blueprint variables, usar elas prioritariamente
    if (blueprintVariables.length > 0) {
      content = generateHelperTplFromExtended(blueprintVariables);
    } else {
      content = generateHelperTplContent(variables);
    }

    setGeneratedHelperTpl(content);

    return content;
  };

  // Reset do formulário
  const resetForm = () => {
    setCurrentStep(1);
    setBlueprintData({});
    setVariables([]);
    setBlueprintVariables([]);
    setSelectedTemplates([]);
    setGeneratedHelperTpl('');
  };

  // Criação do blueprint
  const createBlueprint = async (): Promise<Blueprint | null> => {
    if (!blueprintData.name || !blueprintData.templateId) {
      toast.error('Informações obrigatórias faltando', {
        description: 'Por favor, forneça todas as informações necessárias para o blueprint.',
      });

      return null;
    }

    setIsLoading(true);

    try {
      // Preparar dados completos para criação
      const createData: CreateBlueprintDto = {
        ...(blueprintData as CreateBlueprintDto),
        childTemplates: selectedTemplates,
      };

      // Criar o blueprint
      const blueprint = await blueprintService.createBlueprint(createData);

      // Atualizar com variáveis e helper.tpl gerado
      if (variables.length > 0 || generatedHelperTpl) {
        await blueprintService.updateBlueprint({
          id: blueprint.id,
          variables,
          helperTpl: generatedHelperTpl || generateHelperTplContent(variables),
        });
      }

      toast.success('Blueprint criado', {
        description: `Blueprint ${blueprint.name} foi criado com sucesso.`,
      });

      setIsOpen(false);
      resetForm();

      return blueprint;
    } catch (error) {
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Falha ao criar blueprint',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CreateBlueprintContext.Provider
      value={{
        isOpen,
        isLoading,
        currentStep,
        totalSteps,
        blueprintData,
        variables,
        blueprintVariables,
        selectedTemplates,
        generatedHelperTpl,
        openModal,
        closeModal,
        nextStep,
        prevStep,
        goToStep,
        updateBlueprintData,
        updateVariables,
        updateBlueprintVariables,
        updateSelectedTemplates,
        generateHelperTpl,
        createBlueprint,
        resetForm,
      }}
    >
      {children}
    </CreateBlueprintContext.Provider>
  );
}

export function useCreateBlueprint() {
  const context = useContext(CreateBlueprintContext);

  if (!context) {
    throw new Error('useCreateBlueprint must be used within a CreateBlueprintProvider');
  }

  return context;
}
