/**
 * Custom hook for managing field expansion in the table view
 */

import { useCallback, useEffect } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

/**
 * Hook para gerenciar a expansão de nós na tabela de valores
 *
 * Este hook mantém o estado de quais nós estão expandidos na tabela de visualização,
 * e fornece utilidades para expandir e colapsar nós. Foi refatorado para solucionar
 * o bug onde nós customizados não podiam ser colapsados até um reset.
 */
export function useFieldExpansion(
  fields: DefaultValueField[],
  expandedPaths: Set<string>,
  setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>,
  searchTerm?: string
) {
  // Toggle function for field expansion - SOLUÇÃO DEFINITIVA!
  const toggleFieldExpansion = useCallback(
    (path: string) => {
      if (!path) {
        return;
      }

      // Verifica-se se o caminho existe nos campos atuais (crucial para filtros)
      const pathExists = (searchFields: DefaultValueField[], searchPath: string): boolean => {
        for (const field of searchFields) {
          if (field.path.join('.') === searchPath) {
            return true;
          }

          if (field.children?.length) {
            if (pathExists(field.children, searchPath)) {
              return true;
            }
          }
        }

        return false;
      };

      // Só prossegue se o caminho existir nos campos atuais ou se estiver expandindo
      const exists = pathExists(fields, path);

      if (!exists) {
        console.warn(`[useFieldExpansion] Caminho não existe nos campos atuais: ${path}`);
        // Não faz nada se tentar colapsar um caminho que não existe mais

        return;
      }

      console.warn(`[useFieldExpansion] Toggling path: ${path} (existe nos campos atuais)`);

      setExpandedPaths((prev) => {
        // IMPORTANTE: sempre criar novo Set para garantir nova referência
        const isExpanded = prev.has(path);

        if (isExpanded) {
          // Se já está expandido, vamos remover (colapsar)
          console.warn(`[useFieldExpansion] Colapsando: ${path}`);

          // Criar novo Set sem o caminho e seus filhos
          const newPaths = new Set<string>();

          // Copia apenas os caminhos que não são o atual e nem filhos dele
          const pathPrefix = `${path}.`;

          prev.forEach((p) => {
            if (p !== path && !p.startsWith(pathPrefix)) {
              newPaths.add(p);
            }
          });

          return newPaths;
        } else {
          // Se não está expandido, vamos adicionar (expandir)
          console.warn(`[useFieldExpansion] Expandindo: ${path}`);

          // Criar novo Set com o caminho adicionado
          const newPaths = new Set(prev);

          newPaths.add(path);

          return newPaths;
        }
      });
    },
    [fields, setExpandedPaths]
  );

  // Function to expand all object fields at all levels
  const expandAllFields = useCallback(() => {
    const allExpandablePaths = new Set<string>();

    // Helper function to recursively collect all expandable paths
    const collectExpandablePaths = (fieldsToExpand: DefaultValueField[]) => {
      fieldsToExpand.forEach((field) => {
        if (field.type === 'object' && field.children && field.children.length > 0) {
          // Add this object field's path
          allExpandablePaths.add(field.path.join('.'));
          // Recursively process its children
          collectExpandablePaths(field.children);
        }
      });
    };

    // Start collecting from root fields
    collectExpandablePaths(fields || []);

    // Update the expanded paths state with all expandable paths
    setExpandedPaths(allExpandablePaths);
  }, [fields, setExpandedPaths]);

  // Function to collapse all fields (clear all expanded paths)
  const collapseAllFields = useCallback(() => {
    setExpandedPaths(new Set());
  }, [setExpandedPaths]);

  // Function to expand all parent paths of a given field path
  const expandParentPaths = useCallback(
    (fieldPath: string) => {
      if (!fieldPath) {
        return;
      }

      const segments = fieldPath.split('.');

      // Create all parent paths (all paths except the full path itself)
      const parentPaths: string[] = [];

      for (let i = 1; i < segments.length; i++) {
        parentPaths.push(segments.slice(0, i).join('.'));
      }

      // Add all parent paths to the expanded set
      setExpandedPaths((prev) => {
        const newPaths = new Set(prev);

        // Add all parent paths
        parentPaths.forEach((path) => newPaths.add(path));

        return newPaths;
      });
    },
    [setExpandedPaths]
  );

  // Effect to automatically expand parent fields when search text changes
  useEffect(() => {
    // If search is cleared, reset expanded paths
    if (!searchTerm) {
      return;
    }

    console.warn('[useFieldExpansion] Search term changed:', searchTerm);

    // Array to collect all paths of fields that match the search
    const matchingPaths: string[] = [];

    // Helper function to recursively search through all fields and their children
    const findMatchingFields = (fieldsToSearch: DefaultValueField[]) => {
      fieldsToSearch.forEach((field) => {
        const fieldPath = field.path.join('.');
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Check if this field matches the search in any way
        const keyMatch = field.key.toLowerCase().includes(lowerSearchTerm);
        const displayNameMatch = field.displayName
          ? field.displayName.toLowerCase().includes(lowerSearchTerm)
          : false;
        const pathMatch = fieldPath.toLowerCase().includes(lowerSearchTerm);

        if (keyMatch || displayNameMatch || pathMatch) {
          matchingPaths.push(fieldPath);
        }

        // Recursively check children
        if (field.children && field.children.length > 0) {
          findMatchingFields(field.children);
        }
      });
    };

    // Start recursive search from the root fields
    if (fields) {
      findMatchingFields(fields);
    }

    // Expand parent paths for all matching fields
    matchingPaths.forEach(expandParentPaths);
  }, [searchTerm, fields, expandParentPaths]);

  // Effect to preserve expanded state and ensure customized fields are expanded
  useEffect(() => {
    // Procura por campos customizados na estrutura
    const customizedFields: DefaultValueField[] = [];

    // Função recursiva para encontrar todos os campos customizados
    const findCustomizedFields = (fieldsToSearch: DefaultValueField[]) => {
      fieldsToSearch.forEach((field) => {
        if (field.source === ValueSourceType.BLUEPRINT) {
          customizedFields.push(field);
        }

        // Recursivamente procura nos filhos
        if (field.children && field.children.length > 0) {
          findCustomizedFields(field.children);
        }
      });
    };

    // Inicia a busca a partir dos campos raiz
    if (fields) {
      findCustomizedFields(fields);
    }

    // Se encontrarmos campos customizados, garantimos que seus pais estejam expandidos
    if (customizedFields.length > 0) {
      // Mantém um registro de quais campos adicionamos para expansão
      const pathsToExpand = new Set<string>();

      // Para cada campo customizado, expandimos seus campos pai
      customizedFields.forEach((field) => {
        // Obtém o caminho do campo customizado
        const fullPath = field.path.join('.');
        const segments = field.path;

        // Se o campo for um objeto aninhado, também garantimos que ele esteja expandido
        if (field.type === 'object' && !expandedPaths.has(fullPath)) {
          pathsToExpand.add(fullPath);
        }

        // Expandimos todos os pais deste campo (exceto o próprio campo)
        for (let i = 1; i < segments.length; i++) {
          const parentPath = segments.slice(0, i).join('.');

          if (!expandedPaths.has(parentPath)) {
            pathsToExpand.add(parentPath);
          }
        }
      });

      // Se temos novos caminhos para expandir, atualizamos o estado
      if (pathsToExpand.size > 0) {
        setExpandedPaths((prev) => {
          const newPaths = new Set(prev);

          pathsToExpand.forEach((path) => newPaths.add(path));

          return newPaths;
        });
      }
    }
  }, [fields, expandedPaths, setExpandedPaths]);

  // Effect to handle field existence validation
  useEffect(() => {
    // If no expanded paths, do nothing
    if (expandedPaths.size === 0) {
      return;
    }

    // Create a reference structure for current fields
    const pathsMap = new Map<string, DefaultValueField>();

    // Recursive function to map all fields by their path
    const mapFieldsByPath = (fieldsToMap: DefaultValueField[]) => {
      fieldsToMap.forEach((field) => {
        const fullPath = field.path.join('.');

        pathsMap.set(fullPath, field);

        // Recursively map children
        if (field.children && field.children.length > 0) {
          mapFieldsByPath(field.children);
        }
      });
    };

    // Start mapping from root fields
    if (fields) {
      mapFieldsByPath(fields);
    }

    // Preserve expanded fields, but remove those that no longer exist
    setExpandedPaths((prev) => {
      const validPaths = new Set<string>();

      // Check each expanded path and keep only those that still exist
      [...prev].forEach((path) => {
        if (pathsMap.has(path)) {
          validPaths.add(path);
        }
      });

      // If the number of valid paths equals the original number, no changes
      if (validPaths.size === prev.size) {
        return prev;
      }

      // Otherwise, return the updated set of expanded paths
      return validPaths;
    });
  }, [fields, expandedPaths, setExpandedPaths]);

  return {
    toggleFieldExpansion,
    expandAllFields,
    collapseAllFields,
    expandParentPaths,
  };
}
