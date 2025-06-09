import { useCallback } from 'react';

import {
  type BlueprintFormData,
  type BlueprintSectionContent,
  useBlueprintForm,
} from '@/contexts/blueprint-form-context';

import { type SectionId } from './use-section-validation';

/**
 * Opções para o hook useBlueprintSection
 */
interface UseBlueprintSectionOptions {
  mode: 'create' | 'edit';
  sectionContent: Partial<BlueprintSectionContent>;
}

/**
 * Hook para gerenciar uma seção específica do formulário de blueprint
 * Fornece acesso aos dados, erros e estado de completude da seção
 *
 * @example
 * const { sectionData, sectionErrors, isComplete, validate, updateData } =
 *   useBlueprintSection('metadata', { mode: 'create', sectionContent: {} });
 */
export function useBlueprintSection(section: SectionId, options: UseBlueprintSectionOptions) {
  const {
    state,
    setSectionData,
    validateSection,
    hasErrors,
    isSectionComplete,
    markSectionComplete,
  } = useBlueprintForm();
  const { mode, sectionContent } = options;

  const sectionData = state.formData[section];
  const sectionErrors = state.errors[section] || [];
  const isDirty = state.isDirty[section] || false;
  const isComplete = isSectionComplete(section);

  /**
   * Valida a seção e retorna se é válida
   */
  const validate = useCallback(async () => {
    return validateSection(section);
  }, [validateSection, section]);

  /**
   * Atualiza os dados da seção
   */
  const updateData = useCallback(
    <T extends BlueprintFormData[keyof BlueprintFormData]>(data: T) => {
      setSectionData(section, data);
    },
    [section, setSectionData]
  );

  /**
   * Marca a seção como completa ou incompleta
   */
  const setComplete = useCallback(
    (complete: boolean) => {
      markSectionComplete(section, complete);
    },
    [section, markSectionComplete]
  );

  /**
   * Verifica se a seção tem erros
   */
  const hasError = hasErrors(section);

  return {
    sectionData,
    sectionErrors,
    isDirty,
    isComplete,
    hasError,
    validate,
    updateData,
    setComplete,
    mode,
    content: sectionContent[section],
  };
}
