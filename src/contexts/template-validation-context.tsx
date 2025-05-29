'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { templateService } from '@/services/template-service';
import type { CreateTemplateDto } from '@/types/template';

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  message?: string;
}

interface TemplateData {
  id?: string;
  name: string;
  repositoryUrl: string;
  chartPath: string;
}

interface TemplateValidationContextType {
  isOpen: boolean;
  isSelectBranchOpen: boolean;
  isLoading: boolean;
  templateId: string | null;
  templateName: string;
  templateData: TemplateData | null;
  validationResult: ValidationResult | null;
  validateTemplate: (
    templateId: string | null,
    templateName: string,
    templateData?: Partial<CreateTemplateDto>
  ) => Promise<void>;
  closeModal: () => void;
  confirmBranchSelection: (branch: string) => Promise<void>;
  cancelBranchSelection: () => void;
}

const TemplateValidationContext = createContext<TemplateValidationContextType | undefined>(
  undefined
);

export function TemplateValidationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectBranchOpen, setIsSelectBranchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateTemplate = async (
    id: string | null,
    name: string,
    data?: Partial<CreateTemplateDto>
  ) => {
    setTemplateId(id);
    setTemplateName(name);

    // Se recebemos dados do template, armazenamos para uso na validação
    if (data) {
      setTemplateData({
        id: id || undefined,
        name,
        repositoryUrl: data.repositoryUrl || '',
        chartPath: data.chartPath || '',
      });
    }

    setIsSelectBranchOpen(true);
  };

  const confirmBranchSelection = async (branch: string) => {
    setIsSelectBranchOpen(false);
    setIsOpen(true);
    setIsLoading(true);
    setValidationResult(null);

    try {
      let result;

      // Se temos dados do template e não um ID existente, usamos a validação com dados
      if (templateData && !templateId) {
        result = await templateService.validateTemplateData({
          repositoryUrl: templateData.repositoryUrl,
          chartPath: templateData.chartPath,
          branch,
        });
      } else if (templateId) {
        // Se temos um ID existente, usamos a validação com ID
        result = await templateService.validateTemplate(templateId, branch);
      } else {
        throw new Error('Dados insuficientes para validação');
      }

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

  const cancelBranchSelection = () => {
    setIsSelectBranchOpen(false);
    setTemplateId(null);
    setTemplateName('');
    setTemplateData(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTemplateId(null);
    setTemplateName('');
    setTemplateData(null);
    setValidationResult(null);
  };

  return (
    <TemplateValidationContext.Provider
      value={{
        isOpen,
        isSelectBranchOpen,
        isLoading,
        templateId,
        templateName,
        templateData,
        validationResult,
        validateTemplate,
        closeModal,
        confirmBranchSelection,
        cancelBranchSelection,
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
