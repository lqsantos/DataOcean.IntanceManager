/**
 * Number field validator
 * Validates numeric values with type safety and range checking
 */

import type { FieldValidationResult } from '../TableComponents/types';
import type { DefaultValueField } from '../types';

/**
 * Validates a number value
 * @param field - The field being validated
 * @param value - The number value to validate
 * @returns Validation result
 */
export async function validateNumberValue(
  field: DefaultValueField,
  value: unknown
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

  // Convert to number if it's a string
  let numericValue: number;

  if (typeof value === 'string') {
    // Check if string is numeric
    if (value.trim() === '') {
      if (field.required) {
        return {
          isValid: false,
          errorMessage: 'This field is required',
        };
      }

      return { isValid: true };
    }

    numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return {
        isValid: false,
        errorMessage: 'Value must be a valid number',
      };
    }
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    return {
      isValid: false,
      errorMessage: 'Value must be a number',
    };
  }

  // Check for NaN and Infinity
  if (Number.isNaN(numericValue)) {
    return {
      isValid: false,
      errorMessage: 'Value must be a valid number',
    };
  }

  if (!Number.isFinite(numericValue)) {
    return {
      isValid: false,
      errorMessage: 'Value must be a finite number',
    };
  }

  // Basic range validation (reasonable limits)
  const MAX_SAFE_VALUE = Number.MAX_SAFE_INTEGER;
  const MIN_SAFE_VALUE = Number.MIN_SAFE_INTEGER;

  if (numericValue > MAX_SAFE_VALUE || numericValue < MIN_SAFE_VALUE) {
    return {
      isValid: false,
      errorMessage: 'Number is outside safe range',
    };
  }

  // Check for precision warnings
  const warnings: string[] = [];

  // Warn about potential floating point precision issues
  if (numericValue % 1 !== 0 && numericValue.toString().split('.')[1]?.length > 15) {
    warnings.push('High precision decimals may have rounding issues');
  }

  // Warn about very small decimal values
  if (Math.abs(numericValue) > 0 && Math.abs(numericValue) < Number.EPSILON) {
    warnings.push('Very small decimal values may be imprecise');
  }

  return {
    isValid: true,
    warningMessage: warnings.length > 0 ? warnings.join('. ') : undefined,
  };
}
