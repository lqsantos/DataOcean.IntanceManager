/**
 * UnifiedValueColumn component - SIMPLIFIED VERSION
 *
 * Simplified state management removing redundant states and complex synchronization logic.
 * Key simplifications:
 * - Single source of truth for tempValue (only when editing)
 * - Removed justReset flag complexity
 * - Simplified userHasInteracted logic
 * - Clear separation between display and edit modes
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useFieldValidation } from '../hooks/useFieldValidation';
import { ValueSourceType } from '../types';

import {
  ANIMATION_CONFIG,
  BUTTON_CONFIG,
  FIELD_INPUT_CONFIG,
  VALIDATION_STYLES,
  VALUE_STATE_CONFIG,
} from './constants';
import { EditableValueContainer } from './EditableValueContainer';
import { ObjectDisplayComponent } from './ObjectDisplayComponent';
import { FieldEditState, type UnifiedValueColumnProps, ValueDisplayState } from './types';
import { ArrayEditor } from './ValueEditors';

export const UnifiedValueColumn: React.FC<UnifiedValueColumnProps> = ({
  field,
  onStartEdit,
  onApplyChanges,
  onCancelEdit,
  onTempValueChange,
  onCustomize,
  onReset,
  onResetRecursive,
  blueprintVariables = [],
  showValidationFeedback = true,
  disabled = false,
}) => {
  const { t } = useTranslation('blueprints'); // SIMPLIFIED STATE: Only track editing mode, tempValue managed by EditableValueContainer
  const [isEditing, setIsEditing] = useState(false);

  // Track effective value during transitions (reset, customize, etc.)
  const [effectiveValue, setEffectiveValue] = useState<unknown>(field.value);

  // Track if we're in "customize mode" (waiting for user action)
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Sync effective value when field.value changes from parent
  useEffect(() => {
    setEffectiveValue(field.value);
  }, [field.value]);

  // Initialize validation hook for real-time feedback
  const { validationResult, validateValueDebounced, clearValidation, getEditState } =
    useFieldValidation({
      field,
      blueprintVariables,
    });

  /**
   * Determine the visual display state - SIMPLIFIED
   */
  const getDisplayState = useCallback((): ValueDisplayState => {
    if (isEditing) {
      return ValueDisplayState.EDITING;
    }

    if (field.type === 'object') {
      return ValueDisplayState.OBJECT;
    }

    if (field.source === ValueSourceType.TEMPLATE) {
      return ValueDisplayState.TEMPLATE;
    }

    return ValueDisplayState.CUSTOMIZED;
  }, [isEditing, field.type, field.source]);

  /**
   * Get visual configuration for current state
   */
  const getVisualConfig = useCallback((displayState: ValueDisplayState) => {
    switch (displayState) {
      case ValueDisplayState.TEMPLATE:
        return {
          ...VALUE_STATE_CONFIG.template,
          availableActions: ['customize'] as const,
        };

      case ValueDisplayState.CUSTOMIZED:
        return {
          ...VALUE_STATE_CONFIG.customized,
          availableActions: ['edit', 'reset'] as const,
        };

      case ValueDisplayState.EDITING:
        return {
          ...VALUE_STATE_CONFIG.editing,
          availableActions: ['apply', 'cancel'] as const,
        };

      case ValueDisplayState.OBJECT:
        return {
          ...VALUE_STATE_CONFIG.object,
          availableActions: [] as const,
        };

      default:
        return {
          ...VALUE_STATE_CONFIG.template,
          availableActions: [] as const,
        };
    }
  }, []);

  /**
   * Handle starting edit mode - SIMPLIFIED
   */
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    onStartEdit?.();
  }, [onStartEdit]);

  /**
   * Handle applying changes - SIMPLIFIED + FIXED
   */
  const handleApplyChanges = useCallback(
    (newValue: unknown) => {
      console.warn('[UnifiedValueColumn] Applying changes:', newValue);

      // If we were customizing (template → blueprint), execute onCustomize now
      if (isCustomizing) {
        console.warn('[UnifiedValueColumn] Executing delayed customization for field:', field.key);
        onCustomize?.();
        setIsCustomizing(false);
      }

      setEffectiveValue(newValue); // Update effective value immediately
      setIsEditing(false);
      clearValidation();
      onApplyChanges?.(newValue);
    },
    [onApplyChanges, clearValidation, isCustomizing, onCustomize, field.key]
  );

  /**
   * Handle canceling edit - SIMPLIFIED + FIXED
   */
  const handleCancelEdit = useCallback(() => {
    console.warn(
      '[UnifiedValueColumn] Canceling edit for field:',
      field.key,
      'was customizing:',
      isCustomizing
    );

    // If we were customizing and user cancels, don't execute onCustomize
    if (isCustomizing) {
      console.warn('[UnifiedValueColumn] Canceling customization - field remains as template');
      setIsCustomizing(false);
    }

    setIsEditing(false);
    clearValidation();
    onCancelEdit?.();
  }, [onCancelEdit, clearValidation, field.key, isCustomizing]);

  /**
   * Handle customizing field (template → blueprint) - FIXED
   * Don't execute onCustomize immediately, wait for actual changes
   */
  const handleCustomize = useCallback(() => {
    console.warn('[UnifiedValueColumn] Starting customize mode for field:', field.key);
    setIsCustomizing(true); // Mark as customizing mode
    handleStartEdit();
  }, [handleStartEdit, field.key]);

  /**
   * Handle resetting field (blueprint → template) - SIMPLIFIED + FIXED
   */
  const handleReset = useCallback(() => {
    console.warn(
      '[UnifiedValueColumn] Resetting field:',
      field.key,
      'from',
      effectiveValue,
      'to original:',
      field.originalValue
    );

    // Immediately update effective value to original value for immediate UI feedback
    setEffectiveValue(field.originalValue);
    setIsEditing(false);
    clearValidation();
    onReset?.();
  }, [onReset, clearValidation, field.key, field.originalValue, effectiveValue]);

  /**
   * Handle resetting all children recursively for object fields
   */
  const handleResetAllChildren = useCallback(
    (customizedPaths: string[]) => {
      console.warn('[UnifiedValueColumn] Resetting children paths:', customizedPaths);
      setIsEditing(false);
      clearValidation();

      if (onResetRecursive) {
        onResetRecursive(customizedPaths);
      } else {
        onReset?.();
      }
    },
    [onResetRecursive, onReset, clearValidation]
  );

  /**
   * Handle temporary value changes during editing - SIMPLIFIED
   */
  const handleTempValueChange = useCallback(
    (newValue: unknown) => {
      onTempValueChange?.(newValue);

      // Validate with debounce only if value changed from original
      if (newValue !== field.value) {
        validateValueDebounced(newValue);
      } else {
        clearValidation();
      }
    },
    [field.value, onTempValueChange, validateValueDebounced, clearValidation]
  );

  /**
   * Render value display based on type and state - SIMPLIFIED
   */
  const renderValueDisplay = useCallback(() => {
    const displayState = getDisplayState();
    const visualConfig = getVisualConfig(displayState);

    // Handle editing mode
    if (isEditing && field.type !== 'object' && field.type !== 'array') {
      return (
        <EditableValueContainer
          key={`edit-${field.key}-${effectiveValue}-${field.source}`} // Use effectiveValue for better remounting
          field={field}
          initialValue={effectiveValue as string | number | boolean} // Use effectiveValue instead of field.value
          onApply={handleApplyChanges}
          onCancel={handleCancelEdit}
          onValueChange={handleTempValueChange}
          blueprintVariables={blueprintVariables}
          autoFocus={true}
          data-testid="unified-value-editor"
        />
      );
    }

    // Handle different field types
    switch (field.type) {
      case 'object':
        return (
          <ObjectDisplayComponent
            field={field}
            onResetAllChildren={handleResetAllChildren}
            disabled={disabled}
            showConfirmation={true}
            data-testid="unified-value-object"
          />
        );

      case 'array': {
        const isArrayFromTemplate = field.source === ValueSourceType.TEMPLATE;

        return (
          <div
            className={cn(
              'w-full min-w-0',
              'rounded-md border transition-colors',
              isArrayFromTemplate ? visualConfig.bgColor : 'bg-white',
              isArrayFromTemplate ? visualConfig.borderColor : 'border-gray-300',
              `${FIELD_INPUT_CONFIG.height} px-3 py-1`
            )}
          >
            <ArrayEditor disabled={isArrayFromTemplate} />
          </div>
        );
      }

      default: {
        const isDefaultFromTemplate = field.source === ValueSourceType.TEMPLATE;
        let displayValue: string;

        if (isDefaultFromTemplate) {
          displayValue = field.originalValue !== undefined ? String(field.originalValue) : '-';
        } else {
          displayValue = String(effectiveValue || ''); // Use effectiveValue for consistent display
        }

        return (
          <div
            className={cn(
              'w-full min-w-0',
              'flex items-center rounded-md border transition-colors',
              visualConfig.bgColor,
              visualConfig.borderColor,
              ANIMATION_CONFIG.transition,
              `${FIELD_INPUT_CONFIG.height} px-3 py-1`
            )}
          >
            <span
              className={cn('w-full truncate text-sm', visualConfig.textColor)}
              data-testid="unified-value-text"
              title={displayValue}
            >
              {displayValue}
            </span>
          </div>
        );
      }
    }
  }, [
    getDisplayState,
    getVisualConfig,
    isEditing,
    field,
    handleApplyChanges,
    handleCancelEdit,
    handleTempValueChange,
    blueprintVariables,
    handleResetAllChildren,
    disabled,
  ]);

  /**
   * Render action buttons based on current state
   */
  const renderActionButtons = useCallback(() => {
    const displayState = getDisplayState();
    const visualConfig = getVisualConfig(displayState);

    if (disabled || isEditing) {
      return null;
    }

    const buttons: React.ReactNode[] = [];

    visualConfig.availableActions.forEach((action) => {
      switch (action) {
        case 'customize':
          if (field.type !== 'object') {
            buttons.push(
              <Button
                key="customize"
                variant={BUTTON_CONFIG.variants.customize}
                className={BUTTON_CONFIG.extraSmall}
                onClick={handleCustomize}
                data-testid="unified-value-customize"
              >
                {t('values.table.customize')}
              </Button>
            );
          }
          break;

        case 'edit':
          if (field.type !== 'object' && field.type !== 'array') {
            buttons.push(
              <Button
                key="edit"
                variant={BUTTON_CONFIG.variants.edit}
                className={BUTTON_CONFIG.extraSmall}
                onClick={handleStartEdit}
                data-testid="unified-value-edit"
              >
                {t('values.table.edit')}
              </Button>
            );
          }
          break;

        case 'reset':
          buttons.push(
            <Button
              key="reset"
              variant={BUTTON_CONFIG.variants.reset}
              className={BUTTON_CONFIG.extraSmall}
              onClick={handleReset}
              data-testid="unified-value-reset"
            >
              {t('values.table.reset')}
            </Button>
          );
          break;
      }
    });

    return buttons.length > 0 ? <div className="flex gap-1">{buttons}</div> : null;
  }, [
    getDisplayState,
    getVisualConfig,
    disabled,
    isEditing,
    field.type,
    handleCustomize,
    handleStartEdit,
    handleReset,
    t,
  ]);

  /**
   * Render validation feedback if needed
   */
  const renderValidationFeedback = useCallback(() => {
    if (!showValidationFeedback || !validationResult || validationResult.isValid) {
      return null;
    }

    return (
      <div
        className={cn('mt-1 text-xs', VALIDATION_STYLES.error.textColor, ANIMATION_CONFIG.fadeIn)}
        data-testid="unified-value-error"
      >
        {validationResult.errorMessage}
      </div>
    );
  }, [showValidationFeedback, validationResult]);

  // Get current edit state for container styling
  const currentEditState = useMemo(() => {
    return getEditState(isEditing);
  }, [getEditState, isEditing]);

  return (
    <div className="w-full min-w-0" data-testid="unified-value-column">
      <div
        className={cn(
          'space-y-1',
          isEditing && VALIDATION_STYLES.validating.borderColor,
          currentEditState === FieldEditState.ERROR && VALIDATION_STYLES.error.borderColor,
          ANIMATION_CONFIG.transition
        )}
      >
        <div className="flex w-full min-w-0 items-center">
          <div className="mr-2 min-w-0 flex-1 overflow-hidden">{renderValueDisplay()}</div>
          <div className="flex flex-shrink-0 items-center gap-1">{renderActionButtons()}</div>
        </div>

        {renderValidationFeedback()}
      </div>
    </div>
  );
};

UnifiedValueColumn.displayName = 'UnifiedValueColumn';
