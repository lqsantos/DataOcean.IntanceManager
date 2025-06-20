/**
 * EditableValueContainer component
 * Container that manages Apply/Cancel editing states for value editors
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useFieldValidation } from '../hooks/useFieldValidation';
import type { DefaultValueField } from '../types';

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
  /** Test ID for automated testing */
  'data-testid'?: string;
}

/**
 * Container component that provides Apply/Cancel functionality for field editors
 */
export const EditableValueContainer: React.FC<EditableValueContainerProps> = ({
  field,
  initialValue,
  onApply,
  onCancel,
  onValueChange,
  blueprintVariables = [],
  autoFocus = true,
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation('blueprints');
  const [tempValue, setTempValue] = useState<string | number | boolean>(initialValue);
  const [hasChanges, setHasChanges] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false); // Track user interaction

  // Initialize validation hook
  const { validationResult, isValidating, validateValueDebounced, clearValidation, getEditState } =
    useFieldValidation({
      field,
      blueprintVariables,
    });

  // Track if value has changed from initial
  useEffect(() => {
    setHasChanges(tempValue !== initialValue);
  }, [tempValue, initialValue]);

  // Validate value changes with debounce
  useEffect(() => {
    if (hasChanges) {
      validateValueDebounced(tempValue);
    } else {
      clearValidation();
    }
  }, [tempValue, hasChanges, validateValueDebounced, clearValidation]);

  // Handle value changes from editor
  const handleValueChange = useCallback(
    (newValue: string | number | boolean) => {
      setTempValue(newValue);
      setUserHasInteracted(true); // Mark that user has interacted
      setHasChanges(newValue !== initialValue); // Update hasChanges based on actual difference
      onValueChange?.(newValue); // Notify parent about the change
    },
    [onValueChange, initialValue]
  );

  // Handle apply action
  const handleApply = useCallback(() => {
    // Apply if user has interacted (indicating intention to customize)
    // OR if there are actual changes and no validation errors
    const shouldApply =
      userHasInteracted || (hasChanges && (!validationResult || validationResult.isValid));

    if (shouldApply) {
      onApply(tempValue);
    }
  }, [tempValue, onApply, validationResult, hasChanges, userHasInteracted]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    setTempValue(initialValue);
    setHasChanges(false);
    clearValidation();
    onCancel();
  }, [initialValue, onCancel, clearValidation]);

  // Handle keyboard shortcuts
  const handleEnter = useCallback(() => {
    handleApply();
  }, [handleApply]);

  const handleEscape = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  // Get current edit state for styling
  const editState = getEditState(true);
  const isValid = !validationResult || validationResult.isValid;
  // Allow apply if user has interacted (indicating intention to customize) OR if there are actual changes
  const canApply = (userHasInteracted || hasChanges) && isValid && !isValidating;

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
        const stringValue = typeof tempValue === 'string' ? tempValue : String(tempValue);

        return (
          <StringEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={stringValue as any}
            onChange={handleValueChange as (value: string) => void}
            variables={blueprintVariables}
            {...editorProps}
          />
        );
      }

      case 'number': {
        const numberValue = typeof tempValue === 'number' ? tempValue : Number(tempValue);

        return (
          <NumberEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={numberValue as any}
            onChange={handleValueChange as (value: number) => void}
            {...editorProps}
          />
        );
      }

      case 'boolean': {
        const booleanValue = typeof tempValue === 'boolean' ? tempValue : Boolean(tempValue);

        return (
          <BooleanEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={booleanValue as any}
            onChange={handleValueChange as (value: boolean) => void}
            {...editorProps}
          />
        );
      }

      default: {
        const stringValue = typeof tempValue === 'string' ? tempValue : String(tempValue);

        return (
          <StringEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={stringValue as any}
            onChange={(value) => handleValueChange(value)}
            variables={blueprintVariables}
            {...editorProps}
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
              return 'border-red-300 bg-red-50';
            }

            if (editState === FieldEditState.VALIDATING) {
              return 'border-amber-300 bg-amber-50';
            }

            return 'border-blue-300 bg-blue-50';
          })()
        )}
      >
        <div className="p-2">{renderEditor()}</div>
      </div>

      {/* Validation feedback */}
      {validationResult && !validationResult.isValid && (
        <div
          className="text-sm text-red-600"
          data-testid={dataTestId ? `${dataTestId}-error` : undefined}
        >
          {validationResult.errorMessage}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className={cn(
            'h-5 px-1.5 text-[10px] text-gray-600 hover:bg-gray-50 hover:text-gray-700'
          )}
          onClick={handleCancel}
          data-testid={dataTestId ? `${dataTestId}-cancel` : undefined}
        >
          {t('values.table.cancel')}
        </Button>
        <Button
          variant="default"
          className={cn('h-5 px-1.5 text-[10px] text-white hover:text-white')}
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
