/**
 * Central validator dispatch
 * Coordinates validation for different field types
 */

import type { FieldValidationResult } from '../TableComponents/types';
import type { DefaultValueField } from '../types';

import { validateBooleanValue } from './booleanValidator';
import { validateNumberValue } from './numberValidator';
import { validateStringValue } from './stringValidator';

/**
 * Validates a field value based on its type
 * @param field - The field being validated
 * @param value - The value to validate
 * @param blueprintVariables - Available blueprint variables
 * @returns Validation result
 */
export async function validateFieldValue(
  field: DefaultValueField,
  value: unknown,
  blueprintVariables: Array<{ name: string; value: string }> = []
): Promise<FieldValidationResult> {
  try {
    switch (field.type) {
      case 'string':
        return await validateStringValue(field, value, blueprintVariables);

      case 'number':
        return await validateNumberValue(field, value);

      case 'boolean':
        return await validateBooleanValue(field, value);

      case 'object':
        // Objects are validated at a higher level (YAML validation)
        return {
          isValid: true,
          warningMessage: 'Object validation handled by YAML validator',
        };

      case 'array':
        // Arrays are validated at a higher level (YAML validation)
        return {
          isValid: true,
          warningMessage: 'Array validation handled by YAML validator',
        };

      default:
        return {
          isValid: false,
          errorMessage: `Unknown field type: ${field.type}`,
        };
    }
  } catch (error) {
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Validation error occurred',
    };
  }
}

// Re-export individual validators
export { validateBooleanValue } from './booleanValidator';
export { validateNumberValue } from './numberValidator';
export { validateStringValue } from './stringValidator';
