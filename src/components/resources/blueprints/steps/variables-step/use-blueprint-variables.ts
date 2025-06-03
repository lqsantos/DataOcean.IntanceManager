import { useCallback, useEffect, useRef, useState } from 'react';

import type { BlueprintVariable } from './types';

/**
 * Hook to manage blueprint variables state and operations
 */
export function useBlueprintVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariables] = useState<BlueprintVariable[]>(initialVariables);
  const initialVariablesRef = useRef<string>(JSON.stringify(initialVariables));

  // Sincronizar com as variáveis iniciais quando elas mudarem
  useEffect(() => {
    const currentInitialString = JSON.stringify(initialVariables);

    if (currentInitialString !== initialVariablesRef.current) {
      initialVariablesRef.current = currentInitialString;
      setVariables(initialVariables);
    }
  }, [initialVariables]);

  // Add a new variable
  const addVariable = useCallback((variable: BlueprintVariable) => {
    setVariables((prev) => [...prev, variable]);
  }, []);

  // Remove a variable by index
  const removeVariable = useCallback((index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update a variable at a specific index
  const updateVariable = useCallback((index: number, variable: BlueprintVariable) => {
    setVariables((prev) => {
      const newVariables = [...prev];

      newVariables[index] = variable;

      return newVariables;
    });
  }, []);

  // Check if a variable name already exists
  const isVariableNameDuplicate = useCallback(
    (name: string, currentVariable?: BlueprintVariable) => {
      return variables.some(
        (v) => v.name === name && (!currentVariable || v.name !== currentVariable.name)
      );
    },
    [variables]
  );

  // Generate the helper template for variables
  const generateHelperTpl = useCallback(() => {
    return variables
      .reduce((acc, variable) => {
        if (variable.type === 'fixed') {
          return `${acc}${variable.name}=${variable.value}\n`;
        }

        return `${acc}${variable.name}=${variable.expression}\n`;
      }, '')
      .trim();
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
