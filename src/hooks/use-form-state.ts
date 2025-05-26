/**
 * Hook reutilizável para gerenciar estados de formulários
 * Facilita a criação de formulários controlados com validação e estados
 */

import { useCallback, useEffect, useState } from 'react';

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

interface UseFormStateOptions<T> {
  initialValues: T;
  validator?: (values: T) => FormErrors<T>;
  onSubmit?: (values: T) => Promise<void>;
  /**
   * Função para transformar automaticamente os valores do formulário
   * Por exemplo, converter slug para lowercase ou outros formatos
   */
  transform?: {
    [K in keyof T]?: (value: T[K]) => T[K];
  };
  /**
   * Campos que devem ser automaticamente derivados de outros campos
   * Por exemplo, gerar slug a partir do nome quando slug não foi tocado
   */
  derivedFields?: {
    [K in keyof T]?: {
      dependsOn: Array<keyof T>;
      compute: (values: T) => T[K];
      skipIfTouched?: boolean;
    };
  };
  /**
   * Função de logging opcional para diagnóstico
   */
  debug?: boolean;
}

/**
 * Hook que fornece gerenciamento completo do estado de um formulário,
 * incluindo valores, erros, estados de toque e submissão.
 */
export function useFormState<T extends Record<string, unknown>>({
  initialValues,
  validator,
  onSubmit: externalOnSubmit,
  transform,
  derivedFields,
  debug = false,
}: UseFormStateOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Log para diagnóstico
  const logDebug = useCallback(
    (message: string, data?: unknown) => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log(`[FormState] ${message}`, data);
      }
    },
    [debug]
  );

  // Atualizar valores quando initialValues mudam (importante para modo de edição)
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setAttemptedSubmit(false);
    logDebug('Valores iniciais atualizados', { initialValues });
  }, [initialValues, logDebug]);

  // Validar formulário usando a função validator fornecida
  const validateForm = useCallback(() => {
    if (!validator) {
      setIsValid(true);

      return true;
    }

    const newErrors = validator(values);
    const hasErrors = Object.keys(newErrors).length > 0;

    setErrors(newErrors);
    setIsValid(!hasErrors);

    logDebug('Validação executada', { hasErrors, errors: newErrors, values });

    return !hasErrors;
  }, [values, validator, logDebug]);

  // Aplicar transformações automaticamente
  const applyTransform = useCallback(
    (field: keyof T, value: unknown): unknown => {
      if (transform?.[field]) {
        return transform[field]?.(value as T[keyof T]) as unknown;
      }

      return value;
    },
    [transform]
  );

  // Processar campos derivados
  useEffect(() => {
    if (!derivedFields) {
      return;
    }

    let shouldUpdate = false;
    const newValues = { ...values };

    Object.entries(derivedFields).forEach(([fieldName, config]) => {
      const field = fieldName as keyof T;
      // Verificar se alguma dependência foi alterada
      const shouldCompute =
        config.dependsOn.some((dep: keyof T) => touched[dep]) &&
        (!config.skipIfTouched || !touched[field]) &&
        // Não sobrescrever se o campo já tem um valor e não foi tocado (cenário de edição)
        !(initialValues[field] && !touched[field]);

      if (shouldCompute) {
        const computedValue = config.compute(values);

        if (newValues[field] !== computedValue) {
          newValues[field] = computedValue;
          shouldUpdate = true;

          logDebug(`Campo derivado "${String(field)}" atualizado`, { computedValue });
        }
      }
    });

    if (shouldUpdate) {
      setValues(newValues);
    }
  }, [values, touched, derivedFields, initialValues, logDebug]);

  // Definir o valor de um campo
  const setValue = useCallback(
    (field: keyof T, value: unknown, markAsTouched = true) => {
      const transformedValue = applyTransform(field, value);

      logDebug(`Definindo valor para "${String(field)}"`, {
        original: value,
        transformed: transformedValue,
        markAsTouched,
      });

      setValues((prev) => ({
        ...prev,
        [field]: transformedValue as T[keyof T],
      }));

      if (markAsTouched) {
        setTouched((prev) => ({
          ...prev,
          [field]: true,
        }));
      }
    },
    [applyTransform, logDebug]
  );

  // Marcar campo como tocado e validar
  const handleBlur = useCallback(
    (field: keyof T) => {
      logDebug(`Campo "${String(field)}" perdeu foco`);

      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      validateForm();
    },
    [validateForm, logDebug]
  );

  // Manipulador para submissão do formulário
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      logDebug('Tentativa de submissão do formulário', { values });

      // Marcar todos os campos como tocados para mostrar todos os erros
      const allTouched = Object.keys(values).reduce<FormTouched<T>>(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );

      setTouched(allTouched);
      setAttemptedSubmit(true);

      // Validar antes de submeter
      const isFormValid = validateForm();

      if (!isFormValid) {
        logDebug('Validação de submissão falhou', errors);

        return;
      }

      if (!externalOnSubmit) {
        logDebug('Nenhuma função onSubmit fornecida');

        return;
      }

      try {
        setIsSubmitting(true);
        logDebug('Iniciando submissão', { values });

        await externalOnSubmit(values);

        logDebug('Submissão concluída com sucesso');
      } catch (error) {
        logDebug('Erro na submissão', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, externalOnSubmit, errors, logDebug]
  );

  // Reset do formulário
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setAttemptedSubmit(false);
    logDebug('Formulário resetado');
  }, [initialValues, logDebug]);

  // Log inicial
  useEffect(() => {
    logDebug('Hook useFormState inicializado', { initialValues });
  }, [initialValues, logDebug]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    attemptedSubmit,
    setValue,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
    setTouched,
  };
}
