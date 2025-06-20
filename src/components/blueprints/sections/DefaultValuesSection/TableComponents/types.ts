/**
 * Types for Unified Value Column
 * Defines interfaces and enums for the new unified value column implementation
 * that replaces the separate "Template Default" and "Blueprint Value" columns.
 */

import type { DefaultValueField } from '../types';

/**
 * Enum for the state of field editing
 */
export enum FieldEditState {
  IDLE = 'idle', // Field is not being edited, showing current value
  EDITING = 'editing', // Field is currently being edited
  VALIDATING = 'validating', // Field value is being validated
  VALID = 'valid', // Field value is valid and ready to apply
  ERROR = 'error', // Field value has validation errors
}

/**
 * Enum for the visual state of the unified value column
 */
export enum ValueDisplayState {
  TEMPLATE = 'template', // Showing template default value (not customized)
  CUSTOMIZED = 'customized', // Showing customized blueprint value
  EDITING = 'editing', // Currently in edit mode
  OBJECT = 'object', // Field is an object (special display)
}

/**
 * Interface for validation results specific to field values
 */
export interface FieldValidationResult {
  /** Whether the current value is valid */
  isValid: boolean;

  /** Error message if validation failed */
  errorMessage?: string;

  /** Warning message for non-blocking issues */
  warningMessage?: string;

  /** Suggested corrected value */
  suggestedValue?: string | number | boolean;
}

/**
 * Interface for the editing state of a field
 */
export interface FieldEditingState {
  /** Current editing state */
  state: FieldEditState;

  /** Temporary value being edited (before apply) */
  tempValue?: string | number | boolean | Record<string, unknown> | unknown[] | null;

  /** Validation result for the temporary value */
  validation?: FieldValidationResult;

  /** Whether the field has unsaved changes */
  hasChanges: boolean;

  /** Original value when editing started (for cancel) */
  originalValue?: string | number | boolean | Record<string, unknown> | unknown[] | null;
}

/**
 * Props interface for the unified value column component
 */
export interface UnifiedValueColumnProps {
  /** The field being displayed/edited */
  field: DefaultValueField;

  /** Current editing state */
  editingState?: FieldEditingState;

  /** Callback when user starts editing */
  onStartEdit?: () => void;

  /** Callback when user applies changes */
  onApplyChanges?: (newValue: unknown) => void;

  /** Callback when user cancels editing */
  onCancelEdit?: () => void;

  /** Callback when temp value changes during editing */
  onTempValueChange?: (tempValue: unknown) => void;

  /** Callback when field is customized (template -> blueprint) */
  onCustomize?: () => void;

  /** Callback when field is reset (blueprint -> template) */
  onReset?: () => void;

  /** Callback for recursive reset of object children (for object fields only) */
  onResetRecursive?: (customizedPaths: string[]) => void;

  /** Available blueprint variables for interpolation */
  blueprintVariables?: Array<{ name: string; value: string }>;

  /** Whether to show validation feedback */
  showValidationFeedback?: boolean;

  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * Props interface for individual value editors with Apply/Cancel support
 */
export interface EnhancedValueEditorProps<T> {
  /** Current value */
  value: T;

  /** Temporary value being edited */
  tempValue?: T;

  /** Current editing state */
  editState: FieldEditState;

  /** Validation result */
  validation?: FieldValidationResult;

  /** Callback when temp value changes */
  onTempValueChange: (tempValue: T) => void;

  /** Callback when user applies changes */
  onApply: () => void;

  /** Callback when user cancels editing */
  onCancel: () => void;

  /** Whether the editor is disabled */
  disabled?: boolean;

  /** Available blueprint variables */
  variables?: Array<{ name: string; value: string }>;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Interface for value display configuration
 */
export interface ValueDisplayConfig {
  /** Visual state of the value */
  displayState: ValueDisplayState;

  /** Icon to show for the state */
  stateIcon?: string;

  /** Color theme for the state */
  stateColor: 'blue' | 'gray' | 'amber' | 'green' | 'red';

  /** Text to display for the value */
  displayText: string;

  /** Tooltip text */
  tooltipText?: string;

  /** Whether to show action buttons */
  showActions: boolean;

  /** Available actions for this state */
  availableActions: Array<'customize' | 'edit' | 'reset' | 'apply' | 'cancel'>;
}
