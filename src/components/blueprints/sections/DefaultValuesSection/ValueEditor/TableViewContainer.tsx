/**
 * TableViewContainer component - Simplified version
 */

import React, { useEffect } from 'react';

import { TableView } from '../TableComponents/TableView';
import type { DefaultValueField } from '../types';

import type { ValueEditorBaseProps } from './types';
import { useFieldExpansion } from './useFieldExpansion';

interface TableViewContainerProps extends ValueEditorBaseProps {
  onFieldsChange?: (fields: DefaultValueField[]) => void;
  expandedPaths?: Set<string>;
  setExpandedPaths?: React.Dispatch<React.SetStateAction<Set<string>>>;
  // Campos filtrados já fornecidos pelo componente pai
  filteredFields?: DefaultValueField[];
  hasActiveFilters?: boolean;
}

export const TableViewContainer: React.FC<TableViewContainerProps> = ({
  templateValues,
  blueprintVariables,
  onChange,
  expandedPaths: externalExpandedPaths,
  setExpandedPaths: externalSetExpandedPaths,
  filteredFields,
  hasActiveFilters,
}) => {
  // Create our own expand state if not provided
  const [internalExpandedPaths, internalSetExpandedPaths] = React.useState<Set<string>>(new Set());

  // Use external or internal state
  const expandedPaths = externalExpandedPaths || internalExpandedPaths;
  const setExpandedPaths = externalSetExpandedPaths || internalSetExpandedPaths;

  // Use filtered fields if active filters and fields are provided
  const fieldsToRender =
    hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

  // SOLUÇÃO CRÍTICA: hook useFieldExpansion precisa receber EXATAMENTE os mesmos campos
  // que serão passados para o TableView, caso contrário, a lógica de colapso não funciona
  // quando os campos são filtrados

  // Setup field expansion logic - USANDO OS MESMOS CAMPOS QUE SERÃO RENDERIZADOS
  const { toggleFieldExpansion } = useFieldExpansion(
    fieldsToRender || [],
    expandedPaths,
    setExpandedPaths,
    ''
  );

  // Efeito simplificado - apenas valida caminhos expandidos
  useEffect(() => {
    // Somente executar se temos caminhos expandidos e campos para validar
    if (expandedPaths?.size && fieldsToRender?.length) {
      // Coletamos todos os caminhos expandíveis válidos
      const validPaths = new Set<string>();

      // Função auxiliar para coletar caminhos válidos
      const collectValidPaths = (fields: DefaultValueField[]) => {
        fields.forEach((field) => {
          // Somente objetos com filhos são expandíveis
          if (field.type === 'object' && field.children?.length) {
            validPaths.add(field.path.join('.'));
            collectValidPaths(field.children);
          }
        });
      };

      // Inicie a coleta dos caminhos válidos
      collectValidPaths(fieldsToRender);

      // Verificar se algum caminho expandido atual não é mais válido
      let needsUpdate = false;

      expandedPaths.forEach((path) => {
        if (!validPaths.has(path)) {
          needsUpdate = true;
        }
      });

      // Se precisamos atualizar, remova caminhos inválidos
      if (needsUpdate) {
        setExpandedPaths((prev) => {
          const newPaths = new Set<string>();

          prev.forEach((path) => {
            if (validPaths.has(path)) {
              newPaths.add(path);
            }
          });

          return newPaths;
        });
      }
    }
  }, [fieldsToRender, expandedPaths, setExpandedPaths]);

  return (
    <TableView
      templateValues={{
        ...templateValues,
        fields: fieldsToRender,
      }}
      onChange={onChange}
      blueprintVariables={blueprintVariables || []}
      expandedPaths={expandedPaths}
      toggleFieldExpansion={toggleFieldExpansion}
    />
  );
};
