/**
 * ValueEditors component
 * Collection of editor components for different data types in the table view
 * Enhanced with Apply/Cancel functionality and keyboard shortcuts
 *
 * Now uses BaseFieldInput for centralized common characteristics
 */

import React from 'react';

import { BaseInput, BaseSelect } from './BaseFieldInput';
import { FIELD_INPUT_CONFIG } from './constants';

// Props interface for all editors
export interface ValueEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  variables?: Array<{ name: string; value: string }>;
  // New props for Apply/Cancel functionality
  autoFocus?: boolean;
  onEnter?: () => void;
  onEscape?: () => void;
  isValidating?: boolean;
  'data-testid'?: string;
}

export const StringEditor: React.FC<ValueEditorProps<string>> = ({
  value,
  onChange,
  disabled,
  variables: _, // Não usado atualmente
  autoFocus = false,
  onEnter,
  onEscape,
  isValidating = false,
  'data-testid': dataTestId,
}) => {
  return (
    <BaseInput
      type="text"
      fieldType="string"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      autoFocus={autoFocus}
      onEnter={onEnter}
      onEscape={onEscape}
      isValidating={isValidating}
      data-testid={dataTestId}
      placeholder={isValidating ? 'Validating...' : undefined}
    />
  );
};

export const NumberEditor: React.FC<ValueEditorProps<number>> = ({
  value,
  onChange,
  disabled,
  autoFocus = false,
  onEnter,
  onEscape,
  isValidating = false,
  'data-testid': dataTestId,
}) => {
  return (
    <BaseInput
      type="number"
      fieldType="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      autoFocus={autoFocus}
      onEnter={onEnter}
      onEscape={onEscape}
      isValidating={isValidating}
      data-testid={dataTestId}
      placeholder={isValidating ? 'Validating...' : undefined}
    />
  );
};

export const BooleanEditor: React.FC<ValueEditorProps<boolean>> = ({
  value,
  onChange,
  disabled,
  autoFocus = false,
  onEnter,
  onEscape,
  isValidating = false,
  'data-testid': dataTestId,
}) => {
  return (
    <BaseSelect
      fieldType="boolean"
      value={value ? 'true' : 'false'}
      onChange={(e) => onChange(e.target.value === 'true')}
      disabled={disabled}
      autoFocus={autoFocus}
      onEnter={onEnter}
      onEscape={onEscape}
      isValidating={isValidating}
      data-testid={dataTestId}
    >
      <option value="true">true</option>
      <option value="false">false</option>
    </BaseSelect>
  );
};

export const ObjectEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div className={`${FIELD_INPUT_CONFIG.width} flex items-center justify-between`}>
    <span
      className={`${FIELD_INPUT_CONFIG.fontSize} ${disabled ? 'text-muted-foreground' : 'font-medium text-blue-600'}`}
    >
      Complex Object
    </span>
    {!disabled && <span className="text-xs italic text-blue-600">(click ▶ to expand)</span>}
  </div>
);

export const ArrayEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div className={`${FIELD_INPUT_CONFIG.width} flex items-center`}>
    <span
      className={`${FIELD_INPUT_CONFIG.fontSize} ${disabled ? 'text-muted-foreground' : 'font-medium text-amber-600'}`}
    >
      Array
    </span>
    {!disabled && (
      <span className="ml-2 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
        YAML view only
      </span>
    )}
  </div>
);
