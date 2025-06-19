import { useCallback, useState } from 'react';

export type ValidationStatus = 'valid' | 'invalid' | 'not-validated';
export type SectionId = 'metadata' | 'templates' | 'variables' | 'values' | 'preview';

export interface SectionValidation {
  status: ValidationStatus;
  errors: string[];
  completed: boolean;
  // Dependencies represent sections that must be completed before this one can be validated
  dependencies: SectionId[];
}

export interface SectionValidations {
  metadata: SectionValidation;
  templates: SectionValidation;
  variables: SectionValidation;
  values: SectionValidation;
  preview: SectionValidation;
}

// Default validation state for each section
const defaultValidations: SectionValidations = {
  metadata: {
    status: 'not-validated',
    errors: [],
    completed: false,
    dependencies: [],
  },
  templates: {
    status: 'not-validated',
    errors: [],
    completed: false,
    dependencies: ['metadata'],
  },
  variables: {
    status: 'not-validated',
    errors: [],
    completed: false,
    dependencies: ['templates'],
  },
  values: {
    status: 'not-validated',
    errors: [],
    completed: false,
    dependencies: ['templates', 'variables'],
  },
  preview: {
    status: 'not-validated',
    errors: [],
    completed: false,
    dependencies: ['metadata', 'templates', 'variables', 'defaults'],
  },
};

/**
 * useSectionValidation - Hook para gerenciar o estado de validação das seções do blueprint
 *
 * @returns Objeto com funções e estados para gerenciar validações de seção
 */
export function useSectionValidation() {
  const [validations, setValidations] = useState<SectionValidations>({ ...defaultValidations });

  /**
   * Verifica se uma seção pode ser acessada com base nas dependências
   *
   * @param sectionId - ID da seção a verificar
   * @returns Booleano indicando se a seção pode ser acessada
   */
  const canAccessSection = useCallback((_sectionId: SectionId): boolean => {
    // Permitir navegação livre entre todas as seções
    return true;
  }, []);

  /**
   * Atualiza o estado de validação de uma seção
   *
   * @param sectionId - ID da seção a atualizar
   * @param validation - Dados de validação parcial
   */
  const updateSectionValidation = useCallback(
    (sectionId: SectionId, validation: Partial<Omit<SectionValidation, 'dependencies'>>) => {
      setValidations((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          ...validation,
        },
      }));
    },
    []
  );

  /**
   * Marca uma seção como completa/incompleta
   *
   * @param sectionId - ID da seção a marcar
   * @param isCompleted - Estado de completude
   */
  const setSectionCompleted = useCallback(
    (sectionId: SectionId, isCompleted: boolean) => {
      updateSectionValidation(sectionId, {
        completed: isCompleted,
        status: isCompleted ? 'valid' : 'not-validated',
      });
    },
    [updateSectionValidation]
  );

  /**
   * Valida uma seção com base em erros fornecidos
   *
   * @param sectionId - ID da seção a validar
   * @param errors - Array de mensagens de erro (vazio se válido)
   */
  const validateSection = useCallback(
    (sectionId: SectionId, errors: string[]) => {
      const isValid = errors.length === 0;

      updateSectionValidation(sectionId, {
        status: isValid ? 'valid' : 'invalid',
        errors,
        completed: isValid,
      });

      return isValid;
    },
    [updateSectionValidation]
  );

  /**
   * Verifica se uma seção está completa
   *
   * @param sectionId - ID da seção a verificar
   * @returns Booleano indicando se a seção está completa
   */
  const isSectionComplete = useCallback(
    (sectionId: SectionId): boolean => {
      return validations[sectionId].completed;
    },
    [validations]
  );

  /**
   * Obtém o próximo passo disponível após a seção atual
   * Sempre permite avançar para a próxima seção
   *
   * @param currentSectionId - ID da seção atual
   * @returns ID da próxima seção disponível, ou undefined se não houver
   */
  const getNextAvailableSection = useCallback(
    (currentSectionId: SectionId): SectionId | undefined => {
      const sectionOrder: SectionId[] = ['metadata', 'templates', 'variables', 'values', 'preview'];
      const currentIndex = sectionOrder.indexOf(currentSectionId);

      // Se for a última seção, não há próxima
      if (currentIndex === sectionOrder.length - 1) {
        return undefined;
      }

      // Sempre retorna a próxima seção sem verificação
      return sectionOrder[currentIndex + 1];
    },
    []
  );

  return {
    validations,
    canAccessSection,
    updateSectionValidation,
    setSectionCompleted,
    validateSection,
    isSectionComplete,
    getNextAvailableSection,
  };
}
