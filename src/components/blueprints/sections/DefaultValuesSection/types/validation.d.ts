/**
 * Type definitions for validation states and results
 */

export interface ValidationWarning {
  message: string;
  path?: string[];
}

export interface VariableWarning {
  message: string;
  path?: string[];
  variableName?: string;
}

export interface ValidationState {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  variableWarnings: VariableWarning[];
}
