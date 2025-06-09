import { createContext, useCallback, useContext, useReducer, type ReactNode } from 'react';

import { type SectionId } from '@/hooks/blueprint';

// Form state types
export interface BlueprintFormData {
  metadata: {
    name: string;
    description: string;
    tags: string[];
  };
  templates: {
    files: Array<{
      path: string;
      content: string;
    }>;
  };
  variables: {
    vars: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
      defaultValue?: string;
    }>;
  };
  defaults: {
    values: Record<string, string>;
  };
  preview?: {
    valid: boolean;
    errors: string[];
  };
}

interface BlueprintFormState {
  formData: BlueprintFormData;
  errors: Partial<Record<keyof BlueprintFormData, string[]>>;
  isDirty: Partial<Record<keyof BlueprintFormData, boolean>>;
}

// Action types
type BlueprintFormAction =
  | {
      type: 'SET_SECTION_DATA';
      section: keyof BlueprintFormData;
      data: BlueprintFormData[keyof BlueprintFormData];
    }
  | { type: 'SET_SECTION_ERRORS'; section: keyof BlueprintFormData; errors: string[] }
  | { type: 'MARK_SECTION_DIRTY'; section: keyof BlueprintFormData }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_BLUEPRINT'; data: BlueprintFormData };

// Initial state
const initialState: BlueprintFormState = {
  formData: {
    metadata: {
      name: '',
      description: '',
      tags: [],
    },
    templates: {
      files: [],
    },
    variables: {
      vars: [],
    },
    defaults: {
      values: {},
    },
  },
  errors: {},
  isDirty: {},
};

// Context
const BlueprintFormContext = createContext<{
  state: BlueprintFormState;
  setSectionData: <T extends keyof BlueprintFormData>(
    section: T,
    data: BlueprintFormData[T]
  ) => void;
  setSectionErrors: (section: keyof BlueprintFormData, errors: string[]) => void;
  markSectionDirty: (section: keyof BlueprintFormData) => void;
  resetForm: () => void;
  loadBlueprint: (data: BlueprintFormData) => void;
  validateSection: (section: SectionId) => Promise<boolean>;
} | null>(null);

// Reducer
function blueprintFormReducer(
  state: BlueprintFormState,
  action: BlueprintFormAction
): BlueprintFormState {
  switch (action.type) {
    case 'SET_SECTION_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: action.data,
        },
      };
    case 'SET_SECTION_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.section]: action.errors,
        },
      };
    case 'MARK_SECTION_DIRTY':
      return {
        ...state,
        isDirty: {
          ...state.isDirty,
          [action.section]: true,
        },
      };
    case 'RESET_FORM':
      return initialState;
    case 'LOAD_BLUEPRINT':
      return {
        ...initialState,
        formData: action.data,
      };
    default:
      return state;
  }
}

// Provider
export function BlueprintFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(blueprintFormReducer, initialState);

  const setSectionData = useCallback(
    <T extends keyof BlueprintFormData>(section: T, data: BlueprintFormData[T]) => {
      dispatch({ type: 'SET_SECTION_DATA', section, data });
    },
    []
  );

  const setSectionErrors = useCallback((section: keyof BlueprintFormData, errors: string[]) => {
    dispatch({ type: 'SET_SECTION_ERRORS', section, errors });
  }, []);

  const markSectionDirty = useCallback((section: keyof BlueprintFormData) => {
    dispatch({ type: 'MARK_SECTION_DIRTY', section });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const loadBlueprint = useCallback((data: BlueprintFormData) => {
    dispatch({ type: 'LOAD_BLUEPRINT', data });
  }, []);

  // Section validation
  const validateSection = useCallback(
    async (section: SectionId): Promise<boolean> => {
      const sectionData = state.formData[section];
      const errors: string[] = [];
      const duplicateNames = new Set<string>();

      // Validation rules per section
      switch (section) {
        case 'metadata': {
          const metadata = sectionData as BlueprintFormData['metadata'];

          if (!metadata?.name?.trim()) {
            errors.push('Name is required');
          }
          break;
        }

        case 'templates': {
          const templates = sectionData as BlueprintFormData['templates'];

          if (!templates?.files?.length) {
            errors.push('At least one template file is required');
          }
          break;
        }

        case 'variables': {
          const variables = sectionData as BlueprintFormData['variables'];
          const vars = variables?.vars || [];

          vars.forEach((variable) => {
            if (!variable.name?.trim()) {
              errors.push('Variable name is required');
            }

            if (!variable.type?.trim()) {
              errors.push('Variable type is required');
            }

            if (duplicateNames.has(variable.name)) {
              errors.push(`Duplicate variable name: ${variable.name}`);
            }
            duplicateNames.add(variable.name);
          });
          break;
        }

        case 'defaults': {
          const defaults = sectionData as BlueprintFormData['defaults'];
          const variables = state.formData.variables?.vars || [];
          const requiredVars = variables.filter((v) => v.required).map((v) => v.name);

          const defaultValues = defaults?.values || {};

          requiredVars.forEach((varName) => {
            if (!defaultValues[varName]) {
              errors.push(`Default value required for: ${varName}`);
            }
          });
          break;
        }

        case 'preview':
          // Preview validation is handled by the preview component itself
          break;
      }

      setSectionErrors(section, errors);

      return errors.length === 0;
    },
    [state.formData, setSectionErrors]
  );

  const value = {
    state,
    setSectionData,
    setSectionErrors,
    markSectionDirty,
    resetForm,
    loadBlueprint,
    validateSection,
  };

  return <BlueprintFormContext.Provider value={value}>{children}</BlueprintFormContext.Provider>;
}

// Hook de validação de seções
const useBlueprintForm = () => {
  const context = useContext(BlueprintFormContext);

  if (!context) {
    throw new Error('useBlueprintForm must be used within a BlueprintFormProvider');
  }

  return context;
};

// Form data types
export interface BlueprintSectionContent {
  metadata: ReactNode;
  templates: ReactNode;
  variables: ReactNode;
  defaults: ReactNode;
  preview: ReactNode;
}

export { useBlueprintForm };
