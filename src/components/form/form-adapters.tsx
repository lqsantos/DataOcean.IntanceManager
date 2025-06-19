'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * Adaptador para o componente Input
 * Permite que o Input seja usado com o FormBuilder
 */
export const InputAdapter = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  placeholder,
  type = 'text',
  ...props
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  [key: string]: any;
}) => {
  return (
    <Input
      id={id}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      className={error ? 'border-destructive' : ''}
      data-testid={`input-${name}`}
      {...props}
    />
  );
};

/**
 * Adaptador para o componente Textarea
 * Permite que o Textarea seja usado com o FormBuilder
 */
export const TextareaAdapter = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  placeholder,
  rows = 4,
  ...props
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  [key: string]: any;
}) => {
  return (
    <Textarea
      id={id}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={error ? 'border-destructive' : ''}
      data-testid={`textarea-${name}`}
      rows={rows}
      {...props}
    />
  );
};
