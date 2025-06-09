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
  defaults: {
    values: Record<string, Record<string, string>>;
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
  defaults: {
    values: {},
  },
};

const initialState: BlueprintFormState = {
  formData: initialFormData,
  errors: {},
  isDirty: {},
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
  setSectionErrors: (section: keyof BlueprintFormData, errors: string[]) => void;
  markSectionDirty: (section: keyof BlueprintFormData) => void;
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
            errors.push('O nome é obrigatório');
          } else if (metadata.name.length < 3) {
            errors.push('O nome deve ter pelo menos 3 caracteres');
          }

          if (!metadata?.version?.trim()) {
            errors.push('A versão é obrigatória');
          }

          if (!metadata?.applicationId?.trim()) {
            errors.push('A aplicação é obrigatória');
          }

          // Descrição é opcional, mas se fornecida deve ter conteúdo
          if (metadata?.description && metadata.description.trim().length < 1) {
            errors.push('A descrição não pode estar vazia');
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

        case 'defaults': {
          const defaults = sectionData as BlueprintFormData['defaults'];
          const templates = state.formData.templates?.selectedTemplates || [];
          const variables = state.formData.variables?.variables || [];

          // Verificar se há valores default para todos os templates
          templates.forEach((template) => {
            if (!defaults?.values[template.identifier]) {
              errors.push(`Valores padrão necessários para o template: ${template.identifier}`);
            }
          });

          // Verificar interpolações inválidas nos valores padrão
          Object.entries(defaults?.values || {}).forEach(([_templateId, values]) => {
            Object.entries(values).forEach(([_key, value]) => {
              // Verificar interpolações de variáveis (formato ${var})
              const matches = value.match(/\${([^}]+)}/g) || [];

              matches.forEach((match) => {
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
      defaultValues: state.formData.defaults?.values || {},
      id: state.editId,
    };
  }, [state.formData, state.editId]);

  const value: BlueprintFormContextType = {
    state,
    setSectionData,
    setSectionErrors,
    markSectionDirty,
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

// Form data types
export interface BlueprintSectionContent {
  metadata: ReactNode;
  templates: ReactNode;
  variables: ReactNode;
  defaults: ReactNode;
  preview: ReactNode;
}
