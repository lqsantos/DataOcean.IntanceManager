/**
 * ValueConfigFieldUpdateService
 * Provides utilities for updating fields in the ValueConfiguration structure
 */

import type { FieldConfiguration, ValueConfiguration } from '@/types/blueprint';

import { updateValueConfigurationField } from '../ValueConfigurationConverter';

/**
 * Updates a property of a field in the ValueConfiguration
 */
export function updateFieldProperty(
  valueConfig: ValueConfiguration,
  path: string,
  property: keyof Omit<FieldConfiguration, 'path' | 'type'>,
  newValue: unknown
): ValueConfiguration {
  return updateValueConfigurationField(valueConfig, path, {
    [property]: newValue,
  });
}

/**
 * Updates the isCustomized flag of a field
 */
export function updateFieldCustomized(
  valueConfig: ValueConfiguration,
  path: string,
  isCustomized: boolean
): ValueConfiguration {
  return updateFieldProperty(valueConfig, path, 'isCustomized', isCustomized);
}

/**
 * Updates the value of a field
 */
export function updateFieldValue(
  valueConfig: ValueConfiguration,
  path: string,
  newValue: unknown
): ValueConfiguration {
  // Quando definimos um novo valor, marcamos o campo como customizado
  const updatedConfig = updateFieldProperty(valueConfig, path, 'value', newValue);

  return updateFieldProperty(updatedConfig, path, 'isCustomized', true);
}

/**
 * Updates the isExposed flag of a field
 */
export function updateFieldExposed(
  valueConfig: ValueConfiguration,
  path: string,
  isExposed: boolean
): ValueConfiguration {
  return updateFieldProperty(valueConfig, path, 'isExposed', isExposed);
}

/**
 * Updates the isOverridable flag of a field
 */
export function updateFieldOverridable(
  valueConfig: ValueConfiguration,
  path: string,
  isOverridable: boolean
): ValueConfiguration {
  return updateFieldProperty(valueConfig, path, 'isOverridable', isOverridable);
}

/**
 * Updates the isRequired flag of a field
 */
export function updateFieldRequired(
  valueConfig: ValueConfiguration,
  path: string,
  isRequired: boolean
): ValueConfiguration {
  return updateFieldProperty(valueConfig, path, 'isRequired', isRequired);
}

/**
 * Resets a field value to its default value from template
 */
export function resetFieldToDefault(
  valueConfig: ValueConfiguration,
  path: string
): ValueConfiguration {
  const field = valueConfig.fields[path];

  if (!field) {
    return valueConfig;
  }

  const updatedConfig = updateFieldProperty(valueConfig, path, 'value', field.templateDefault);

  return updateFieldProperty(updatedConfig, path, 'isCustomized', false);
}
