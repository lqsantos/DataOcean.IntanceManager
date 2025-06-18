/**
 * Definições de tipos para o gerenciamento de campos hierárquicos
 */

import type { DefaultValueField } from '../types';

// Alias de tipo para representar caminhos de campos no formato 'parent.child'
export type FieldPath = string;

/**
 * Estado para o gerenciador de campos
 */
export interface FieldsState {
  // Conjunto de caminhos expandidos
  expandedPaths: Set<FieldPath>;

  // Referência para os campos atuais (importante para consistência em filtragens)
  currentFields: DefaultValueField[];

  // Termo de busca atual
  searchTerm: string;
}

/**
 * Tipos de ação para o gerenciamento de estado
 */
export type FieldsAction =
  | { type: 'TOGGLE_EXPANSION'; path: FieldPath }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'EXPAND_PARENT_PATHS'; childPath: FieldPath }
  | { type: 'EXPAND_PATHS'; paths: FieldPath[] }
  | { type: 'VALIDATE_EXPANDED_PATHS' }
  | { type: 'SET_SEARCH_TERM'; term: string }
  | { type: 'UPDATE_FIELDS'; fields: DefaultValueField[] };

/**
 * Interface do contexto que será exposta para os componentes
 */
export interface FieldsContextType {
  // Estado atual
  state: FieldsState;

  // Funções de gerenciamento de expansão
  toggleFieldExpansion: (path: FieldPath) => void;
  expandAllFields: () => void;
  collapseAllFields: () => void;
  expandParentPaths: (childPath: FieldPath) => void;
  expandPaths: (paths: FieldPath[]) => void;

  // Pesquisa e atualização de estado
  setSearchTerm: (term: string) => void;
  updateFields: (fields: DefaultValueField[]) => void;

  // Helpers
  isExpanded: (path: FieldPath) => boolean;
  getChildrenPaths: (parentPath: FieldPath) => FieldPath[];

  // Funções para propagar toggles
  propagateExpose: (field: DefaultValueField, exposed: boolean) => FieldPath[];
  propagateOverride: (field: DefaultValueField, overridable: boolean) => FieldPath[];
  findField: (path: FieldPath) => DefaultValueField | null;
}

/**
 * Props para o FieldsProvider
 */
export interface FieldsProviderProps {
  children: React.ReactNode;
  initialFields?: DefaultValueField[];
  initialSearchTerm?: string;
  onExpandedPathsChange?: (paths: Set<FieldPath>) => void;
  initialExpandedPaths?: Set<FieldPath>;
}
