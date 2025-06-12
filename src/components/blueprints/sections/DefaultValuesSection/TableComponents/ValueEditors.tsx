/**
 * ValueEditors component
 * Collection of editor components for different data types in the table view
 */

import React from 'react';

// Props interface for all editors
export interface ValueEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  variables?: Array<{ name: string; value: string }>;
}

export const StringEditor: React.FC<ValueEditorProps<string>> = ({
  value,
  onChange,
  disabled,
  variables: _, // Não usado atualmente
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full rounded border p-1"
  />
);

export const NumberEditor: React.FC<ValueEditorProps<number>> = ({ value, onChange, disabled }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    disabled={disabled}
    className="w-full rounded border p-1"
  />
);

export const BooleanEditor: React.FC<ValueEditorProps<boolean>> = ({
  value,
  onChange,
  disabled,
}) => (
  <select
    value={value ? 'true' : 'false'}
    onChange={(e) => onChange(e.target.value === 'true')}
    disabled={disabled}
    className="w-full rounded border p-1"
  >
    <option value="true">true</option>
    <option value="false">false</option>
  </select>
);

export const ObjectEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div className="flex w-full items-center justify-between">
    <span className={`text-sm ${disabled ? 'text-muted-foreground' : 'font-medium text-blue-600'}`}>
      Complex Object
    </span>
    <span className={`text-xs italic ${disabled ? 'text-muted-foreground' : 'text-blue-600'}`}>
      {disabled ? '(uses template values)' : '(click ▶ to expand)'}
    </span>
  </div>
);

export const ArrayEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div className="flex items-center">
    <span
      className={`text-sm ${disabled ? 'text-muted-foreground' : 'font-medium text-amber-600'}`}
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
