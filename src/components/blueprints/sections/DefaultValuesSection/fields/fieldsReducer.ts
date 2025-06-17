/**
 * Reducer e funções para manipulação do estado de campos hierárquicos
 */

import {
  findCustomizedFields,
  findMatchingFields,
  getAllExpandablePaths,
  getParentPaths,
  isPathValid,
} from './fieldsUtils';
import type { FieldPath, FieldsAction, FieldsState } from './types';

// Estado inicial padrão
export const initialState: FieldsState = {
  expandedPaths: new Set<FieldPath>(),
  currentFields: [],
  searchTerm: '',
};

/**
 * Reducer para gerenciar o estado de expansão e ações relacionadas
 */
export function fieldsReducer(state: FieldsState, action: FieldsAction): FieldsState {
  switch (action.type) {
    case 'TOGGLE_EXPANSION': {
      const { path } = action;

      // Verifica se o caminho existe
      if (!isPathValid(state.currentFields, path)) {
        console.warn(`[FieldsContext] Path does not exist: ${path}`);

        return state;
      }

      const newExpandedPaths = new Set(state.expandedPaths);

      if (newExpandedPaths.has(path)) {
        // COLAPSO: Remove o caminho e todos os seus filhos
        newExpandedPaths.delete(path);

        // Remove caminhos filhos
        const pathPrefix = `${path}.`;

        state.expandedPaths.forEach((p) => {
          if (p.startsWith(pathPrefix)) {
            newExpandedPaths.delete(p);
          }
        });
      } else {
        // EXPANSÃO: Adiciona o caminho
        newExpandedPaths.add(path);
      }

      return {
        ...state,
        expandedPaths: newExpandedPaths,
      };
    }

    case 'EXPAND_ALL': {
      const allPaths = getAllExpandablePaths(state.currentFields);

      // É importante criar uma nova referência do Set para que o React detecte a mudança
      const newExpandedPaths = new Set(allPaths);

      // console.warn(`[fieldsReducer] EXPAND_ALL: Expandindo ${allPaths.length} caminhos`);

      return {
        ...state,
        expandedPaths: newExpandedPaths,
      };
    }

    case 'COLLAPSE_ALL': {
      // console.warn('[fieldsReducer] COLLAPSE_ALL: Recolhendo todos os caminhos');

      return {
        ...state,
        // É importante criar uma nova referência do Set para que o React detecte a mudança
        expandedPaths: new Set(),
      };
    }

    case 'EXPAND_PARENT_PATHS': {
      const { childPath } = action;

      if (!childPath) {
        return state;
      }

      const parentPaths = getParentPaths(childPath).filter((path) =>
        isPathValid(state.currentFields, path)
      );

      if (parentPaths.length === 0) {
        return state;
      }

      const newExpandedPaths = new Set(state.expandedPaths);

      parentPaths.forEach((path) => {
        newExpandedPaths.add(path);
      });

      return {
        ...state,
        expandedPaths: newExpandedPaths,
      };
    }

    case 'EXPAND_PATHS': {
      const { paths } = action;

      if (paths.length === 0) {
        return state;
      }

      const validPaths = paths.filter((path) => isPathValid(state.currentFields, path));

      if (validPaths.length === 0) {
        return state;
      }

      const newExpandedPaths = new Set(state.expandedPaths);

      validPaths.forEach((path) => {
        newExpandedPaths.add(path);
      });

      return {
        ...state,
        expandedPaths: newExpandedPaths,
      };
    }

    case 'VALIDATE_EXPANDED_PATHS': {
      // Remove caminhos que não são mais válidos
      const validPaths = new Set<FieldPath>();

      state.expandedPaths.forEach((path) => {
        if (isPathValid(state.currentFields, path)) {
          validPaths.add(path);
        }
      });

      return {
        ...state,
        expandedPaths: validPaths,
      };
    }

    case 'SET_SEARCH_TERM': {
      // Quando um termo de busca é definido, expandimos os pais dos campos correspondentes
      if (action.term) {
        const matchingPaths = findMatchingFields(state.currentFields, action.term);

        if (matchingPaths.length > 0) {
          const parentPathsToExpand = new Set<FieldPath>();

          matchingPaths.forEach((path) => {
            getParentPaths(path)
              .filter((p) => isPathValid(state.currentFields, p))
              .forEach((p) => parentPathsToExpand.add(p));
          });

          return {
            ...state,
            searchTerm: action.term,
            expandedPaths: new Set([...state.expandedPaths, ...parentPathsToExpand]),
          };
        }
      }

      return {
        ...state,
        searchTerm: action.term,
      };
    }

    case 'UPDATE_FIELDS': {
      // Quando os campos mudam, atualizamos a referência e validamos os caminhos
      const { fields } = action;
      const validPaths = new Set<FieldPath>();

      // Mantém apenas os caminhos que ainda existem
      state.expandedPaths.forEach((path) => {
        if (isPathValid(fields, path)) {
          validPaths.add(path);
        }
      });

      // Garante que pais de campos customizados estejam expandidos
      const customized = findCustomizedFields(fields);
      const customizedParentPaths = new Set<FieldPath>();

      customized.forEach((field) => {
        if (field.path.length > 1) {
          const parentPath = field.path.slice(0, field.path.length - 1).join('.');

          if (parentPath && isPathValid(fields, parentPath)) {
            customizedParentPaths.add(parentPath);
          }
        }
      });

      // Se há um termo de busca, expande os pais dos campos correspondentes
      const searchMatchPaths = state.searchTerm ? findMatchingFields(fields, state.searchTerm) : [];

      const searchParentPaths = new Set<FieldPath>();

      searchMatchPaths.forEach((path) => {
        getParentPaths(path)
          .filter((p) => isPathValid(fields, p))
          .forEach((p) => searchParentPaths.add(p));
      });

      return {
        ...state,
        currentFields: fields,
        expandedPaths: new Set([...validPaths, ...customizedParentPaths, ...searchParentPaths]),
      };
    }

    default:
      return state;
  }
}
