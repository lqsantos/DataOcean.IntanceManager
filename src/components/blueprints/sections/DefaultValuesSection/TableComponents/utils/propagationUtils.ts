/**
 * Utilitários para propagação de estados de campos
 * Implementa propagações top-down e bottom-up para os estados exposed e overridable
 */

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField } from '../../types';
import * as FieldService from '../fieldUpdateService';
import * as ValueConfigFieldService from '../valueConfigFieldUpdateService';

/**
 * Tipos compartilhados
 */
type FindFieldByPathFn = (
  fields: DefaultValueField[],
  pathSegments: string[]
) => DefaultValueField | null;

/**
 * Utilitários para verificar relação pai-filho entre paths
 */
function isChildPath(childPath: string, parentPath: string): boolean {
  const childParts = childPath.split('.');
  const parentParts = parentPath.split('.');

  return (
    childParts.length === parentParts.length + 1 &&
    childParts.slice(0, parentParts.length).join('.') === parentPath
  );
}

function getParentPath(path: string): string | null {
  return path.includes('.') ? path.split('.').slice(0, -1).join('.') : null;
}

/**
 * PROPAGAÇÃO BOTTOM-UP (HABILITAÇÃO) - CONFIGURAÇÃO TIPADA
 */

/**
 * Implementa propagação bottom-up para o estado 'exposed' na configuração tipada
 */
export function propagateExposedToAncestors(
  valueConfig: ValueConfiguration,
  fieldPath: string
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };

  // Propaga para todos os ancestrais
  let currentPath = getParentPath(fieldPath);

  while (currentPath) {
    // Habilita o ancestral
    updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
      updatedValueConfig,
      currentPath,
      true
    );

    currentPath = getParentPath(currentPath);
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

  // Propaga para todos os ancestrais
  let currentPath = getParentPath(fieldPath);

  while (currentPath) {
    // Habilita o ancestral (exposed e overridable)
    updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
      updatedValueConfig,
      currentPath,
      true
    );

    updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
      updatedValueConfig,
      currentPath,
      true
    );

    currentPath = getParentPath(currentPath);
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
 * PROPAGAÇÃO BOTTOM-UP (DESABILITAÇÃO) - CONFIGURAÇÃO TIPADA
 */

/**
 * Verifica se todos os filhos de um campo estão com 'exposed' desabilitado
 * e retorna o campo pai com seu estado atualizado
 */
export function updateParentExposedBasedOnChildren(
  valueConfig: ValueConfiguration,
  parentPath: string
): ValueConfiguration {
  // Obtenha os campos filhos diretos
  const directChildren = Object.entries(valueConfig.fields).filter(([path]) =>
    isChildPath(path, parentPath)
  );

  // Se não tem filhos diretos, nada a fazer
  if (directChildren.length === 0) {
    return valueConfig;
  }

  // Verifica se TODOS os filhos diretos estão com exposed=false
  const allChildrenDisabled = directChildren.every(([_, field]) => !field.isExposed);

  // Se todos os filhos estão desabilitados, desabilita o pai também
  if (allChildrenDisabled) {
    let result = ValueConfigFieldService.updateFieldExposed(valueConfig, parentPath, false);

    // Se o campo também está com override ativado, precisamos desativá-lo
    result = ValueConfigFieldService.updateFieldOverridable(result, parentPath, false);

    return result;
  }

  return valueConfig;
}

/**
 * Verifica se todos os filhos de um campo estão com 'overridable' desabilitado
 * e retorna o campo pai com seu estado atualizado
 */
export function updateParentOverrideBasedOnChildren(
  valueConfig: ValueConfiguration,
  parentPath: string
): ValueConfiguration {
  // Obtenha os campos filhos diretos
  const directChildren = Object.entries(valueConfig.fields).filter(([path]) =>
    isChildPath(path, parentPath)
  );

  // Se não tem filhos diretos, nada a fazer
  if (directChildren.length === 0) {
    return valueConfig;
  }

  // Verifica se TODOS os filhos diretos estão com overridable=false
  const allChildrenNonOverridable = directChildren.every(([_, field]) => !field.isOverridable);

  // Se todos os filhos estão com override desabilitado, desabilita o override do pai também
  if (allChildrenNonOverridable) {
    return ValueConfigFieldService.updateFieldOverridable(valueConfig, parentPath, false);
  }

  return valueConfig;
}

/**
 * Verifica recursivamente todos os níveis da hierarquia para atualizar
 * os estados dos pais com base nos filhos
 */
export function propagateChildrenStatesToParents(
  valueConfig: ValueConfiguration
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };

  // Lista de todos os caminhos de campos, ordenados do mais profundo para o mais raso
  const allPaths = Object.keys(valueConfig.fields)
    .filter((path) => path !== 'root') // Exclui o root, já que não tem pai
    .sort((a, b) => b.split('.').length - a.split('.').length);

  // Para cada caminho, começando pelos mais profundos
  for (const path of allPaths) {
    const parentPath = getParentPath(path);

    if (parentPath) {
      // Atualize o estado do pai com base nos filhos
      updatedValueConfig = updateParentExposedBasedOnChildren(updatedValueConfig, parentPath);
      updatedValueConfig = updateParentOverrideBasedOnChildren(updatedValueConfig, parentPath);
    }
  }

  return updatedValueConfig;
}

/**
 * PROPAGAÇÃO BOTTOM-UP (HABILITAÇÃO) - ESTRUTURA TRADICIONAL
 */

/**
 * Implementa propagação bottom-up para o estado 'exposed' na lógica tradicional
 */
export function propagateExposedToAncestorsTraditional(
  fields: DefaultValueField[],
  fieldPath: string,
  findFieldByPath: FindFieldByPathFn
): DefaultValueField[] {
  let updatedFields = [...fields];
  const segments = fieldPath.split('.');

  // Para cada nível na hierarquia, garantimos que o ancestral está habilitado
  for (let i = segments.length - 1; i > 0; i--) {
    const ancestorPath = segments.slice(0, i).join('.');
    const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

    if (ancestorField && !ancestorField.exposed) {
      updatedFields = FieldService.updateFieldExposed(updatedFields, ancestorField, true);
    }
  }

  // Garantir que a raiz sempre esteja habilitada
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
  findFieldByPath: FindFieldByPathFn
): DefaultValueField[] {
  let updatedFields = [...fields];
  const segments = fieldPath.split('.');

  // Para cada nível na hierarquia, garantimos que o ancestral está habilitado e overridable
  for (let i = segments.length - 1; i > 0; i--) {
    const ancestorPath = segments.slice(0, i).join('.');
    const ancestorField = findFieldByPath(updatedFields, ancestorPath.split('.'));

    if (ancestorField) {
      if (!ancestorField.exposed) {
        updatedFields = FieldService.updateFieldExposed(updatedFields, ancestorField, true);
      }

      if (!ancestorField.overridable) {
        updatedFields = FieldService.updateFieldOverridable(updatedFields, ancestorField, true);
      }
    }
  }

  // Garantir que a raiz sempre esteja habilitada
  const rootField = findFieldByPath(updatedFields, ['root']);

  if (rootField) {
    if (!rootField.exposed) {
      updatedFields = FieldService.updateFieldExposed(updatedFields, rootField, true);
    }

    if (!rootField.overridable) {
      updatedFields = FieldService.updateFieldOverridable(updatedFields, rootField, true);
    }
  }

  return updatedFields;
}

/**
 * PROPAGAÇÃO BOTTOM-UP (DESABILITAÇÃO) - ESTRUTURA TRADICIONAL
 */

/**
 * Verifica se todos os filhos diretos de um campo estão com 'exposed' desabilitado
 * e atualiza o estado do campo pai
 */
export function updateParentExposedBasedOnChildrenTraditional(
  fields: DefaultValueField[],
  parentField: DefaultValueField
): DefaultValueField[] {
  // Se não tem filhos, nada a fazer
  if (!parentField.children?.length) {
    return fields;
  }

  // Verifica se TODOS os filhos diretos estão com exposed=false
  const allChildrenDisabled = parentField.children.every((child) => !child.exposed);

  // Se todos os filhos estão desabilitados, desabilita o pai também
  if (allChildrenDisabled) {
    let result = FieldService.updateFieldExposed(fields, parentField, false);

    // Se o campo também está com override ativado, precisamos desativá-lo
    if (parentField.overridable) {
      result = FieldService.updateFieldOverridable(result, parentField, false);
    }

    return result;
  }

  return fields;
}

/**
 * Verifica se todos os filhos diretos de um campo estão com 'overridable' desabilitado
 * e atualiza o estado do campo pai
 */
export function updateParentOverrideBasedOnChildrenTraditional(
  fields: DefaultValueField[],
  parentField: DefaultValueField
): DefaultValueField[] {
  // Se não tem filhos, nada a fazer
  if (!parentField.children?.length) {
    return fields;
  }

  // Verifica se TODOS os filhos diretos estão com overridable=false
  const allChildrenNonOverridable = parentField.children.every((child) => !child.overridable);

  // Se todos os filhos estão com override desabilitado, desabilita o override do pai também
  if (allChildrenNonOverridable) {
    return FieldService.updateFieldOverridable(fields, parentField, false);
  }

  return fields;
}

/**
 * Propaga recursivamente o estado dos filhos para os pais na estrutura tradicional
 */
export function propagateChildrenStatesToParentsTraditional(
  fields: DefaultValueField[],
  findFieldByPath: FindFieldByPathFn
): DefaultValueField[] {
  // Função recursiva para processar cada campo e seus filhos
  function processField(
    field: DefaultValueField,
    currentFields: DefaultValueField[]
  ): DefaultValueField[] {
    let updatedFields = [...currentFields];

    // Processa os filhos primeiro (do mais profundo para o mais raso)
    if (field.children?.length) {
      // Processa cada filho
      for (const child of field.children) {
        updatedFields = processField(child, updatedFields);
      }

      // Após processar todos os filhos, atualiza o estado do pai
      const updatedField = findFieldByPath(updatedFields, field.path);

      if (updatedField) {
        updatedFields = updateParentExposedBasedOnChildrenTraditional(updatedFields, updatedField);
        updatedFields = updateParentOverrideBasedOnChildrenTraditional(updatedFields, updatedField);
      }
    }

    return updatedFields;
  }

  // Começa o processamento pela raiz
  const rootField = findFieldByPath(fields, ['root']);

  return rootField ? processField(rootField, fields) : fields;
}
