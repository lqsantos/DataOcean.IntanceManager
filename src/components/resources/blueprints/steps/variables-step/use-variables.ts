'use client';

import { useCallback, useState } from 'react';

import type { BlueprintVariable } from './types';

/**
 * Custom hook to manage blueprint variables
 */
export function useVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariables] = useState<BlueprintVariable[]>(initialVariables);

  /**
   * Add a new variable
   */
  const addVariable = useCallback(
    (variable: BlueprintVariable) => {
      setVariables([...variables, variable]);
    },
    [variables]
  );

  /**
   * Remove a variable by index
   */
  const removeVariable = useCallback(
    (index: number) => {
      setVariables(variables.filter((_, idx) => idx !== index));
    },
    [variables]
  );

  /**
   * Update a variable
   */
  const updateVariable = useCallback(
    (index: number, variable: BlueprintVariable) => {
      setVariables(variables.map((v, idx) => (idx === index ? variable : v)));
    },
    [variables]
  );

  /**
   * Check if a variable name is duplicate
   */
  const isVariableNameDuplicate = useCallback(
    (name: string, currentIndex: number): boolean => {
      return variables.some((v, idx) => idx !== currentIndex && v.name === name);
    },
    [variables]
  );

  /**
   * Generate helper template content based on variables
   */
  const generateHelperTpl = useCallback(() => {
    if (variables.length === 0) {
      return '';
    }

    const parts: string[] = ['{{/* Variáveis Globais */}}'];

    variables.forEach((variable) => {
      parts.push('');
      parts.push(`{{/* ${variable.description || variable.name} */}}`);
      parts.push(`{{- define "${variable.name}" -}}`);

      if (variable.type === 'fixed') {
        parts.push(variable.value);
      } else {
        parts.push(variable.expression);
      }

      parts.push('{{- end }}');
    });

    return parts.join('\n');
  }, [variables]);

  return {
    variables,
    addVariable,
    removeVariable,
    updateVariable,
    isVariableNameDuplicate,
    generateHelperTpl,
  };
}
