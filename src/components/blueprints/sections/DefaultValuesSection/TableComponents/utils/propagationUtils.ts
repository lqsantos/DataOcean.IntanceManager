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
 * Verifica se todos os filhos de um campo estão com 'exposed' desabilitado
 * e retorna o campo pai com seu estado atualizado
 */
export function updateParentExposedBasedOnChildren(
  valueConfig: ValueConfiguration,
  parentPath: string
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };
  
  // Obtenha todos os campos do ValueConfiguration
  const allFields = Object.entries(valueConfig.fields);
  
  // Filtra para encontrar campos filhos diretos do parentPath
  const directChildren = allFields.filter(([path]) => {
    // Se o path do campo é filho direto do parentPath
    const pathParts = path.split('.');
    const parentParts = parentPath.split('.');
    
    // Condições para ser filho direto:
    // 1. Deve ter um nível a mais que o pai
    // 2. Todos os segmentos do pai devem corresponder
    return (
      pathParts.length === parentParts.length + 1 &&
      pathParts.slice(0, parentParts.length).join('.') === parentPath
    );
  });
  
  // Se não tem filhos diretos, nada a fazer
  if (directChildren.length === 0) {
    return updatedValueConfig;
  }
  
  // Verifica se TODOS os filhos diretos estão com exposed=false
  const allChildrenDisabled = directChildren.every(([_, field]) => !field.isExposed);
  
  // Se todos os filhos estão desabilitados, desabilita o pai também
  if (allChildrenDisabled) {
    updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
      updatedValueConfig,
      parentPath,
      false
    );
    
    // Se o campo também está com override ativado, precisamos desativá-lo
    updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
      updatedValueConfig,
      parentPath,
      false
    );
  }
  
  return updatedValueConfig;
}

/**
 * Verifica se todos os filhos de um campo estão com 'overridable' desabilitado
 * e retorna o campo pai com seu estado atualizado
 */
export function updateParentOverrideBasedOnChildren(
  valueConfig: ValueConfiguration,
  parentPath: string
): ValueConfiguration {
  let updatedValueConfig = { ...valueConfig };
  
  // Obtenha todos os campos do ValueConfiguration
  const allFields = Object.entries(valueConfig.fields);
  
  // Filtra para encontrar campos filhos diretos do parentPath
  const directChildren = allFields.filter(([path]) => {
    const pathParts = path.split('.');
    const parentParts = parentPath.split('.');
    
    return (
      pathParts.length === parentParts.length + 1 &&
      pathParts.slice(0, parentParts.length).join('.') === parentPath
    );
  });
  
  // Se não tem filhos diretos, nada a fazer
  if (directChildren.length === 0) {
    return updatedValueConfig;
  }
  
  // Verifica se TODOS os filhos diretos estão com overridable=false
  const allChildrenNonOverridable = directChildren.every(([_, field]) => !field.isOverridable);
  
  // Se todos os filhos estão com override desabilitado, desabilita o override do pai também
  if (allChildrenNonOverridable) {
    updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
      updatedValueConfig,
      parentPath,
      false
    );
  }
  
  return updatedValueConfig;
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
  const allPaths = Object.keys(valueConfig.fields).sort((a, b) => {
    return b.split('.').length - a.split('.').length;
  });
  
  // Para cada caminho, começando pelos mais profundos
  for (const path of allPaths) {
    if (path.includes('.')) {
      // Obtenha o caminho do pai
      const parentPath = path.split('.').slice(0, -1).join('.');
      
      // Atualize o estado do pai com base nos filhos
      updatedValueConfig = updateParentExposedBasedOnChildren(updatedValueConfig, parentPath);
      updatedValueConfig = updateParentOverrideBasedOnChildren(updatedValueConfig, parentPath);
    }
  }
  
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

/**
 * Verifica se todos os filhos diretos de um campo estão com 'exposed' desabilitado
 * e atualiza o estado do campo pai
 */
export function updateParentExposedBasedOnChildrenTraditional(
  fields: DefaultValueField[],
  parentField: DefaultValueField
): DefaultValueField[] {
  let updatedFields = [...fields];
  
  // Se não tem filhos, nada a fazer
  if (!parentField.children || parentField.children.length === 0) {
    return updatedFields;
  }
  
  // Verifica se TODOS os filhos diretos estão com exposed=false
  const allChildrenDisabled = parentField.children.every(child => !child.exposed);
  
  // Se todos os filhos estão desabilitados, desabilita o pai também
  if (allChildrenDisabled) {
    updatedFields = FieldService.updateFieldExposed(updatedFields, parentField, false);
    
    // Se o campo também está com override ativado, precisamos desativá-lo
    if (parentField.overridable) {
      updatedFields = FieldService.updateFieldOverridable(updatedFields, parentField, false);
    }
  }
  
  return updatedFields;
}

/**
 * Verifica se todos os filhos diretos de um campo estão com 'overridable' desabilitado
 * e atualiza o estado do campo pai
 */
export function updateParentOverrideBasedOnChildrenTraditional(
  fields: DefaultValueField[],
  parentField: DefaultValueField
): DefaultValueField[] {
  let updatedFields = [...fields];
  
  // Se não tem filhos, nada a fazer
  if (!parentField.children || parentField.children.length === 0) {
    return updatedFields;
  }
  
  // Verifica se TODOS os filhos diretos estão com overridable=false
  const allChildrenNonOverridable = parentField.children.every(child => !child.overridable);
  
  // Se todos os filhos estão com override desabilitado, desabilita o override do pai também
  if (allChildrenNonOverridable) {
    updatedFields = FieldService.updateFieldOverridable(updatedFields, parentField, false);
  }
  
  return updatedFields;
}

/**
 * Propaga recursivamente o estado dos filhos para os pais
 * na estrutura tradicional
 */
export function propagateChildrenStatesToParentsTraditional(
  fields: DefaultValueField[],
  findFieldByPath: (fields: DefaultValueField[], pathSegments: string[]) => DefaultValueField | null
): DefaultValueField[] {
  // Função recursiva para processar cada campo e seus filhos
  function processField(
    field: DefaultValueField, 
    currentFields: DefaultValueField[]
  ): DefaultValueField[] {
    let updatedFields = [...currentFields];
    
    // Processa os filhos primeiro (do mais profundo para o mais raso)
    if (field.children && field.children.length > 0) {
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
  let result = [...fields];
  const rootField = findFieldByPath(result, ['root']);
  
  if (rootField) {
    result = processField(rootField, result);
  }
  
  return result;
}
