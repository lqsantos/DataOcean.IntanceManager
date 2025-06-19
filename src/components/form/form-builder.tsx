'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import type { FormErrors } from '@/hooks/use-form-state';
import { useFormState } from '@/hooks/use-form-state';

/**
 * Interface para campo de formulário
 */
export interface FormField<T extends Record<string, any>> {
  name: keyof T;
  label: string;
  component: React.FC<{
    id: string;
    name: string;
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
    disabled: boolean;
  }>;
  required?: boolean;
  description?: string;
  helpText?: string;
}

interface FormBuilderProps<T extends Record<string, any>> {
  initialValues: T;
  fields: FormField<T>[];
  validator?: (values: T) => FormErrors<T>;
  onSubmit: (values: T) => Promise<void>;
  onCancel: () => void;
  transform?: {
    [K in keyof T]?: (value: T[K]) => T[K];
  };
  derivedFields?: {
    [K in keyof T]?: {
      dependsOn: Array<keyof T>;
      compute: (values: T) => T[K];
      skipIfTouched?: boolean;
    };
  };
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
  testId?: string;
  debug?: boolean;
}

/**
 * Componente FormBuilder para criar formulários reutilizáveis
 * Utiliza o hook useFormState para gerenciamento de estado
 */
export function FormBuilder<T extends Record<string, any>>({
  initialValues,
  fields,
  validator,
  onSubmit,
  onCancel,
  transform,
  derivedFields,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  className = 'space-y-4',
  testId = 'form-builder',
  debug = false,
}: FormBuilderProps<T>) {
  const { values, errors, touched, isSubmitting, setValue, handleBlur, handleSubmit } =
    useFormState<T>({
      initialValues,
      validator,
      onSubmit,
      transform,
      derivedFields,
      debug,
    });

  // Combinando isLoading (prop) e isSubmitting (estado interno)
  const isDisabled = isLoading || isSubmitting;

  // Log para diagnóstico
  useEffect(() => {
    if (debug) {
      console.log('[FormBuilder] Renderizando formulário', {
        values,
        errors,
        touched,
        isSubmitting,
        isLoading,
      });
    }
  }, [values, errors, touched, isSubmitting, isLoading, debug]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (debug) {
          console.log('[FormBuilder] Evento submit acionado', { values });
        }

        void handleSubmit(e);
      }}
      className={className}
      data-testid={testId}
      onClick={(e) => {
        // Impedir propagação para evitar problemas com modais
        e.stopPropagation();
      }}
    >
      {fields.map((field) => {
        const fieldName = String(field.name);
        const fieldId = `${testId}-field-${fieldName}`;
        const hasError = !!(errors[field.name] && touched[field.name]);

        return (
          <div
            key={fieldName}
            className="space-y-2"
            data-testid={`${testId}-field-container-${fieldName}`}
          >
            <label
              htmlFor={fieldId}
              className={`block text-sm font-medium ${hasError ? 'text-destructive' : ''}`}
              data-testid={`${testId}-label-${fieldName}`}
            >
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </label>

            <field.component
              id={fieldId}
              name={fieldName}
              value={values[field.name]}
              onChange={(value) => setValue(field.name, value)}
              onBlur={() => handleBlur(field.name)}
              error={errors[field.name]}
              disabled={isDisabled}
            />

            {hasError ? (
              <p className="text-sm text-destructive" data-testid={`${testId}-error-${fieldName}`}>
                {errors[field.name]}
              </p>
            ) : field.helpText ? (
              <p
                className="text-xs text-muted-foreground"
                data-testid={`${testId}-help-${fieldName}`}
              >
                {field.helpText}
              </p>
            ) : null}

            {field.description && !hasError && (
              <p
                className="text-xs text-muted-foreground"
                data-testid={`${testId}-description-${fieldName}`}
              >
                {field.description}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (debug) {
              console.log('[FormBuilder] Botão cancelar clicado');
            }
            onCancel();
          }}
          disabled={isDisabled}
          data-testid={`${testId}-cancel-button`}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          disabled={isDisabled}
          data-testid={`${testId}-submit-button`}
          className="relative"
        >
          {isDisabled && (
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              data-testid={`${testId}-loading-spinner`}
            />
          )}
          <span>{submitLabel}</span>
        </Button>
      </div>
    </form>
  );
}
