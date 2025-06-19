/**
 * Types for the Value Editor components
 */

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField, TemplateDefaultValues } from '../types';

// Filter state type
export interface FilterState {
  fieldName: string;
  exposed: boolean;
  overridable: boolean;
  customized: boolean;
}

// Base props for all Value Editor components
export interface ValueEditorBaseProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables?: Array<{ name: string; value: string }>;
  onChange: (values: TemplateDefaultValues) => void;
}

// TypedValueConfiguration props
export interface TypedValueConfigurationProps {
  useTypedValueConfiguration?: boolean;
  onValueConfigurationChange?: (
    valueConfig: ValueConfiguration,
    isFilteredConfig?: boolean
  ) => void;
}

// Props for the main TemplateValueEditor
export interface TemplateValueEditorProps
  extends ValueEditorBaseProps,
    TypedValueConfigurationProps {
  showBatchActions?: boolean;
  onFieldsChange?: (fields: DefaultValueField[]) => void;
  onValidationChange?: (
    isValid: boolean,
    errors: Array<{ message: string; path?: string[] }>,
    warnings: Array<{ message: string; path?: string[] }>,
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>
  ) => void;
}
