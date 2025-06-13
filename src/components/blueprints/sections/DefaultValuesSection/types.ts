/**
 * Types definition for Blueprint Values Section
 * These types define the contract of configuration between blueprint and instances.
 */

// Importação dos novos tipos da estrutura tipada
import type { ValueConfiguration } from '@/types/blueprint';

/**
 * Enum for the source of a default value
 */
export enum ValueSourceType {
  TEMPLATE = 'template', // Value comes from the original template
  BLUEPRINT = 'blueprint', // Value is defined in the blueprint
}

/**
 * Interface for YAML validation results
 */
export interface YamlValidationResult {
  isValid: boolean;
  errors: Array<{ message: string; path?: string[] }>;
  warnings?: Array<{ message: string; path?: string[] }>;
  document?: Record<string, unknown> | unknown[]; // The parsed YAML document if valid
}

/**
 * Interface for a single field in the template that can be configured
 */
export interface DefaultValueField {
  // Unique identifier of the field (usually a path in the YAML structure)
  key: string;

  // Display name for the field (for UI purposes)
  displayName?: string;

  // Description of the field (for tooltips/help text)
  description?: string;

  // Current value of the field (can be string, number, boolean, object)
  value: string | number | boolean | Record<string, unknown> | unknown[] | null;

  // Original value from the template (for reference and reset)
  originalValue?: string | number | boolean | Record<string, unknown> | unknown[] | null;

  // Source of the value (template or blueprint)
  source: ValueSourceType;

  // Whether the field is exposed to instances
  exposed: boolean;

  // Whether the field can be overridden by instances
  overridable: boolean;

  // Data type of the field
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  // Whether the field is required
  required: boolean;

  // Path to the field in the template's YAML structure
  path: string[];

  // For nested objects, their child fields
  children?: DefaultValueField[];
}

/**
 * Collection of default values for a specific template
 */
export interface TemplateDefaultValues {
  // Template identifier
  templateId: string;

  // Template name for display
  templateName: string;

  // Version of the template
  templateVersion: string;

  // Fields in the template that can be configured
  fields: DefaultValueField[];

  // Raw YAML representation of the values
  rawYaml: string;
}

/**
 * Complete contract of configuration for a blueprint
 */
export interface DefaultValuesContract {
  // Values for each template included in the blueprint
  templateValues: TemplateDefaultValues[];

  // Whether the contract has been initialized
  initialized: boolean;
}

/**
 * Props for the ValidationFeedback component
 */
export interface ValidationFeedbackProps {
  errors: Array<{ message: string; path?: string[] }>;
  warnings?: Array<{ message: string; path?: string[] }>;
  variableWarnings?: Array<{
    message: string;
    path?: string[];
    variableName?: string;
  }>;
}

export interface TemplateValueEditorProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables?: Array<{ name: string; value: string }>;
  onChange: (updatedValues: TemplateDefaultValues) => void;
  showBatchActions?: boolean; // Whether to show batch actions in the header
  onFieldsChange?: (updatedFields: DefaultValueField[]) => void; // Callback for field changes from batch actions
}

export interface DefaultValuesSectionProps {
  // Selected templates for the blueprint
  selectedTemplates: Array<{ id: string; name: string; version: string }>;

  // Variables defined in the blueprint
  blueprintVariables?: Array<{ name: string; value: string }>;

  // Initial contract values (for editing an existing blueprint)
  initialValues?: DefaultValuesContract;

  // Callback when values change
  onChange?: (values: DefaultValuesContract) => void;
}

/**
 * Props for the TemplateTabsNavigation component
 */
export interface TemplateTabsNavigationProps {
  // Templates to show in the tabs
  templates: Array<{ id: string; name: string; version: string }>;

  // Currently selected template id
  selectedTemplateId: string;

  // Callback when a tab is selected
  onSelectTemplate: (templateId: string) => void;
}

/**
 * Props for the TemplateValueEditor component
 */
export interface TemplateValueEditorProps {
  // Template values to edit
  templateValues: TemplateDefaultValues;

  // Available variables for interpolation
  blueprintVariables?: Array<{ name: string; value: string }>;

  // Callback when values change
  onChange: (updatedValues: TemplateDefaultValues) => void;

  // Callback when validation state changes
  onValidationChange?: (
    isValid: boolean,
    errors: Array<{ message: string; path?: string[] }>,
    warnings: Array<{ message: string; path?: string[] }>,
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>
  ) => void;

  // Whether to show batch actions
  showBatchActions?: boolean;

  // Callback when fields change via batch actions
  onFieldsChange?: (fields: DefaultValueField[]) => void;
}

/**
 * Props for the ValidationFeedback component
 */
export interface ValidationFeedbackProps {
  // Errors from validation
  errors: Array<{ message: string; path?: string[] }>;

  // Warnings from validation
  warnings?: Array<{ message: string; path?: string[] }>;
}

/**
 * Interface que estende TemplateDefaultValues para incluir a nova estrutura tipada
 * Facilita a migração gradual do sistema antigo para o novo
 */
export interface EnhancedTemplateDefaultValues extends TemplateDefaultValues {
  // Nova estrutura tipada de configuração de valores
  valueConfiguration?: ValueConfiguration;
}

/**
 * Props estendidas para o TemplateValueEditor que incluem a nova estrutura tipada
 */
export interface EnhancedTemplateValueEditorProps extends TemplateValueEditorProps {
  // Indica se deve usar a nova estrutura tipada em vez do formato antigo
  useTypedValueConfiguration?: boolean;

  // Callback específico para quando a configuração tipada é alterada
  // O segundo parâmetro indica se é uma configuração filtrada (importante para otimizações de UI)
  onValueConfigurationChange?: (
    valueConfig: ValueConfiguration,
    isFilteredConfig?: boolean
  ) => void;
}

/**
 * Props estendidas para o TableView que incluem a nova estrutura tipada
 */
export interface EnhancedTableViewProps {
  // Values no formato antigo ou híbrido
  templateValues: TemplateDefaultValues | EnhancedTemplateDefaultValues;

  // Flag para indicar se deve usar a estrutura tipada
  useTypedValueConfiguration?: boolean;

  // Valor da configuração tipada (opcional, se useTypedValueConfiguration = true)
  valueConfiguration?: ValueConfiguration;

  // Variáveis do blueprint para substituição
  blueprintVariables: Array<{ name: string; value: string }>;

  // Callback quando os valores são alterados
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;

  // Callback específico para quando a configuração tipada é alterada
  // O segundo parâmetro indica se é uma configuração filtrada (importante para otimizações de UI)
  onValueConfigurationChange?: (
    valueConfig: ValueConfiguration,
    isFilteredConfig?: boolean
  ) => void;

  // Estado de validação
  validationState?: {
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>;
  };

  // Flag para mostrar feedback de validação
  showValidationFeedback?: boolean;
}

/**
 * Funções utilitárias para conversão entre as estruturas antiga e nova
 */

/**
 * Converte a estrutura antiga (DefaultValueField[]) para a nova estrutura tipada (ValueConfiguration)
 */
export interface ValueConfigurationConverter {
  // Converte os campos antigos para a estrutura tipada
  legacyFieldsToValueConfiguration: (fields: DefaultValueField[]) => ValueConfiguration;

  // Converte a estrutura tipada para campos antigos (para compatibilidade)
  valueConfigurationToLegacyFields: (valueConfig: ValueConfiguration) => DefaultValueField[];
}
