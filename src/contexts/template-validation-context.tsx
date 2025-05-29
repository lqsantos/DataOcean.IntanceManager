'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { templateService } from '@/services/template-service';

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  message?: string;
}

interface TemplateValidationContextType {
  isOpen: boolean;
  isLoading: boolean;
  templateId: string | null;
  templateName: string;
  validationResult: ValidationResult | null;
  validateTemplate: (templateId: string, templateName: string) => Promise<void>;
  closeModal: () => void;
}

const TemplateValidationContext = createContext<TemplateValidationContextType | undefined>(
  undefined
);

export function TemplateValidationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateTemplate = async (id: string, name: string) => {
    setTemplateId(id);
    setTemplateName(name);
    setIsOpen(true);
    setIsLoading(true);
    setValidationResult(null);

    try {
      const result = await templateService.validateTemplate(id);

      setValidationResult(result);

      return result.isValid;
    } catch (error) {
      toast.error('Erro de validação', {
        description: error instanceof Error ? error.message : 'Falha ao validar o template',
      });

      setValidationResult({
        isValid: false,
        message: 'Falha ao validar o template devido a um erro.',
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTemplateId(null);
    setTemplateName('');
    setValidationResult(null);
  };

  return (
    <TemplateValidationContext.Provider
      value={{
        isOpen,
        isLoading,
        templateId,
        templateName,
        validationResult,
        validateTemplate,
        closeModal,
      }}
    >
      {children}
    </TemplateValidationContext.Provider>
  );
}

export function useTemplateValidation() {
  const context = useContext(TemplateValidationContext);

  if (!context) {
    throw new Error('useTemplateValidation must be used within a TemplateValidationProvider');
  }

  return context;
}
