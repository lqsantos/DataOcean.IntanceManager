/**
 * Barril de exportações para o módulo de gerenciamento de campos
 */

// Context e hooks
export { FieldsProvider, useFields, useFieldsContextAvailable } from './FieldsContext';

// Tipos
export type {
  FieldPath,
  FieldsAction,
  FieldsContextType,
  FieldsProviderProps,
  FieldsState,
} from './types';

// Utilities
export {
  findCustomizedFields,
  findFieldByPath,
  findMatchingFields,
  getAllExpandablePaths,
  getChildPaths,
  getParentPaths,
  isPathValid,
} from './fieldsUtils';

// Reducer
export { fieldsReducer, initialState } from './fieldsReducer';
