import { createContext, useCallback, useContext, useReducer, type ReactNode } from 'react';

import { type SectionId } from '@/hooks/blueprint';
import type { BlueprintFormValues } from '@/types/blueprint';

// Form state types
export interface BlueprintFormData {
  metadata: {
    name: string;
    description: string;
    version: string;
    applicationId: string;
    tags: string[];
  };
  templates: {
    selectedTemplates: Array<{
      templateId: string;
      identifier: string;
      order: number;
      overrideValues?: string;
    }>;
  };
  variables: {
    variables: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
      defaultValue?: string;
    }>;
  };
  values: {
    values: Record<string, Record<string, unknown>>;
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
  // Add tracking of dirty fields at a field level
  dirtyFields: Partial<Record<keyof BlueprintFormData, Record<string, boolean>>>;
  isComplete: Partial<Record<keyof BlueprintFormData, boolean>>;
  mode: 'create' | 'edit';
  editId?: string;
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
  | { type: 'MARK_FIELD_DIRTY'; section: keyof BlueprintFormData; field: string }
  | { type: 'MARK_SECTION_COMPLETE'; section: keyof BlueprintFormData; isComplete: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_BLUEPRINT'; data: BlueprintFormData; mode: 'create' | 'edit'; editId?: string };

// Initial state
const initialFormData: BlueprintFormData = {
  metadata: {
    name: '',
    description: '',
    version: '',
    applicationId: '',
    tags: [],
  },
  templates: {
    selectedTemplates: [],
  },
  variables: {
    variables: [],
  },
  values: {
    values: {},
  },
};

const initialState: BlueprintFormState = {
  formData: initialFormData,
  errors: {},
  isDirty: {},
  dirtyFields: {},
  isComplete: {},
  mode: 'create',
};

// Definição do tipo do contexto
interface BlueprintFormContextType {
  state: BlueprintFormState;
  setSectionData: <T extends keyof BlueprintFormData>(
    section: T,
    data: BlueprintFormData[T]
  ) => void;
  updateSection: (section: 'templates' | 'variables', data: any[]) => void;
  setSectionErrors: (section: keyof BlueprintFormData, errors: string[]) => void;
  markSectionDirty: (section: keyof BlueprintFormData) => void;
  markFieldDirty: (section: keyof BlueprintFormData, field: string) => void;
  markSectionComplete: (section: keyof BlueprintFormData, isComplete: boolean) => void;
  resetForm: () => void;
  loadBlueprint: (data: BlueprintFormData, mode: 'create' | 'edit', editId?: string) => void;
  validateSection: (section: SectionId) => Promise<boolean>;
  hasErrors: (section: keyof BlueprintFormData) => boolean;
  isSectionComplete: (section: keyof BlueprintFormData) => boolean;
  convertToApiFormat: () => BlueprintFormValues;
}

// Criação do contexto
const BlueprintFormContext = createContext<BlueprintFormContextType | null>(null);

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
        isDirty: {
          ...state.isDirty,
          [action.section]: true,
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
    case 'MARK_FIELD_DIRTY':
      return {
        ...state,
        isDirty: {
          ...state.isDirty,
          [action.section]: true,
        },
        dirtyFields: {
          ...state.dirtyFields,
          [action.section]: {
            ...(state.dirtyFields[action.section] || {}),
            [action.field]: true,
          },
        },
      };
    case 'MARK_SECTION_COMPLETE':
      return {
        ...state,
        isComplete: {
          ...state.isComplete,
          [action.section]: action.isComplete,
        },
      };
    case 'RESET_FORM':
      return {
        ...initialState,
        mode: state.mode, // Preservar o modo (create/edit)
        editId: state.editId, // Preservar o ID em edição, se houver
      };
    case 'LOAD_BLUEPRINT':
      return {
        formData: action.data,
        errors: {},
        isDirty: {},
        dirtyFields: {},
        isComplete: {},
        mode: action.mode,
        editId: action.editId,
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

  const markFieldDirty = useCallback((section: keyof BlueprintFormData, field: string) => {
    dispatch({ type: 'MARK_FIELD_DIRTY', section, field });
  }, []);

  const markSectionComplete = useCallback(
    (section: keyof BlueprintFormData, isComplete: boolean) => {
      dispatch({ type: 'MARK_SECTION_COMPLETE', section, isComplete });
    },
    []
  );

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const loadBlueprint = useCallback(
    (data: BlueprintFormData, mode: 'create' | 'edit', editId?: string) => {
      dispatch({ type: 'LOAD_BLUEPRINT', data, mode, editId });
    },
    []
  );

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
            errors.push('validation.nameRequired');
          } else if (metadata.name.length < 3) {
            errors.push('validation.nameMinLength');
          }

          if (!metadata?.version?.trim()) {
            errors.push('validation.versionRequired');
          }

          if (!metadata?.applicationId?.trim()) {
            errors.push('validation.applicationRequired');
          }

          // Descrição é opcional, mas se fornecida deve ter conteúdo
          if (metadata?.description && metadata.description.trim().length < 1) {
            errors.push('validation.descriptionNotEmpty');
          }

          break;
        }

        case 'templates': {
          const templates = sectionData as BlueprintFormData['templates'];

          if (!templates?.selectedTemplates?.length) {
            errors.push('Pelo menos um template deve ser selecionado');
          } else {
            // Verificar identificadores duplicados
            const identifiers = new Set<string>();

            templates.selectedTemplates.forEach((template) => {
              if (!template.templateId) {
                errors.push('ID do template é obrigatório');
              }

              if (!template.identifier) {
                errors.push('Identificador do template é obrigatório');
              } else if (identifiers.has(template.identifier)) {
                errors.push(`Identificador duplicado: ${template.identifier}`);
              } else {
                identifiers.add(template.identifier);
              }
            });
          }
          break;
        }

        case 'variables': {
          const variables = sectionData as BlueprintFormData['variables'];

          if (variables?.variables) {
            variables.variables.forEach((variable) => {
              if (!variable.name?.trim()) {
                errors.push('Nome da variável é obrigatório');
              } else if (duplicateNames.has(variable.name)) {
                errors.push(`Nome de variável duplicado: ${variable.name}`);
              } else {
                duplicateNames.add(variable.name);
              }

              if (!variable.type?.trim()) {
                errors.push('Tipo da variável é obrigatório');
              }
            });
          }
          break;
        }

        case 'values': {
          const values = sectionData as BlueprintFormData['values'];
          const templates = state.formData.templates?.selectedTemplates || [];
          const variables = state.formData.variables?.variables || [];

          // Verificar se há valores default para todos os templates
          templates.forEach((template) => {
            if (!values?.values[template.identifier]) {
              errors.push(`Valores necessários para o template: ${template.identifier}`);
            }
          });

          // Verificar interpolações inválidas nos valores
          Object.entries(values?.values || {}).forEach(([_templateId, templateValues]) => {
            Object.entries(templateValues).forEach(([_key, value]) => {
              // Verificar interpolações de variáveis (formato ${var})
              const valueStr = typeof value === 'string' ? value : '';
              const matches = valueStr.match(/\${([^}]+)}/g) || [];

              matches.forEach((match: string) => {
                const varName = match.substring(2, match.length - 1);

                if (!variables.some((v) => v.name === varName)) {
                  errors.push(`Variável não definida na interpolação: ${varName}`);
                }
              });
            });
          });
          break;
        }

        case 'preview':
          // A validação do preview é feita pelo componente de preview
          break;
      }

      setSectionErrors(section as keyof BlueprintFormData, errors);
      const isValid = errors.length === 0;

      if (isValid) {
        // Marcar seção como completa quando não há erros
        markSectionComplete(section as keyof BlueprintFormData, true);
      } else {
        markSectionComplete(section as keyof BlueprintFormData, false);
      }

      return isValid;
    },
    [state.formData, setSectionErrors, markSectionComplete]
  );

  // Verificar se uma seção tem erros
  const hasErrors = useCallback(
    (section: keyof BlueprintFormData): boolean => {
      return Array.isArray(state.errors[section]) && (state.errors[section]?.length ?? 0) > 0;
    },
    [state.errors]
  );

  // Verificar se uma seção está completa
  const isSectionComplete = useCallback(
    (section: keyof BlueprintFormData): boolean => {
      return Boolean(state.isComplete[section]);
    },
    [state.isComplete]
  );

  // Converter o formato interno para o formato da API
  const convertToApiFormat = useCallback((): BlueprintFormValues => {
    return {
      name: state.formData.metadata?.name || '',
      description: state.formData.metadata?.description || '',
      version: state.formData.metadata?.version || '',
      applicationId: state.formData.metadata?.applicationId || '',
      childTemplates: state.formData.templates?.selectedTemplates || [],
      variables: state.formData.variables?.variables || [],
      defaultValues: convertValuesToStringFormat(state.formData.values?.values || {}),
      id: state.editId,
    };
  }, [state.formData, state.editId]);

  // Método para atualizar seções específicas, como templates e variáveis
  const updateSection = useCallback(
    (
      section: 'templates' | 'variables',
      data:
        | Array<{ templateId: string; identifier: string; order: number }>
        | Array<{
            name: string;
            type: string;
            description: string;
            required: boolean;
            defaultValue?: string;
          }>
    ) => {
      // Manusear cada seção específica
      if (section === 'templates') {
        const sectionData = {
          selectedTemplates: data as BlueprintFormData['templates']['selectedTemplates'],
        } as BlueprintFormData['templates'];

        setSectionData('templates', sectionData);
      } else if (section === 'variables') {
        const sectionData = {
          variables: data as BlueprintFormData['variables']['variables'],
        } as BlueprintFormData['variables'];

        setSectionData('variables', sectionData);
      }
    },
    [setSectionData]
  );

  const value: BlueprintFormContextType = {
    state,
    setSectionData,
    updateSection,
    setSectionErrors,
    markSectionDirty,
    markFieldDirty,
    markSectionComplete,
    resetForm,
    loadBlueprint,
    validateSection,
    hasErrors,
    isSectionComplete,
    convertToApiFormat,
  };

  return <BlueprintFormContext.Provider value={value}>{children}</BlueprintFormContext.Provider>;
}

// Hook para usar o contexto
export function useBlueprintForm() {
  const context = useContext(BlueprintFormContext);

  if (!context) {
    throw new Error('useBlueprintForm deve ser usado dentro de um BlueprintFormProvider');
  }

  return context;
}

// Helper function to convert values from unknown to string format for API
function convertValuesToStringFormat(
  values: Record<string, Record<string, unknown>>
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  Object.keys(values).forEach((templateId) => {
    result[templateId] = {};
    const templateValues = values[templateId];

    // Extract yaml value and convert other values as needed
    if (templateValues.yaml !== undefined) {
      result[templateId].yaml = String(templateValues.yaml);
    }

    // Add other string conversions as needed
    Object.keys(templateValues).forEach((key) => {
      if (key !== 'fields' && templateValues[key] !== undefined) {
        result[templateId][key] = String(templateValues[key]);
      }
    });
  });

  return result;
}

// Form data types
export interface BlueprintSectionContent {
  metadata: ReactNode;
  templates: ReactNode;
  variables: ReactNode;
  values: ReactNode;
  preview: ReactNode;
}
