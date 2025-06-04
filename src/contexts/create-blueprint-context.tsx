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
  openModal: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateBlueprintData: (data: Partial<CreateBlueprintDto>) => void;
  updateVariables: (variables: BlueprintVariable[]) => void;
  updateBlueprintVariables: (variables: BlueprintVariableExtended[]) => void; // Nova função
  updateSelectedTemplates: (templates: Omit<BlueprintChildTemplate, 'templateName'>[]) => void; // Renomeado
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

  // Reset do formulário
  const resetForm = () => {
    setCurrentStep(1);
    setBlueprintData({});
    setVariables([]);
    setBlueprintVariables([]);
    setSelectedTemplates([]);
  };

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

  const updateSelectedTemplates = (templates: Omit<BlueprintChildTemplate, 'templateName'>[]) => {
    setSelectedTemplates(templates);
  };

  const updateVariables = (newVariables: BlueprintVariable[]) => {
    setVariables(newVariables);
    // Já não precisamos mais gerar o helperTpl no frontend
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
    // Já não precisamos mais gerar o helperTpl no frontend
  };

  // Criação do blueprint
  const createBlueprint = async (): Promise<Blueprint | null> => {
    if (!blueprintData.name) {
      toast.error('Informações obrigatórias faltando', {
        description: 'Por favor, forneça um nome para o blueprint.',
      });

      return null;
    }

    // Verificar se pelo menos um template está associado ao blueprint
    if (!selectedTemplates || selectedTemplates.length === 0) {
      toast.error('Templates faltando', {
        description: 'Por favor, selecione pelo menos um template para associar ao blueprint.',
      });

      return null;
    }

    setIsLoading(true);

    try {
      // Preparar dados completos para criação
      const createData: CreateBlueprintDto = {
        ...(blueprintData as CreateBlueprintDto),
        // Não precisa mais de templateId
        childTemplates: selectedTemplates.map((template) => ({
          ...template,
          // Não precisa incluir order aqui pois removemos da interface
        })),
      };

      // Criar o blueprint
      const blueprint = await blueprintService.createBlueprint(createData);

      // Atualizar com variáveis - o backend gerará o helperTpl
      if (variables.length > 0) {
        const updateData = {
          id: blueprint.id,
          variables,
          // Não enviamos mais o helperTpl, o backend o gerará
        };

        await blueprintService.updateBlueprint(updateData);
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
        openModal,
        closeModal,
        nextStep,
        prevStep,
        goToStep,
        updateBlueprintData,
        updateVariables,
        updateBlueprintVariables,
        updateSelectedTemplates,
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
