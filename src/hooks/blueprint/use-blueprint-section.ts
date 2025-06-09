import { useCallback } from 'react';

import {
  type BlueprintFormData,
  type BlueprintSectionContent,
  useBlueprintForm,
} from '@/contexts/blueprint-form-context';

import { type SectionId } from './use-section-validation';

interface UseBlueprintSectionOptions {
  mode: 'create' | 'edit';
  sectionContent: Partial<BlueprintSectionContent>;
}

export function useBlueprintSection(section: SectionId, options: UseBlueprintSectionOptions) {
  const { state, setSectionData, validateSection } = useBlueprintForm();
  const { mode, sectionContent } = options;

  const sectionData = state.formData[section];
  const sectionErrors = state.errors[section] || [];
  const isDirty = state.isDirty[section] || false;

  const validate = useCallback(async () => {
    return validateSection(section);
  }, [validateSection, section]);

  const updateData = useCallback(
    <T extends BlueprintFormData[keyof BlueprintFormData]>(data: T) => {
      setSectionData(section, data);
    },
    [section, setSectionData]
  );

  return {
    sectionData,
    sectionErrors,
    isDirty,
    validate,
    updateData,
    mode,
    content: sectionContent[section],
  };
}
