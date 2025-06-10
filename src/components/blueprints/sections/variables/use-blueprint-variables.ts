import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { BlueprintVariable } from './types';

export function useBlueprintVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariablesState] = useState<BlueprintVariable[]>(initialVariables);

  // Usar ref para evitar loops infinitos quando comparamos initialVariables
  const initialVariablesRef = useRef<string>(JSON.stringify(initialVariables));

  // Sincronizar com initialVariables apenas na primeira renderização ou quando mudar externamente
  useEffect(() => {
    const currentInitialString = JSON.stringify(initialVariables);

    // Atualiza apenas se os dados iniciais realmente mudaram e não são iguais aos dados atuais
    if (
      currentInitialString !== initialVariablesRef.current &&
      currentInitialString !== JSON.stringify(variables)
    ) {
      initialVariablesRef.current = currentInitialString;
      setVariablesState(initialVariables);
    }
  }, [initialVariables, variables]);

  // Adicionar nova variável
  const addVariable = useCallback((variable: Omit<BlueprintVariable, 'id'>) => {
    const newVariable = {
      ...variable,
      id: uuidv4(),
      isValid: true,
    };

    setVariablesState((prev: BlueprintVariable[]) => [...prev, newVariable]);

    return newVariable.id;
  }, []);

  // Atualizar variável existente
  const updateVariable = useCallback((id: string, data: Partial<BlueprintVariable>) => {
    setVariablesState((prev: BlueprintVariable[]) =>
      prev.map((variable: BlueprintVariable) =>
        variable.id === id ? { ...variable, ...data } : variable
      )
    );
  }, []);

  // Excluir variável
  const deleteVariable = useCallback((id: string) => {
    setVariablesState((prev: BlueprintVariable[]) =>
      prev.filter((variable: BlueprintVariable) => variable.id !== id)
    );
  }, []);

  // Validar todas as variáveis
  const validateVariables = useCallback(() => {
    let allValid = true;

    // Verificar nomes duplicados
    const names = new Set<string>();

    const updatedVariables = variables.map((variable) => {
      const validationResults = validateVariable(variable);

      if (!validationResults.isValid) {
        allValid = false;
      }

      if (names.has(variable.name)) {
        validationResults.isValid = false;
        validationResults.validationError = 'Duplicate variable name';
        allValid = false;
      } else {
        names.add(variable.name);
      }

      return {
        ...variable,
        isValid: validationResults.isValid,
        validationError: validationResults.validationError,
      };
    });

    setVariablesState(updatedVariables);

    return allValid;
  }, [variables]);

  // Permitir definir variáveis diretamente
  const setVariables = useCallback((newVariables: BlueprintVariable[]) => {
    setVariablesState(newVariables);
  }, []);

  // Funções auxiliares
  const getVariableByName = useCallback(
    (name: string) => variables.find((v) => v.name === name),
    [variables]
  );

  // Verificar se nome já existe
  const isVariableNameDuplicate = useCallback(
    (name: string, currentId?: string) => {
      return variables.some((v) => v.name === name && (!currentId || v.id !== currentId));
    },
    [variables]
  );

  return {
    variables,
    setVariables,
    addVariable,
    updateVariable,
    deleteVariable,
    validateVariables,
    getVariableByName,
    isVariableNameDuplicate,
  };
}

// Função auxiliar para validação de variável individual
function validateVariable(variable: BlueprintVariable): {
  isValid: boolean;
  validationError?: string;
} {
  // Validar nome
  if (!variable.name || variable.name.trim() === '') {
    return { isValid: false, validationError: 'Name is required' };
  }

  // Validar formato do nome
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable.name)) {
    return {
      isValid: false,
      validationError:
        'Name must start with letter and contain only letters, numbers and underscores',
    };
  }

  // Validar valor
  if (!variable.value || variable.value.trim() === '') {
    return { isValid: false, validationError: 'Value is required' };
  }

  // Validação de sintaxe Go Template (para todas as variáveis, pois agora são todas expressões)
  // Verificar delimitadores balanceados
  const openingBraces = (variable.value.match(/{{-?/g) || []).length;
  const closingBraces = (variable.value.match(/-?}}/g) || []).length;

  if (openingBraces !== closingBraces) {
    return { isValid: false, validationError: 'Unbalanced template delimiters' };
  }

  // Detectar referências circulares (simplificado)
  if (variable.value.includes(`\${${variable.name}}`)) {
    return { isValid: false, validationError: 'Self-referential variable' };
  }

  return { isValid: true };
}
