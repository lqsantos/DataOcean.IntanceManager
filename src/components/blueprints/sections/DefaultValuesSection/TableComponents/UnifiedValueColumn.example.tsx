/**
 * Example usage of UnifiedValueColumn component
 * This demonstrates how to integrate the new unified value column
 * into the existing table structure (for documentation purposes)
 */

import React, { useCallback, useState } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import { UnifiedValueColumn } from './UnifiedValueColumn';

interface ExampleUsageProps {
  field: DefaultValueField;
  blueprintVariables?: Array<{ name: string; value: string }>;
  onFieldUpdate: (updatedField: DefaultValueField) => void;
}

/**
 * Example component showing how to use UnifiedValueColumn
 */
export const UnifiedValueColumnExample: React.FC<ExampleUsageProps> = ({
  field,
  blueprintVariables = [],
  onFieldUpdate,
}) => {
  const [_editingStates, setEditingStates] = useState<Record<string, boolean>>({});

  /**
   * Handle starting edit mode for a field
   */
  const handleStartEdit = useCallback(() => {
    const fieldPath = field.path.join('.');

    setEditingStates((prev) => ({
      ...prev,
      [fieldPath]: true,
    }));
  }, [field.path]);

  /**
   * Handle applying changes to a field
   */
  const handleApplyChanges = useCallback(
    (newValue: unknown) => {
      const updatedField: DefaultValueField = {
        ...field,
        value: newValue as string | number | boolean | Record<string, unknown> | unknown[] | null,
        source: ValueSourceType.BLUEPRINT, // Mark as customized
      };

      onFieldUpdate(updatedField);

      // Clear editing state
      const fieldPath = field.path.join('.');

      setEditingStates((prev) => {
        const newState = { ...prev };

        delete newState[fieldPath];

        return newState;
      });
    },
    [field, onFieldUpdate]
  );

  /**
   * Handle canceling edit mode
   */
  const handleCancelEdit = useCallback(() => {
    const fieldPath = field.path.join('.');

    setEditingStates((prev) => {
      const newState = { ...prev };

      delete newState[fieldPath];

      return newState;
    });
  }, [field.path]);

  /**
   * Handle customizing field (template → blueprint)
   */
  const handleCustomize = useCallback(() => {
    const templateValue = field.originalValue !== undefined ? field.originalValue : field.value;
    const updatedField: DefaultValueField = {
      ...field,
      value: templateValue,
      source: ValueSourceType.BLUEPRINT,
    };

    onFieldUpdate(updatedField);
  }, [field, onFieldUpdate]);

  /**
   * Handle resetting field (blueprint → template)
   */
  const handleReset = useCallback(() => {
    const updatedField: DefaultValueField = {
      ...field,
      value: field.originalValue || null,
      source: ValueSourceType.TEMPLATE,
    };

    onFieldUpdate(updatedField);
  }, [field, onFieldUpdate]);

  return (
    <UnifiedValueColumn
      field={field}
      onStartEdit={handleStartEdit}
      onApplyChanges={handleApplyChanges}
      onCancelEdit={handleCancelEdit}
      onCustomize={handleCustomize}
      onReset={handleReset}
      blueprintVariables={blueprintVariables}
      showValidationFeedback={true}
      disabled={false}
    />
  );
};

/*
INTEGRATION NOTES:

1. **Replacing existing columns:**
   - Remove "Template Default" column rendering
   - Remove "Blueprint Value" column rendering
   - Replace both with single UnifiedValueColumn

2. **State management:**
   - Track editing states at parent level
   - Handle field updates through callbacks
   - Manage validation and transitions

3. **Event handling:**
   - onStartEdit: User clicks edit button
   - onApplyChanges: User confirms changes
   - onCancelEdit: User cancels editing
   - onCustomize: User customizes template value
   - onReset: User resets to template

4. **Visual states:**
   - Template: Gray background, Circle icon, "Customize" button
   - Customized: Blue background, Edit3 icon, "Edit" + "Reset" buttons
   - Editing: Highlighted background, EditableValueContainer active
   - Error: Red background, validation message

5. **Type support:**
   - String/Number/Boolean: Inline editing with Apply/Cancel
   - Object: ObjectDisplayComponent with "Reset All Children"
   - Array: Special display with YAML-only note

6. **Accessibility:**
   - Proper aria-labels and data-testid attributes
   - Keyboard shortcuts (Enter/Escape) for editing
   - Focus management during state transitions
*/
