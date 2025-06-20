/**
 * EditableValueContainer component
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useFieldValidation } from '../hooks/useFieldValidation';
import type { DefaultValueField } from '../types';

import { BUTTON_CONFIG } from './constants';
import { FieldEditState } from './types';
import { BooleanEditor, NumberEditor, StringEditor, type ValueEditorProps } from './ValueEditors';

interface EditableValueContainerProps {
  /** The field being edited */
  field: DefaultValueField;
  /** Initial value to edit */
  initialValue: string | number | boolean;
  /** Callback when apply is clicked or Enter is pressed */
  onApply: (value: string | number | boolean) => void;
  /** Callback when cancel is clicked or Escape is pressed */
  onCancel: () => void;
  /** Callback when value changes during editing */
  onValueChange?: (value: string | number | boolean) => void;
  /** Available blueprint variables for interpolation */
  blueprintVariables?: Array<{ name: string; value: string }>;
  /** Whether to auto-focus the editor */
  autoFocus?: boolean;
  /** Whether this is a customization operation (allows Apply even without changes) */
  isCustomizing?: boolean;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

export const EditableValueContainer: React.FC<EditableValueContainerProps> = ({
  field,
  initialValue,
  onApply,
  onCancel,
  onValueChange,
  blueprintVariables = [],
  autoFocus = true,
  isCustomizing = false,
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation('blueprints');

  // Component state
  const [tempValue, setTempValue] = useState<string | number | boolean>(initialValue);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Initialize validation hook
  const { validationResult, isValidating, validateValueDebounced, clearValidation, getEditState } =
    useFieldValidation({
      field,
      blueprintVariables,
    });

  // Reset state when initialValue changes (e.g., after field reset)
  useEffect(() => {
    setTempValue(initialValue);
    setUserHasInteracted(false);
    clearValidation();
  }, [initialValue, clearValidation, field.key]);

  // Handle value changes from editor - SIMPLIFIED
  const handleValueChange = useCallback(
    (newValue: string | number | boolean) => {
      setTempValue(newValue);
      setUserHasInteracted(true);
      onValueChange?.(newValue);

      // Validate only if value differs from initial
      if (newValue !== initialValue) {
        validateValueDebounced(newValue);
      } else {
        clearValidation();
      }
    },
    [initialValue, onValueChange, validateValueDebounced, clearValidation]
  );

  // Handle apply action
  const handleApply = useCallback(() => {
    const hasActualChanges = tempValue !== initialValue;
    const isValid = !validationResult || validationResult.isValid;

    const shouldApply = (isCustomizing || userHasInteracted || hasActualChanges) && isValid;

    if (shouldApply) {
      onApply(tempValue);
    }
  }, [tempValue, initialValue, userHasInteracted, validationResult, onApply, isCustomizing]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    setTempValue(initialValue);
    setUserHasInteracted(false);
    clearValidation();
    onCancel();
  }, [initialValue, onCancel, clearValidation, field.key]);

  // Keyboard shortcuts
  const handleEnter = useCallback(() => {
    handleApply();
  }, [handleApply]);

  const handleEscape = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  // Get current edit state and determine if apply is allowed
  const editState = getEditState(true);
  const isValid = !validationResult || validationResult.isValid;
  const hasChanges = tempValue !== initialValue;

  // BUSINESS RULE: During customization, allow Apply even without changes to preserve user intent
  const canApply = isCustomizing
    ? isValid && !isValidating // In customization mode: only need valid value
    : (userHasInteracted || hasChanges) && isValid && !isValidating; // Normal mode: need interaction/changes

  // Render appropriate editor based on field type
  const renderEditor = () => {
    const editorProps: Partial<ValueEditorProps<string | number | boolean>> = {
      disabled: false,
      autoFocus,
      onEnter: handleEnter,
      onEscape: handleEscape,
      isValidating,
      'data-testid': dataTestId ? `${dataTestId}-editor` : undefined,
    };

    switch (field.type) {
      case 'string': {
        const stringValue: string = typeof tempValue === 'string' ? tempValue : String(tempValue);

        return (
          <StringEditor
            value={stringValue as string}
            onChange={handleValueChange as (value: string) => void}
            variables={blueprintVariables}
            disabled={editorProps.disabled}
            autoFocus={editorProps.autoFocus}
            onEnter={editorProps.onEnter}
            onEscape={editorProps.onEscape}
            isValidating={editorProps.isValidating}
            data-testid={editorProps['data-testid']}
          />
        );
      }

      case 'number': {
        const numberValue: number = typeof tempValue === 'number' ? tempValue : Number(tempValue);

        return (
          <NumberEditor
            value={numberValue as number}
            onChange={handleValueChange as (value: number) => void}
            disabled={editorProps.disabled}
            autoFocus={editorProps.autoFocus}
            onEnter={editorProps.onEnter}
            onEscape={editorProps.onEscape}
            isValidating={editorProps.isValidating}
            data-testid={editorProps['data-testid']}
          />
        );
      }

      case 'boolean': {
        const booleanValue: boolean =
          typeof tempValue === 'boolean' ? tempValue : Boolean(tempValue);

        return (
          <BooleanEditor
            value={booleanValue as boolean}
            onChange={handleValueChange as (value: boolean) => void}
            disabled={editorProps.disabled}
            autoFocus={editorProps.autoFocus}
            onEnter={editorProps.onEnter}
            onEscape={editorProps.onEscape}
            isValidating={editorProps.isValidating}
            data-testid={editorProps['data-testid']}
          />
        );
      }

      default: {
        const stringValue: string = typeof tempValue === 'string' ? tempValue : String(tempValue);

        return (
          <StringEditor
            value={stringValue as string}
            onChange={(value) => handleValueChange(value)}
            variables={blueprintVariables}
            disabled={editorProps.disabled}
            autoFocus={editorProps.autoFocus}
            onEnter={editorProps.onEnter}
            onEscape={editorProps.onEscape}
            isValidating={editorProps.isValidating}
            data-testid={editorProps['data-testid']}
          />
        );
      }
    }
  };

  return (
    <div className="space-y-2" data-testid={dataTestId}>
      {/* Editor container with validation styling */}
      <div
        className={cn(
          'rounded-md border-2 transition-colors',
          (() => {
            if (editState === FieldEditState.ERROR) {
              return 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/20';
            }

            if (editState === FieldEditState.VALIDATING) {
              return 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/20';
            }

            return 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20';
          })()
        )}
      >
        <div className="p-2">{renderEditor()}</div>
      </div>

      {/* Validation feedback */}
      {validationResult && !validationResult.isValid && (
        <div
          className="text-sm text-red-600 dark:text-red-400"
          data-testid={dataTestId ? `${dataTestId}-error` : undefined}
        >
          {validationResult.errorMessage}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant={BUTTON_CONFIG.variants.cancel}
          className={BUTTON_CONFIG.extraSmall}
          onClick={handleCancel}
          data-testid={dataTestId ? `${dataTestId}-cancel` : undefined}
        >
          {t('values.table.cancel')}
        </Button>
        <Button
          variant={BUTTON_CONFIG.variants.apply}
          className={BUTTON_CONFIG.extraSmall}
          onClick={handleApply}
          disabled={!canApply}
          data-testid={dataTestId ? `${dataTestId}-apply` : undefined}
        >
          {isValidating ? t('values.table.validating') : t('values.table.apply')}
        </Button>
      </div>
    </div>
  );
};
