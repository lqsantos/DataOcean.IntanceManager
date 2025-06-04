import { z } from 'zod';

/**
 * Represents a blueprint with its properties and relationships
 */
export interface Blueprint {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  // Removido templateId
  childTemplates?: BlueprintChildTemplate[];
  variables?: BlueprintVariable[];
  helperTpl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a template associated with a blueprint
 */
export interface BlueprintChildTemplate {
  templateId: string;
  identifier: string;
  order: number;
  overrideValues?: string;
}

/**
 * Represents a variable defined in the blueprint
 */
export interface BlueprintVariable {
  name: string;
  description?: string;
  value?: string;
  type: 'simple' | 'advanced'; // Type is always required
}

/**
 * Template simplified for the catalog display
 */
export interface CatalogTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * Validation schema for the blueprint form
 */
export const formSchema = z.object({
  // Step 1: General Information
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória'),

  // Optional fields defined in other steps or by the system
  category: z.string().optional(),
  // Removido templateId
  __serverValidation: z.boolean().optional(), // Controle interno para validação do servidor

  // Step 2: Associated Templates
  selectedTemplates: z
    .array(
      z.object({
        templateId: z.string().min(1, 'Template é obrigatório'),
        identifier: z.string().min(1, 'Identificador é obrigatório'),
        order: z.number(),
        overrideValues: z.string().optional(),
      })
    )
    .optional(),

  // Step 3: Blueprint Variables
  blueprintVariables: z
    .array(
      z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        description: z.string().optional(),
        value: z.string().optional(),
        type: z.enum(['simple', 'advanced']), // Required field
      })
    )
    .optional(),

  // Generated from variables
  helperTpl: z.string().optional(),
});

/**
 * Type definition for form values based on the schema
 */
export type FormValues = z.infer<typeof formSchema>;

/**
 * Props interface for the BlueprintForm component
 */
export interface BlueprintFormProps {
  /** Blueprint instance for editing mode (optional) */
  blueprint?: Blueprint;
  /** Function called on form submission */
  onSave: (data: FormValues) => Promise<void>;
  /** Function for cancelling the operation */
  onCancel: () => void;
  /** Form mode: create or edit */
  mode: 'create' | 'edit';
  /** Current wizard step (for create mode) */
  currentStep?: number;
  /** Total wizard steps */
  totalSteps?: number;
  /** Function to move to next step */
  onNextStep?: () => void;
  /** Function to move to previous step */
  onPrevStep?: () => void;
  /** Function to go to a specific step */
  onGoToStep?: (step: number) => void;
}

/**
 * Type describing a validation result
 */
export type ValidationResult = {
  type: 'error' | 'warning' | 'success';
  message: string;
};
