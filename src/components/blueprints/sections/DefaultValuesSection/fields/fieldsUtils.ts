/**
 * Funções utilitárias para manipulação de campos hierárquicos
 */

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import type { FieldPath } from './types';

/**
 * Verifica se um caminho existe na estrutura de campos atual
 */
export function isPathValid(fields: DefaultValueField[], searchPath: FieldPath): boolean {
  const checkInFields = (fieldsToSearch: DefaultValueField[], path: string): boolean => {
    for (const field of fieldsToSearch) {
      if (field.path.join('.') === path) {
        return true;
      }

      if (field.children && field.children.length > 0) {
        if (checkInFields(field.children, path)) {
          return true;
        }
      }
    }

    return false;
  };

  return checkInFields(fields, searchPath);
}

/**
 * Obtém todos os caminhos pai de um caminho específico
 */
export function getParentPaths(fieldPath: FieldPath): FieldPath[] {
  if (!fieldPath) {
    return [];
  }

  const segments = fieldPath.split('.');
  const parentPaths: FieldPath[] = [];

  // Cria todos os caminhos pai intermediários
  for (let i = 1; i < segments.length; i++) {
    parentPaths.push(segments.slice(0, i).join('.'));
  }

  return parentPaths;
}

/**
 * Encontra um campo pelo caminho
 */
export function findFieldByPath(
  fields: DefaultValueField[],
  path: FieldPath
): DefaultValueField | null {
  const segments = path.split('.');

  // Função recursiva para encontrar o campo
  const search = (
    fieldsToSearch: DefaultValueField[],
    pathSegments: string[]
  ): DefaultValueField | null => {
    for (const field of fieldsToSearch) {
      if (
        field.path.length === pathSegments.length &&
        field.path.every((segment: string, i: number) => segment === pathSegments[i])
      ) {
        return field;
      }

      if (field.children && field.children.length > 0) {
        const found = search(field.children, pathSegments);

        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  return search(fields, segments);
}

/**
 * Obtém todos os caminhos filho de um caminho específico
 */
export function getChildPaths(fields: DefaultValueField[], parentPath: FieldPath): FieldPath[] {
  // Primeiro encontra o campo pai
  const parentField = findFieldByPath(fields, parentPath);

  if (!parentField) {
    return [];
  }

  // Coleta todos os caminhos filhos
  const collectPaths = (field: DefaultValueField): FieldPath[] => {
    const paths: FieldPath[] = [];

    if (!field.children || field.children.length === 0) {
      return paths;
    }

    field.children.forEach((child: DefaultValueField) => {
      const childPath = child.path.join('.');

      paths.push(childPath);

      if (child.children && child.children.length > 0) {
        paths.push(...collectPaths(child));
      }
    });

    return paths;
  };

  return collectPaths(parentField);
}

/**
 * Obtém todos os caminhos expansíveis (objetos com filhos)
 */
export function getAllExpandablePaths(fields: DefaultValueField[]): FieldPath[] {
  const paths: FieldPath[] = [];

  const collectPaths = (fieldsToProcess: DefaultValueField[]) => {
    fieldsToProcess.forEach((field) => {
      if (field.type === 'object' && field.children && field.children.length > 0) {
        // Adiciona este objeto ao caminho expansível
        paths.push(field.path.join('.'));

        // Processa os filhos recursivamente
        collectPaths(field.children);

        // Log para debugging removido para evitar loops
        // console.warn(
        //   `[getAllExpandablePaths] Adicionando caminho expansível: ${field.path.join('.')}`
        // );
      }
    });
  };

  collectPaths(fields);
  // console.warn(
  //   `[getAllExpandablePaths] Total de caminhos expansíveis encontrados: ${paths.length}`
  // );

  return paths;
}

/**
 * Encontra campos customizados na estrutura atual
 */
export function findCustomizedFields(fields: DefaultValueField[]): DefaultValueField[] {
  const customized: DefaultValueField[] = [];

  const process = (fieldsToProcess: DefaultValueField[]) => {
    fieldsToProcess.forEach((field) => {
      if (field.source === ValueSourceType.BLUEPRINT) {
        customized.push(field);
      }

      if (field.children && field.children.length > 0) {
        process(field.children);
      }
    });
  };

  process(fields);

  return customized;
}

/**
 * Encontra campos que correspondem ao termo de busca
 */
export function findMatchingFields(fields: DefaultValueField[], term: string): FieldPath[] {
  if (!term) {
    return [];
  }

  const matchingPaths: FieldPath[] = [];
  const lowerSearchTerm = term.toLowerCase();

  const searchInFields = (fieldsToSearch: DefaultValueField[]) => {
    fieldsToSearch.forEach((field) => {
      const fieldPath = field.path.join('.');

      const keyMatch = field.key.toLowerCase().includes(lowerSearchTerm);
      const displayNameMatch = field.displayName
        ? field.displayName.toLowerCase().includes(lowerSearchTerm)
        : false;
      const pathMatch = fieldPath.toLowerCase().includes(lowerSearchTerm);

      if (keyMatch || displayNameMatch || pathMatch) {
        matchingPaths.push(fieldPath);
        // console.warn(`[findMatchingFields] Campo correspondente encontrado: ${fieldPath}`);
      }

      // Sempre pesquisa em campos filhos para garantir que todos os campos correspondentes sejam encontrados
      if (field.children && field.children.length > 0) {
        searchInFields(field.children);
      }
    });
  };

  searchInFields(fields);

  // console.warn(
  //   `[findMatchingFields] Total de campos correspondentes encontrados: ${matchingPaths.length}`
  // );

  return matchingPaths;
}

/**
 * Verifica o estado de exposição dos filhos para atualizar o estado do pai
 * Se todos os filhos estiverem expostos (ou não expostos), o pai deve refletir esse estado
 */
export function syncParentExposedState(
  fields: DefaultValueField[],
  parentPath: FieldPath
): boolean | null {
  // Encontra o campo pai
  const parentField = findFieldByPath(fields, parentPath);

  if (!parentField || !parentField.children || parentField.children.length === 0) {
    return null;
  }

  // Conta quantos filhos estão expostos
  let exposedCount = 0;

  parentField.children.forEach((child) => {
    if (child.exposed) {
      exposedCount++;
    }
  });

  // Se todos estão expostos, o pai deve estar exposto
  // Se nenhum está exposto, o pai não deve estar exposto
  // Se alguns estão expostos, retorna null (estado indeterminado)
  if (exposedCount === parentField.children.length) {
    return true;
  } else if (exposedCount === 0) {
    return false;
  } else {
    return null; // Estado parcial - alguns filhos estão expostos
  }
}

/**
 * Verifica o estado de override dos filhos para atualizar o estado do pai
 * Se todos os filhos estiverem override (ou não override), o pai deve refletir esse estado
 */
export function syncParentOverrideState(
  fields: DefaultValueField[],
  parentPath: FieldPath
): boolean | null {
  // Encontra o campo pai
  const parentField = findFieldByPath(fields, parentPath);

  if (!parentField || !parentField.children || parentField.children.length === 0) {
    return null;
  }

  // Conta quantos filhos são overridable
  let overridableCount = 0;

  parentField.children.forEach((child) => {
    if (child.overridable) {
      overridableCount++;
    }
  });

  // Se todos são overridable, o pai deve ser overridable
  // Se nenhum é overridable, o pai não deve ser overridable
  // Se alguns são overridable, retorna null (estado indeterminado)
  if (overridableCount === parentField.children.length) {
    return true;
  } else if (overridableCount === 0) {
    return false;
  } else {
    return null; // Estado parcial - alguns filhos são overridable
  }
}
