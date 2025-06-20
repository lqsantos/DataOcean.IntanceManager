/**
 * ValueEditors component
 * Collection of editor components for different data types in the table view
 * Enhanced with Apply/Cancel functionality and keyboard shortcuts
 */

import React from 'react';

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled || isValidating}
      autoFocus={autoFocus}
      data-testid={dataTestId}
      className="w-full rounded border p-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onKeyDown={handleKeyDown}
      disabled={disabled || isValidating}
      autoFocus={autoFocus}
      data-testid={dataTestId}
      className="w-full rounded border p-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };

  return (
    <select
      value={value ? 'true' : 'false'}
      onChange={(e) => onChange(e.target.value === 'true')}
      onKeyDown={handleKeyDown}
      disabled={disabled || isValidating}
      autoFocus={autoFocus}
      data-testid={dataTestId}
      className="w-full rounded border p-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="true">true</option>
      <option value="false">false</option>
    </select>
  );
};

export const ObjectEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div className="flex w-full items-center justify-between">
    <span className={`text-sm ${disabled ? 'text-muted-foreground' : 'font-medium text-blue-600'}`}>
      Complex Object
    </span>
    {!disabled && <span className="text-xs italic text-blue-600">(click ▶ to expand)</span>}
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
