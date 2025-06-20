/**
 * BaseFieldInput component
 * Centralizes common characteristics for all non-object field inputs
 *
 * This component abstracts:
 * - Visual styling (width, borders, focus states)
 * - Keyboard handling (Enter/Escape)
 * - Common props (disabled, autoFocus, validation states)
 * - Consistent sizing system
 *
 * Buttons remain in their respective containers (UnifiedValueColumn + EditableValueContainer)
 */

import React from 'react';

import { cn } from '@/lib/utils';

import { FIELD_INPUT_CONFIG } from './constants';

// Base props that all field inputs share
export interface BaseFieldInputProps {
  disabled?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
  onEscape?: () => void;
  isValidating?: boolean;
  'data-testid'?: string;
  className?: string; // Allow additional classes
}

// Props for input-based editors (string, number)
export interface InputFieldProps extends BaseFieldInputProps {
  type: 'text' | 'number';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Props for select-based editors (boolean)
export interface SelectFieldProps extends BaseFieldInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

/**
 * Centralized width configuration for optimal space utilization
 * Uses full available width to grow until buttons area
 */
const INPUT_WIDTH_CLASSES = {
  string: 'w-full', // Uses full available width
  number: 'w-full', // Uses full available width
  boolean: 'w-full', // Uses full available width
} as const;

/**
 * Base styling that applies to all field inputs with proper overflow control
 */
const BASE_INPUT_CLASSES = `rounded border p-1 ${FIELD_INPUT_CONFIG.fontSize} ${FIELD_INPUT_CONFIG.height} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 overflow-hidden whitespace-nowrap`;

/**
 * Get complete styling for a specific field type
 */
const getFieldClasses = (fieldType: keyof typeof INPUT_WIDTH_CLASSES, className?: string) => {
  return cn(BASE_INPUT_CLASSES, INPUT_WIDTH_CLASSES[fieldType], className);
};

/**
 * Common keyboard event handler
 */
const useKeyboardHandler = (onEnter?: () => void, onEscape?: () => void) => {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };
};

/**
 * Base input component for text and number fields
 */
export const BaseInput: React.FC<
  InputFieldProps & { fieldType: keyof typeof INPUT_WIDTH_CLASSES }
> = ({
  type,
  value,
  onChange,
  disabled,
  autoFocus = false,
  onEnter,
  onEscape,
  isValidating = false,
  placeholder,
  min,
  max,
  step,
  fieldType,
  className,
  'data-testid': dataTestId,
}) => {
  const handleKeyDown = useKeyboardHandler(onEnter, onEscape);

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled || isValidating}
      autoFocus={autoFocus}
      placeholder={isValidating ? 'Validating...' : placeholder}
      min={min}
      max={max}
      step={step}
      data-testid={dataTestId}
      className={getFieldClasses(fieldType, className)}
    />
  );
};

/**
 * Base select component for boolean and enum fields
 */
export const BaseSelect: React.FC<
  SelectFieldProps & { fieldType: keyof typeof INPUT_WIDTH_CLASSES }
> = ({
  value,
  onChange,
  disabled,
  autoFocus = false,
  onEnter,
  onEscape,
  isValidating = false,
  children,
  fieldType,
  className,
  'data-testid': dataTestId,
}) => {
  const handleKeyDown = useKeyboardHandler(onEnter, onEscape);

  return (
    <select
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled || isValidating}
      autoFocus={autoFocus}
      data-testid={dataTestId}
      className={getFieldClasses(fieldType, className)}
    >
      {children}
    </select>
  );
};

/**
 * Utility to get width classes for display containers (non-inputs)
 */
export const getDisplayWidthClasses = () => INPUT_WIDTH_CLASSES.string;
