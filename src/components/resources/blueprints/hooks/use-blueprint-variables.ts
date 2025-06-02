'use client';

import { useCallback, useState } from 'react';

import type { BlueprintVariable } from '../types';

/**
 * Custom hook to manage blueprint variables and helper template generation
 */
export function useBlueprintVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariables] = useState<BlueprintVariable[]>(initialVariables);

  /**
   * Add a new variable with specified type
   */
  const addVariable = useCallback(
    (type: 'simple' | 'advanced') => {
      const namePrefix = 'helper.';
      const baseName = type === 'simple' ? 'variable' : 'expression';
      const index = variables.length + 1;

      // Generate unique name
      let varName = `${namePrefix}${baseName}_${index}`;
      let counter = 1;

      while (variables.some((v) => v.name === varName)) {
        counter++;
        varName = `${namePrefix}${baseName}_${counter}`;
      }

      const newVariable: BlueprintVariable = {
        name: varName,
        description: '',
        value: '',
        type,
      };

      setVariables([...variables, newVariable]);

      return variables.length; // Return index of the new variable
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
   * Update a variable property
   */
  const updateVariable = useCallback(
    (index: number, fieldName: keyof BlueprintVariable, value: string) => {
      setVariables(
        variables.map((variable, idx) =>
          idx === index ? { ...variable, [fieldName]: value } : variable
        )
      );
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
  const generateHelperTpl = useCallback((): string => {
    if (variables.length === 0) {
      return '# Nenhuma variável definida\n';
    }

    // Group variables by type for better organization
    const simpleVars = variables.filter((v) => v.type === 'simple');
    const advancedVars = variables.filter((v) => v.type === 'advanced');

    let content = '# Helper.tpl - Variáveis globais para este blueprint\n\n';

    // Add simple variables
    if (simpleVars.length > 0) {
      content += '# Valores fixos\n';
      simpleVars.forEach((variable) => {
        if (variable.description) {
          content += `# ${variable.description}\n`;
        }
        content += `{{- define "${variable.name}" -}}${variable.value || ''}{{- end -}}\n\n`;
      });
    }

    // Add advanced expression variables
    if (advancedVars.length > 0) {
      content += '# Expressões Go Template\n';
      advancedVars.forEach((variable) => {
        if (variable.description) {
          content += `# ${variable.description}\n`;
        }
        content += `{{- define "${variable.name}" -}}\n${variable.value || ''}\n{{- end -}}\n\n`;
      });
    }

    return content;
  }, [variables]);

  /**
   * Validate Go Template syntax
   * Returns true if valid, false if invalid
   */
  const validateTemplateExpression = useCallback((expression: string): boolean => {
    // Basic validation: check if opening and closing braces match
    const openBraces = (expression.match(/{{/g) || []).length;
    const closeBraces = (expression.match(/}}/g) || []).length;

    return openBraces === closeBraces;
  }, []);

  return {
    variables,
    setVariables,
    addVariable,
    removeVariable,
    updateVariable,
    isVariableNameDuplicate,
    generateHelperTpl,
    validateTemplateExpression,
  };
}
