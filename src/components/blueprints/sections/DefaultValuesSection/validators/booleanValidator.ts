/**
 * Boolean field validator
 * Validates boolean values with flexible type conversion
 */

import type { FieldValidationResult } from '../TableComponents/types';
import type { DefaultValueField } from '../types';

/**
 * Validates a boolean value
 * @param field - The field being validated
 * @param value - The boolean value to validate
 * @returns Validation result
 */
export async function validateBooleanValue(
  field: DefaultValueField,
  value: unknown
): Promise<FieldValidationResult> {
  // Check if value is null/undefined for required fields
  if (field.required && (value === null || value === undefined)) {
    return {
      isValid: false,
      errorMessage: 'This field is required',
    };
  }

  // If not required and null/undefined, it's valid
  if (!field.required && (value === null || value === undefined)) {
    return {
      isValid: true,
    };
  }

  // Direct boolean values are always valid
  if (typeof value === 'boolean') {
    return {
      isValid: true,
    };
  }

  // String conversion validation
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();

    // Accept common boolean string representations
    const validTrueValues = ['true', '1', 'yes', 'on', 'enabled'];
    const validFalseValues = ['false', '0', 'no', 'off', 'disabled'];

    if (validTrueValues.includes(lowerValue) || validFalseValues.includes(lowerValue)) {
      const warnings: string[] = [];

      // Warn about non-standard boolean representations
      if (!['true', 'false'].includes(lowerValue)) {
        warnings.push(`Using "${value}" for boolean - consider using "true" or "false"`);
      }

      return {
        isValid: true,
        warningMessage: warnings.length > 0 ? warnings.join('. ') : undefined,
      };
    }

    return {
      isValid: false,
      errorMessage: 'Value must be a boolean (true/false)',
      suggestedValue: lowerValue.includes('1') || lowerValue.includes('yes') ? true : false,
    };
  }

  // Number conversion validation
  if (typeof value === 'number') {
    // Only accept 0 and 1 for numbers
    if (value === 0 || value === 1) {
      return {
        isValid: true,
        warningMessage: `Using number ${value} for boolean - consider using ${value === 1 ? 'true' : 'false'}`,
      };
    }

    return {
      isValid: false,
      errorMessage: 'Number values for booleans must be 0 or 1',
      suggestedValue: value > 0 ? true : false,
    };
  }

  // Other types are invalid
  return {
    isValid: false,
    errorMessage: 'Value must be a boolean (true/false)',
    suggestedValue: Boolean(value),
  };
}
