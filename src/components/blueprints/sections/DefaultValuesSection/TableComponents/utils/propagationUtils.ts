/**
 * Utilitários para propagação bottom-up de estados de campo
 */

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField } from '../../types';
import * as FieldService from '../fieldUpdateService';
import * as ValueConfigFieldService from '../valueConfigFieldUpdateService';

/**
 * Implementa propagação bottom-up para o estado 'exposed' na configuração tipada
 */
export function propagateExposedToAncestors(
  valueConfig: ValueConfiguration,
  fieldPath: string
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };
  const hasParent = fieldPath.includes('.');

  // Propaga para ancestrais se for um campo aninhado
  if (hasParent) {
    const segments = fieldPath.split('.');

    // Para cada nível na hierarquia, garantimos que o ancestral está habilitado
    // Começamos do pai e vamos subindo até o root
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestorPath = segments.slice(0, i).join('.');

      // Habilita o ancestral
      updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
        updatedValueConfig,
        ancestorPath,
        true
      );
    }
  }

  // Explicitamente habilitamos o nó raiz (root)
  updatedValueConfig = ValueConfigFieldService.updateFieldExposed(updatedValueConfig, 'root', true);

  return updatedValueConfig;
}

/**
 * Implementa propagação bottom-up para o estado 'overridable' na configuração tipada
 */
export function propagateOverrideToAncestors(
  valueConfig: ValueConfiguration,
  fieldPath: string
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };
  const hasParent = fieldPath.includes('.');

  // Propaga para ancestrais se for um campo aninhado
  if (hasParent) {
    const segments = fieldPath.split('.');

    // Para cada nível na hierarquia, garantimos que o ancestral está habilitado e overridable
    // Começamos do pai e vamos subindo até o root
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestorPath = segments.slice(0, i).join('.');

      // Habilita o ancestral (exposed e overridable)
      updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
        updatedValueConfig,
        ancestorPath,
        true
      );

      updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
        updatedValueConfig,
        ancestorPath,
        true
      );
    }
  }

  // Explicitamente habilitamos o nó raiz (root)
  updatedValueConfig = ValueConfigFieldService.updateFieldExposed(updatedValueConfig, 'root', true);

  updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
    updatedValueConfig,
    'root',
    true
  );

  return updatedValueConfig;
}

/**
 * Implementa propagação bottom-up para o estado 'exposed' na lógica tradicional
 */
export function propagateExposedToAncestorsTraditional(
  fields: DefaultValueField[],
  fieldPath: string,
  findFieldByPath: (fields: DefaultValueField[], pathSegments: string[]) => DefaultValueField | null
): DefaultValueField[] {
  let updatedFields = [...fields];
  const segments = fieldPath.split('.');
  const hasParent = segments.length > 1;

  // Propaga para ancestrais se for um campo aninhado
  if (hasParent) {
    // Para cada nível na hierarquia, garantimos que o ancestral está habilitado
    // Começamos do pai e vamos subindo até o root
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestorPath = segments.slice(0, i).join('.');
      const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

      if (ancestorField && !ancestorField.exposed) {
        // Habilita o ancestral
        updatedFields = FieldService.updateFieldExposed(updatedFields, ancestorField, true);
      }
    }
  }

  // Explicitamente habilitamos o nó raiz (root)
  const rootField = findFieldByPath(updatedFields, ['root']);

  if (rootField && !rootField.exposed) {
    updatedFields = FieldService.updateFieldExposed(updatedFields, rootField, true);
  }

  return updatedFields;
}

/**
 * Implementa propagação bottom-up para o estado 'overridable' na lógica tradicional
 */
export function propagateOverrideToAncestorsTraditional(
  fields: DefaultValueField[],
  fieldPath: string,
  findFieldByPath: (fields: DefaultValueField[], pathSegments: string[]) => DefaultValueField | null
): DefaultValueField[] {
  let updatedFields = [...fields];
  const segments = fieldPath.split('.');
  const hasParent = segments.length > 1;

  // Propaga para ancestrais se for um campo aninhado
  if (hasParent) {
    // Para cada nível na hierarquia, garantimos que o ancestral está habilitado e overridable
    // Começamos do pai e vamos subindo até o root
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestorPath = segments.slice(0, i).join('.');
      const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

      if (ancestorField) {
        // Make sure ancestor is exposed
        if (!ancestorField.exposed) {
          updatedFields = FieldService.updateFieldExposed(updatedFields, ancestorField, true);
        }

        // Make sure ancestor is also overridable
        if (!ancestorField.overridable) {
          updatedFields = FieldService.updateFieldOverridable(updatedFields, ancestorField, true);
        }
      }
    }
  }

  // Explicitamente habilitamos o nó raiz (root)
  const rootField = findFieldByPath(updatedFields, ['root']);

  if (rootField) {
    // Make sure root is exposed
    if (!rootField.exposed) {
      updatedFields = FieldService.updateFieldExposed(updatedFields, rootField, true);
    }

    // Make sure root is also overridable
    if (!rootField.overridable) {
      updatedFields = FieldService.updateFieldOverridable(updatedFields, rootField, true);
    }
  }

  return updatedFields;
}
