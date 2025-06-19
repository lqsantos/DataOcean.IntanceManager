/**
 * FieldUpdateService
 * Provides utilities for updating fields in the template values
 */

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

type FieldUpdaterFunction = (field: DefaultValueField) => void;

/**
 * Updates a field in the fields array based on its path
 *
 * @param fields Array of fields to search within
 * @param path Path array identifying the field to update
 * @param updateFn Function that will be called with the found field to update it
 * @returns Updated fields array
 */
export function updateField(
  fields: DefaultValueField[],
  path: string[],
  updateFn: FieldUpdaterFunction
): DefaultValueField[] {
  return fields.map((field) => {
    // Check if paths match
    const isMatch =
      field.path.length === path.length && field.path.every((segment, i) => segment === path[i]);

    if (isMatch) {
      const updatedField = { ...field };

      updateFn(updatedField);

      return updatedField;
    }

    // Recursively check children
    if (field.children && field.children.length > 0) {
      return {
        ...field,
        children: updateField(field.children, path, updateFn),
      };
    }

    return field;
  });
}

/**
 * Updates the source of a field
 *
 * @param fields Array of fields
 * @param field The field to update
 * @param source New source value
 * @returns Updated fields array
 */
export function updateFieldSource(
  fields: DefaultValueField[],
  field: DefaultValueField,
  source: ValueSourceType
): DefaultValueField[] {
  return updateField(fields, field.path, (f) => {
    f.source = source;
  });
}

/**
 * Updates the value of a field
 *
 * @param fields Array of fields
 * @param field The field to update
 * @param newValue New value
 * @returns Updated fields array
 */
export function updateFieldValue(
  fields: DefaultValueField[],
  field: DefaultValueField,
  newValue: unknown
): DefaultValueField[] {
  return updateField(fields, field.path, (f) => {
    // Cast the value to the expected type
    f.value = newValue as typeof f.value;

    // If we're setting a value, ensure the source is blueprint
    if (newValue !== undefined && newValue !== null) {
      f.source = ValueSourceType.BLUEPRINT;
    }
  });
}

/**
 * Updates the exposed status of a field
 *
 * @param fields Array of fields
 * @param field The field to update
 * @param exposed New exposed value
 * @returns Updated fields array
 */
export function updateFieldExposed(
  fields: DefaultValueField[],
  field: DefaultValueField,
  exposed: boolean
): DefaultValueField[] {
  return updateField(fields, field.path, (f) => {
    f.exposed = exposed;

    // If not exposed, ensure it's not overridable
    if (!exposed && f.overridable) {
      f.overridable = false;
    }
  });
}

/**
 * Updates the overridable status of a field
 *
 * @param fields Array of fields
 * @param field The field to update
 * @param overridable New overridable value
 * @returns Updated fields array
 */
export function updateFieldOverridable(
  fields: DefaultValueField[],
  field: DefaultValueField,
  overridable: boolean
): DefaultValueField[] {
  return updateField(fields, field.path, (f) => {
    f.overridable = overridable;
  });
}
