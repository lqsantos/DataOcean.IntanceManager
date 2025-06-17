/**
 * Exemplo de uso da API modular de gerenciamento de campos
 * Este arquivo serve como guia de referência para a utilização do sistema
 */

import React from 'react';

// Importações da API modular
import type { DefaultValueField } from '../../types';
import { FieldsProvider, useFields, useFieldsContextAvailable } from '../fields';

interface FieldsExampleProps {
  fields: DefaultValueField[];
  onExpansionChange?: (expandedPaths: Set<string>) => void;
}

// Componente filho que usa o contexto
const FieldsConsumer: React.FC = () => {
  const {
    state,
    toggleFieldExpansion,
    expandAllFields,
    collapseAllFields,
    propagateExpose,
    propagateOverride,
    findField,
  } = useFields();

  const { expandedPaths, currentFields } = state;

  //   useEffect(() => {
  //     console.log('Campos atualizados:', currentFields.length);
  //     console.log('Caminhos expandidos:', expandedPaths.size);
  //   }, [currentFields, expandedPaths]);

  // Exemplo de manipulação de campo
  const handleToggleField = (path: string) => {
    toggleFieldExpansion(path);
  };

  // Exemplo de manipulação de campo com filhos
  const handleToggleExpose = (field: DefaultValueField, exposed: boolean) => {
    // Obter caminhos de filhos para propagação
    const childPaths = propagateExpose(field, exposed);

    //console.log(`Propagando 'exposed=${exposed}' para ${childPaths.length} filhos`);

    // No código real, você chamaria sua função para atualizar o estado dos campos
    // updateFieldExposed(field, exposed, childPaths);
  };

  return (
    <div>
      <h2>Gerenciamento de Campos</h2>
      <div>
        <button onClick={expandAllFields}>Expandir Todos</button>
        <button onClick={collapseAllFields}>Colapsar Todos</button>
      </div>
      <div>
        {currentFields.map((field) => {
          const path = field.path.join('.');
          const isExpanded = expandedPaths.has(path);

          return (
            <div key={path}>
              <button onClick={() => handleToggleField(path)}>
                {isExpanded ? '▼' : '►'} {field.key}
              </button>
              {field.type === 'object' && (
                <button onClick={() => handleToggleExpose(field, !field.exposed)}>
                  {field.exposed ? 'Ocultar' : 'Expor'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente principal com provider
export const FieldsExample: React.FC<FieldsExampleProps> = ({ fields, onExpansionChange }) => {
  return (
    <FieldsProvider initialFields={fields} onExpandedPathsChange={onExpansionChange}>
      <FieldsConsumer />
    </FieldsProvider>
  );
};

// Exemplo de componente que verifica disponibilidade do contexto
export const SmartComponent: React.FC<{ field: DefaultValueField }> = ({ field }) => {
  const hasFieldsContext = useFieldsContextAvailable();

  if (hasFieldsContext) {
    // Usa o contexto disponível
    const { toggleFieldExpansion } = useFields();
    const path = field.path.join('.');

    return <button onClick={() => toggleFieldExpansion(path)}>Toggle usando contexto</button>;
  }

  // Fallback quando não há contexto
  return <span>{field.key} (sem contexto)</span>;
};
