import { useState } from 'react';

import type { BlueprintVariable } from './types';

/**
 * Hook to manage blueprint variables state and operations
 */
export function useBlueprintVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariables] = useState<BlueprintVariable[]>(initialVariables);

  // Add a new variable
  const addVariable = (variable: BlueprintVariable) => {
    setVariables((prev) => [...prev, variable]);
  };

  // Remove a variable by index
  const removeVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a variable at a specific index
  const updateVariable = (index: number, variable: BlueprintVariable) => {
    setVariables((prev) => {
      const newVariables = [...prev];

      newVariables[index] = variable;

      return newVariables;
    });
  };

  // Check if a variable name already exists
  const isVariableNameDuplicate = (name: string, currentVariable?: BlueprintVariable) => {
    return variables.some(
      (v) => v.name === name && (!currentVariable || v.name !== currentVariable.name)
    );
  };

  // Generate the helper template for variables
  const generateHelperTpl = () => {
    const tpl = variables.reduce((acc, variable) => {
      if (variable.type === 'fixed') {
        return `${acc}${variable.name}=${variable.value}\n`;
      }

      return `${acc}${variable.name}=${variable.expression}\n`;
    }, '');

    return tpl.trim();
  };

  return {
    variables,
    addVariable,
    removeVariable,
    updateVariable,
    isVariableNameDuplicate,
    generateHelperTpl,
  };
}
