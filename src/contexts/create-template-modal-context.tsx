'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { templateService } from '@/services/template-service';
import type { CreateTemplateDto, Template } from '@/types/template';

interface CreateTemplateContextType {
  isOpen: boolean;
  isLoading: boolean;
  openModal: () => void;
  closeModal: () => void;
  createTemplate: (data: CreateTemplateDto) => Promise<Template | null>;
}

const CreateTemplateModalContext = createContext<CreateTemplateContextType | undefined>(undefined);

export function CreateTemplateModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Esta função só deve ser chamada explicitamente quando o usuário clica no botão "Create Template"
  const createTemplate = async (data: CreateTemplateDto): Promise<Template | null> => {
    // Garantir que o fluxo de criação esteja sendo iniciado explicitamente
    setIsLoading(true);

    try {
      const newTemplate = await templateService.createTemplate(data);

      toast.success('Template criado', {
        description: `O template ${data.name} foi criado com sucesso.`,
      });

      // Fechar a modal apenas após sucesso na criação
      setIsOpen(false);

      return newTemplate;
    } catch (error) {
      console.error('🔵 [CreateTemplateContext] Erro ao criar template:', error);
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Falha ao criar o template',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CreateTemplateModalContext.Provider
      value={{
        isOpen,
        isLoading,
        openModal,
        closeModal,
        createTemplate,
      }}
    >
      {children}
    </CreateTemplateModalContext.Provider>
  );
}

export function useCreateTemplateModal() {
  const context = useContext(CreateTemplateModalContext);

  if (!context) {
    throw new Error('useCreateTemplateModal must be used within a CreateTemplateModalProvider');
  }

  return context;
}
