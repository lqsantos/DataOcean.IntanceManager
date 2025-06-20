/**
 * UnifiedValueColumn component
 *
 * This is the core component of the refactoring! Replaces two confusing columns
 * ("Template Default" vs "Blueprint Value") with one intelligent, intuitive experience.
 *
 * Key Features:
 * - Detects value origin (template vs blueprint)
 * - Manages distinct visual states with appropriate colors/icons
 * - Orchestrates validation + editors from previous phases
 * - Coordinates transitions between states (idle → editing → validated)
 * - Supports all types: string, number, boolean, object, array
 */

import { Edit3 } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useFieldValidation } from '../hooks/useFieldValidation';
import { ValueSourceType } from '../types';

import {
  ANIMATION_CONFIG,
  BUTTON_STYLES,
  SIZE_CONFIG,
  UNIFIED_COLUMN_WIDTHS,
  VALIDATION_STYLES,
  VALUE_STATE_CONFIG,
} from './constants';
import { EditableValueContainer } from './EditableValueContainer';
import { ObjectDisplayComponent } from './ObjectDisplayComponent';
import { FieldEditState, type UnifiedValueColumnProps, ValueDisplayState } from './types';
import { ArrayEditor } from './ValueEditors';

/**
 * Core unified value column component that orchestrates the entire experience
 */
export const UnifiedValueColumn: React.FC<UnifiedValueColumnProps> = ({
  field,
  editingState: _editingState,
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
  const { t } = useTranslation('blueprints');

  // Local state for managing edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<unknown>(field.value);

  // Initialize validation hook for real-time feedback
  const {
    validationResult,
    isValidating: _isValidating,
    validateValueDebounced,
    clearValidation,
    getEditState,
  } = useFieldValidation({
    field,
    blueprintVariables,
  });

  /**
   * Determine the visual display state based on field properties
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
          stateIcon: Edit3, // Icon won't be shown for template fields
          availableActions: ['customize'] as const,
        };

      case ValueDisplayState.CUSTOMIZED:
        return {
          ...VALUE_STATE_CONFIG.customized,
          stateIcon: Edit3,
          availableActions: ['edit', 'reset'] as const,
        };

      case ValueDisplayState.EDITING:
        return {
          ...VALUE_STATE_CONFIG.editing,
          stateIcon: Edit3,
          availableActions: ['apply', 'cancel'] as const,
        };

      case ValueDisplayState.OBJECT:
        return {
          ...VALUE_STATE_CONFIG.object,
          stateIcon: Edit3,
          availableActions: [] as const,
        };

      default:
        return {
          ...VALUE_STATE_CONFIG.template,
          stateIcon: Edit3, // Icon won't be shown for template fields
          availableActions: [] as const,
        };
    }
  }, []);

  /**
   * Handle starting edit mode
   */
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setTempValue(field.value);
    onStartEdit?.();
  }, [field.value, onStartEdit]);

  /**
   * Handle applying changes
   */
  const handleApplyChanges = useCallback(() => {
    const editState = getEditState(true);

    // Only apply if value is valid or no validation was performed
    if (editState === FieldEditState.VALID || (!validationResult && tempValue !== field.value)) {
      onApplyChanges?.(tempValue);
      setIsEditing(false);
      clearValidation();
    }
  }, [tempValue, field.value, onApplyChanges, validationResult, getEditState, clearValidation]);

  /**
   * Handle canceling edit
   */
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setTempValue(field.value);
    clearValidation();
    onCancelEdit?.();
  }, [field.value, onCancelEdit, clearValidation]);

  /**
   * Handle customizing field (template → blueprint)
   */
  const handleCustomize = useCallback(() => {
    // Copy template value to blueprint and start editing
    const templateValue = field.originalValue !== undefined ? field.originalValue : field.value;

    setTempValue(templateValue);
    onCustomize?.();
    handleStartEdit();
  }, [field.originalValue, field.value, onCustomize, handleStartEdit]);

  /**
   * Handle resetting field (blueprint → template)
   */
  const handleReset = useCallback(() => {
    onReset?.();
    setIsEditing(false);
    clearValidation();
  }, [onReset, clearValidation]);

  /**
   * Handle resetting all children recursively for object fields
   */
  const handleResetAllChildren = useCallback(
    (customizedPaths: string[]) => {
      // For object fields, we need to reset all children that are customized
      console.warn('[UnifiedValueColumn] Resetting children paths:', customizedPaths);

      if (onResetRecursive) {
        // Use the specialized recursive reset callback
        onResetRecursive(customizedPaths);
      } else {
        // Fallback to regular reset
        onReset?.();
      }

      setIsEditing(false);
      clearValidation();
    },
    [onResetRecursive, onReset, clearValidation]
  );

  /**
   * Handle temporary value changes during editing
   */
  const _handleTempValueChange = useCallback(
    (newValue: unknown) => {
      setTempValue(newValue);
      onTempValueChange?.(newValue);

      // Validate with debounce
      if (newValue !== field.value) {
        validateValueDebounced(newValue);
      } else {
        clearValidation();
      }
    },
    [field.value, onTempValueChange, validateValueDebounced, clearValidation]
  );

  /**
   * Render value display based on type and state
   */
  const renderValueDisplay = useCallback(() => {
    const displayState = getDisplayState();
    const visualConfig = getVisualConfig(displayState);

    // Handle editing mode
    if (isEditing && field.type !== 'object' && field.type !== 'array') {
      return (
        <EditableValueContainer
          field={field}
          initialValue={tempValue as string | number | boolean}
          onApply={handleApplyChanges}
          onCancel={handleCancelEdit}
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
              'min-w-64 w-auto max-w-sm rounded-md border transition-colors',
              isArrayFromTemplate ? visualConfig.bgColor : 'bg-white',
              isArrayFromTemplate ? visualConfig.borderColor : 'border-gray-300',
              'h-8 px-2 py-1' // Consistent height and padding
            )}
          >
            <ArrayEditor disabled={isArrayFromTemplate} />
          </div>
        );
      }

      default: {
        const isDefaultFromTemplate = field.source === ValueSourceType.TEMPLATE;
        const StateIcon = visualConfig.stateIcon;

        let displayValue: string;

        if (isDefaultFromTemplate) {
          displayValue = field.originalValue !== undefined ? String(field.originalValue) : '-';
        } else {
          displayValue = String(field.value || '');
        }

        return (
          <div
            className={cn(
              'min-w-64 flex w-auto max-w-sm items-center justify-between rounded-md border transition-colors',
              visualConfig.bgColor,
              visualConfig.borderColor,
              ANIMATION_CONFIG.transition,
              'h-8 px-2 py-1' // Consistent height and padding
            )}
          >
            <div className="flex items-center gap-2">
              {/* Only show icon for customized fields to reduce visual clutter */}
              {!isDefaultFromTemplate && (
                <StateIcon
                  size={16}
                  className={cn(visualConfig.iconColor)}
                  data-testid="unified-value-icon"
                />
              )}
              <span
                className={cn('truncate text-sm', visualConfig.textColor)}
                data-testid="unified-value-text"
              >
                {displayValue}
              </span>
            </div>
          </div>
        );
      }
    }
  }, [
    getDisplayState,
    getVisualConfig,
    isEditing,
    field,
    tempValue,
    handleApplyChanges,
    handleCancelEdit,
    blueprintVariables,
    handleReset,
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
                variant="ghost"
                size="sm"
                className={cn(BUTTON_STYLES.customize, SIZE_CONFIG.buttonHeight)}
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
                variant="ghost"
                size="sm"
                className={cn(BUTTON_STYLES.edit, SIZE_CONFIG.buttonHeight)}
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
              variant="outline"
              size="sm"
              className={cn(BUTTON_STYLES.reset, SIZE_CONFIG.buttonHeight)}
              onClick={handleReset}
              data-testid="unified-value-reset"
            >
              {t('values.table.reset')}
            </Button>
          );
          break;
      }
    });

    return buttons.length > 0 ? (
      <div className={cn('flex', SIZE_CONFIG.spacing.xs)}>{buttons}</div>
    ) : null;
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
    <div
      className="w-full"
      style={{ width: UNIFIED_COLUMN_WIDTHS.value }}
      data-testid="unified-value-column"
    >
      {/* Main value display/editor container */}
      <div
        className={cn(
          'space-y-1',
          isEditing && VALIDATION_STYLES.validating.borderColor,
          currentEditState === FieldEditState.ERROR && VALIDATION_STYLES.error.borderColor,
          ANIMATION_CONFIG.transition
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">{renderValueDisplay()}</div>
          {renderActionButtons()}
        </div>

        {renderValidationFeedback()}
      </div>
    </div>
  );
};

UnifiedValueColumn.displayName = 'UnifiedValueColumn';
