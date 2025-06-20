/**
 * Field validation hook for Unified Value Column
 * Provides real-time validation for field values with debounce and caching
 */

import React, { useCallback, useRef, useState } from 'react';

import { TIMING_CONFIG } from '../TableComponents/constants';
import type { FieldValidationResult } from '../TableComponents/types';
import { FieldEditState } from '../TableComponents/types';
import type { DefaultValueField } from '../types';
import { validateFieldValue } from '../validators/';

interface UseFieldValidationProps {
  /** The field being validated */
  field: DefaultValueField;
  /** Available blueprint variables for interpolation */
  blueprintVariables?: Array<{ name: string; value: string }>;
  /** Whether to enable debounced validation */
  enableDebounce?: boolean;
  /** Custom debounce delay (defaults to TIMING_CONFIG.validationDebounce) */
  debounceDelay?: number;
}

interface UseFieldValidationReturn {
  /** Current validation result */
  validationResult: FieldValidationResult | null;
  /** Whether validation is currently running */
  isValidating: boolean;
  /** Validate a value immediately */
  validateValue: (value: unknown) => Promise<FieldValidationResult>;
  /** Validate a value with debounce */
  validateValueDebounced: (value: unknown) => void;
  /** Clear current validation result */
  clearValidation: () => void;
  /** Get edit state based on validation */
  getEditState: (isEditing: boolean) => FieldEditState;
}

export function useFieldValidation({
  field,
  blueprintVariables = [],
  enableDebounce = true,
  debounceDelay = TIMING_CONFIG.validationDebounce,
}: UseFieldValidationProps): UseFieldValidationReturn {
  const [validationResult, setValidationResult] = useState<FieldValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cache for validation results
  const validationCacheRef = useRef<Map<string, FieldValidationResult>>(new Map());

  /**
   * Validate a value immediately
   */
  const validateValue = useCallback(
    async (value: unknown): Promise<FieldValidationResult> => {
      const cacheKey = `${field.path.join('.')}_${JSON.stringify(value)}`;

      // Check cache first
      const cachedResult = validationCacheRef.current.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      setIsValidating(true);

      try {
        const result = await validateFieldValue(field, value, blueprintVariables);

        // Cache the result
        validationCacheRef.current.set(cacheKey, result);

        setValidationResult(result);

        return result;
      } catch (error) {
        const errorResult: FieldValidationResult = {
          isValid: false,
          errorMessage: error instanceof Error ? error.message : 'Validation error occurred',
        };

        setValidationResult(errorResult);

        return errorResult;
      } finally {
        setIsValidating(false);
      }
    },
    [field, blueprintVariables]
  );

  /**
   * Validate a value with debounce
   */
  const validateValueDebounced = useCallback(
    (value: unknown) => {
      if (!enableDebounce) {
        validateValue(value);

        return;
      }

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        validateValue(value);
      }, debounceDelay);
    },
    [validateValue, enableDebounce, debounceDelay]
  );

  /**
   * Clear current validation result
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setIsValidating(false);

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Get edit state based on validation
   */
  const getEditState = useCallback(
    (isEditing: boolean): FieldEditState => {
      if (!isEditing) {
        return FieldEditState.IDLE;
      }

      if (isValidating) {
        return FieldEditState.VALIDATING;
      }

      if (validationResult) {
        return validationResult.isValid ? FieldEditState.VALID : FieldEditState.ERROR;
      }

      return FieldEditState.EDITING;
    },
    [isValidating, validationResult]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    validationCacheRef.current.clear();
  }, []);

  // Effect for cleanup
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    validationResult,
    isValidating,
    validateValue,
    validateValueDebounced,
    clearValidation,
    getEditState,
  };
}
