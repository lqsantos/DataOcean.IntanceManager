/**
 * String field validator
 * Validates string values with support for Helm variable interpolation
 */

import type { FieldValidationResult } from '../TableComponents/types';
import type { DefaultValueField } from '../types';
import { extractVariablesFromString } from '../utils/variable-validator';

/**
 * Validates a string value
 * @param field - The field being validated
 * @param value - The string value to validate
 * @param blueprintVariables - Available blueprint variables
 * @returns Validation result
 */
export async function validateStringValue(
  field: DefaultValueField,
  value: unknown,
  blueprintVariables: Array<{ name: string; value: string }> = []
): Promise<FieldValidationResult> {
  // Check if value is null/undefined for required fields
  if (field.required && (value === null || value === undefined || value === '')) {
    return {
      isValid: false,
      errorMessage: 'This field is required',
    };
  }

  // If not required and empty, it's valid
  if (!field.required && (value === null || value === undefined || value === '')) {
    return {
      isValid: true,
    };
  }

  // Convert to string
  const stringValue = String(value);

  // Basic string length validation (reasonable limits)
  if (stringValue.length > 10000) {
    return {
      isValid: false,
      errorMessage: 'Value is too long (maximum 10,000 characters)',
    };
  }

  // Extract variables from the string
  const usedVariables = extractVariablesFromString(stringValue);
  const availableVariableNames = blueprintVariables.map((v) => v.name);

  // Check for undefined variables
  const undefinedVariables = usedVariables.filter(
    (varName) => !availableVariableNames.includes(varName)
  );

  if (undefinedVariables.length > 0) {
    return {
      isValid: false,
      errorMessage: `Undefined variables: ${undefinedVariables.join(', ')}`,
      warningMessage: 'Some variables are not defined in the blueprint',
    };
  }

  // Check for potentially problematic patterns
  const warnings: string[] = [];

  // Warn about potential YAML syntax issues
  if (stringValue.includes('\t')) {
    warnings.push('Using tabs instead of spaces may cause YAML issues');
  }

  if (stringValue.includes('{{') && !stringValue.includes('}}')) {
    warnings.push('Incomplete variable interpolation syntax');
  }

  // Return validation result
  return {
    isValid: true,
    warningMessage: warnings.length > 0 ? warnings.join('. ') : undefined,
  };
}
