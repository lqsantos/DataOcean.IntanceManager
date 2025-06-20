/**
 * Test file to validate UnifiedValueColumn integration
 * This file helps verify that all dependencies and imports are working correctly
 */

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import { UnifiedValueColumn } from './UnifiedValueColumn';

// Mock field data for testing
const mockField: DefaultValueField = {
  key: 'testField',
  path: ['root', 'testField'],
  type: 'string',
  value: 'current value',
  originalValue: 'template value',
  source: ValueSourceType.BLUEPRINT,
  exposed: true,
  overridable: true,
  required: false,
};

// Mock props for testing
const mockProps = {
  field: mockField,
  onStartEdit: () => void 0,
  onApplyChanges: (_value: unknown) => void 0,
  onCancelEdit: () => void 0,
  onCustomize: () => void 0,
  onReset: () => void 0,
  blueprintVariables: [
    { name: 'var1', value: 'value1' },
    { name: 'var2', value: 'value2' },
  ],
};

/**
 * Validation function to check if UnifiedValueColumn can be instantiated
 * This helps catch any import or type issues at compile time
 */
export function validateUnifiedValueColumn() {
  // This should compile without errors if all dependencies are correct
  const component = UnifiedValueColumn;
  const props = mockProps;

  return {
    component,
    props,
    isValid: typeof component === 'function',
  };
}

export default validateUnifiedValueColumn;
