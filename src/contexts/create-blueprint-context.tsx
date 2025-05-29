'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { blueprintService } from '@/services/blueprint-service';
import type { Blueprint, BlueprintVariable, CreateBlueprintDto } from '@/types/blueprint';

interface CreateBlueprintContextType {
  isOpen: boolean;
  isLoading: boolean;
  currentStep: number;
  blueprintData: Partial<CreateBlueprintDto>;
  variables: BlueprintVariable[];
  openModal: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBlueprintData: (data: Partial<CreateBlueprintDto>) => void;
  updateVariables: (variables: BlueprintVariable[]) => void;
  createBlueprint: () => Promise<Blueprint | null>;
  resetForm: () => void;
}

const CreateBlueprintContext = createContext<CreateBlueprintContextType | undefined>(undefined);

export function CreateBlueprintProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [blueprintData, setBlueprintData] = useState<Partial<CreateBlueprintDto>>({});
  const [variables, setVariables] = useState<BlueprintVariable[]>([]);

  const openModal = () => {
    setIsOpen(true);
    resetForm();
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const updateBlueprintData = (data: Partial<CreateBlueprintDto>) => {
    setBlueprintData((prev) => ({ ...prev, ...data }));
  };

  const updateVariables = (newVariables: BlueprintVariable[]) => {
    setVariables(newVariables);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setBlueprintData({});
    setVariables([]);
  };

  const createBlueprint = async (): Promise<Blueprint | null> => {
    if (!blueprintData.name || !blueprintData.templateId) {
      toast.error('Informações obrigatórias faltando', {
        description: 'Por favor, forneça todas as informações necessárias para o blueprint.',
      });

      return null;
    }

    setIsLoading(true);

    try {
      // Create the blueprint
      const blueprint = await blueprintService.createBlueprint(blueprintData as CreateBlueprintDto);

      // If we have variables, update the blueprint with them
      if (variables.length > 0) {
        await blueprintService.updateBlueprint({
          id: blueprint.id,
          variables,
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
        blueprintData,
        variables,
        openModal,
        closeModal,
        nextStep,
        prevStep,
        updateBlueprintData,
        updateVariables,
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
