/**
 * Contexto React para gerenciamento de campos hierárquicos
 */

import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import type { DefaultValueField } from '../types';

import { fieldsReducer, initialState } from './fieldsReducer';
import { findFieldByPath, getChildPaths } from './fieldsUtils';
import type { FieldPath, FieldsContextType, FieldsProviderProps } from './types';

// Criação do Context com tipo definido
const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

/**
 * Provider para o Context de campos
 */
export function FieldsProvider({
  children,
  initialFields = [],
  initialSearchTerm = '',
  onExpandedPathsChange,
  initialExpandedPaths,
}: FieldsProviderProps) {
  // Estado inicial com os caminhos expandidos iniciais, se fornecidos
  const [state, dispatch] = useReducer(fieldsReducer, {
    ...initialState,
    currentFields: initialFields,
    searchTerm: initialSearchTerm,
    expandedPaths: initialExpandedPaths || new Set<FieldPath>(),
  });

  // Notifica sobre mudanças nos caminhos expandidos
  useEffect(() => {
    if (onExpandedPathsChange) {
      onExpandedPathsChange(state.expandedPaths);
    }
  }, [state.expandedPaths, onExpandedPathsChange]);

  // Actions dispatcher
  const toggleFieldExpansion = useCallback((path: FieldPath) => {
    dispatch({ type: 'TOGGLE_EXPANSION', path });
  }, []);

  const expandAllFields = useCallback(() => {
    dispatch({ type: 'EXPAND_ALL' });
  }, []);

  const collapseAllFields = useCallback(() => {
    dispatch({ type: 'COLLAPSE_ALL' });
  }, []);

  const expandParentPaths = useCallback((childPath: FieldPath) => {
    dispatch({ type: 'EXPAND_PARENT_PATHS', childPath });
  }, []);

  const expandPaths = useCallback((paths: FieldPath[]) => {
    dispatch({ type: 'EXPAND_PATHS', paths });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', term });
  }, []);

  const updateFields = useCallback((fields: DefaultValueField[]) => {
    dispatch({ type: 'UPDATE_FIELDS', fields });
  }, []);

  // Helpers
  const isExpanded = useCallback(
    (path: FieldPath) => state.expandedPaths.has(path),
    [state.expandedPaths]
  );

  const getChildrenPaths = useCallback(
    (parentPath: FieldPath) => getChildPaths(state.currentFields, parentPath),
    [state.currentFields]
  );

  // Função auxiliar para encontrar um campo pelo caminho
  const findField = useCallback(
    (path: FieldPath): DefaultValueField | null => {
      if (!path) {
        return null;
      }

      return findFieldByPath(state.currentFields, path);
    },
    [state.currentFields]
  );

  /**
   * Propaga a alteração de "exposed" para todos os filhos
   * Agora propaga tanto ao habilitar quanto ao desabilitar
   */
  const propagateExpose = useCallback(
    (field: DefaultValueField, _exposed: boolean): FieldPath[] => {
      const fieldPath = field.path.join('.');

      // Propaga para todos os filhos independente do valor (true ou false)
      return getChildrenPaths(fieldPath);
    },
    [getChildrenPaths]
  );

  /**
   * Propaga a alteração de "overridable" para todos os filhos
   * Agora propaga tanto ao habilitar quanto ao desabilitar
   */
  const propagateOverride = useCallback(
    (field: DefaultValueField, _overridable: boolean): FieldPath[] => {
      const fieldPath = field.path.join('.');

      // Propaga para todos os filhos independente do valor (true ou false)
      return getChildrenPaths(fieldPath);
    },
    [getChildrenPaths]
  );

  const value = {
    state,
    toggleFieldExpansion,
    expandAllFields,
    collapseAllFields,
    expandParentPaths,
    expandPaths,
    setSearchTerm,
    updateFields,
    isExpanded,
    getChildrenPaths,
    propagateExpose,
    propagateOverride,
    findField,
  };

  return <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>;
}

/**
 * Hook personalizado para usar o Context
 */
export function useFields(): FieldsContextType {
  const context = useContext(FieldsContext);

  if (context === undefined) {
    throw new Error('useFields must be used within a FieldsProvider');
  }

  return context;
}

/**
 * Hook para verificar se o contexto está disponível
 * Útil para componentes que podem funcionar tanto com o novo contexto quanto sem ele
 */
export function useFieldsContextAvailable(): boolean {
  const context = useContext(FieldsContext);

  return context !== undefined;
}

// Re-exporta tipos importantes para facilitar o uso
export type { FieldPath, FieldsContextType, FieldsProviderProps } from './types';
