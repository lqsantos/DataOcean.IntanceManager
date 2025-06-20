/**
 * Utility functions for resetting fields recursively
 * Based on the BatchActions pattern but for targeted reset operations
 */

import type { DefaultValueField } from '../../types';
import { ValueSourceType } from '../../types';

/**
 * Recursively resets specified field paths back to template values
 * @param fields - The full field structure
 * @param pathsToReset - Array of field paths that should be reset
 * @returns Updated field structure with specified paths reset
 */
export function resetFieldsByPaths(
  fields: DefaultValueField[],
  pathsToReset: string[]
): DefaultValueField[] {
  if (!pathsToReset.length) {
    return fields;
  }

  // Create a Set for efficient path lookup
  const pathsToResetSet = new Set(pathsToReset);

  const resetField = (field: DefaultValueField): DefaultValueField => {
    const fieldPath = field.path.join('.');
    let updatedField = { ...field };

    // If this field path should be reset
    if (pathsToResetSet.has(fieldPath)) {
      updatedField = {
        ...field,
        source: ValueSourceType.TEMPLATE,
        value: field.originalValue ?? null,
      };
    }

    // Recursively process children
    if (field.children && field.children.length > 0) {
      updatedField.children = field.children.map(resetField);
    }

    return updatedField;
  };

  return fields.map(resetField);
}

/**
 * Recursively collects all customized field paths within a parent field
 * @param parentField - The parent field to analyze
 * @returns Array of paths for all customized descendants
 */
export function collectCustomizedFieldPaths(parentField: DefaultValueField): string[] {
  const customizedPaths: string[] = [];

  const collectFromChildren = (children: DefaultValueField[]) => {
    for (const child of children) {
      if (child.source === ValueSourceType.BLUEPRINT) {
        customizedPaths.push(child.path.join('.'));
      }

      if (child.children && child.children.length > 0) {
        collectFromChildren(child.children);
      }
    }
  };

  if (parentField.children && parentField.children.length > 0) {
    collectFromChildren(parentField.children);
  }

  return customizedPaths;
}

/**
 * Checks if a field has any customized descendants
 * @param field - The field to check
 * @returns True if any descendant is customized
 */
export function hasCustomizedDescendants(field: DefaultValueField): boolean {
  if (!field.children || field.children.length === 0) {
    return false;
  }

  for (const child of field.children) {
    if (child.source === ValueSourceType.BLUEPRINT) {
      return true;
    }

    if (hasCustomizedDescendants(child)) {
      return true;
    }
  }

  return false;
}

/**
 * Creates a reset handler function for use with EnhancedTableRows
 * @param onFieldsChange - Callback to update the fields
 * @returns Function that can be passed as onResetRecursive
 */
export function createRecursiveResetHandler(onFieldsChange: (fields: DefaultValueField[]) => void) {
  return (customizedPaths: string[]) => {
    return (fields: DefaultValueField[]) => {
      const updatedFields = resetFieldsByPaths(fields, customizedPaths);

      onFieldsChange(updatedFields);
    };
  };
}
