import React, { useCallback, useEffect } from 'react';

import { FieldsProvider, useFields } from '../fields';
import { TableView } from '../TableComponents/TableView';
import type { DefaultValueField } from '../types';

import type { ValueEditorBaseProps } from './types';

interface TableViewContainerProps extends ValueEditorBaseProps {
  onFieldsChange?: (fields: DefaultValueField[]) => void;
  expandedPaths?: Set<string>;
  setExpandedPaths?: React.Dispatch<React.SetStateAction<Set<string>>>;
  filteredFields?: DefaultValueField[];
  hasActiveFilters?: boolean;
  matchingFieldPaths?: string[];
  expandAllFieldsRef?: React.MutableRefObject<(() => void) | null>;
  collapseAllFieldsRef?: React.MutableRefObject<(() => void) | null>;
}

const TableViewWithContext: React.FC<TableViewContainerProps> = ({
  templateValues,
  blueprintVariables,
  onChange,
  filteredFields,
  hasActiveFilters,
  expandAllFieldsRef,
  collapseAllFieldsRef,
  expandedPaths: externalExpandedPaths,
  matchingFieldPaths,
}) => {
  const {
    state: { expandedPaths },
    toggleFieldExpansion,
    updateFields,
    propagateExpose,
    propagateOverride,
    expandAllFields: contextExpandAll,
    collapseAllFields: contextCollapseAll,
    expandPaths,
  } = useFields();

  React.useEffect(() => {
    if (expandAllFieldsRef) {
      expandAllFieldsRef.current = contextExpandAll;
    }

    if (collapseAllFieldsRef) {
      collapseAllFieldsRef.current = contextCollapseAll;
    }
  }, [expandAllFieldsRef, collapseAllFieldsRef, contextExpandAll, contextCollapseAll]);

  const fieldsToRender =
    hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

  useEffect(() => {
    updateFields(fieldsToRender);
  }, [fieldsToRender, updateFields]);

  useEffect(() => {
    if (externalExpandedPaths && externalExpandedPaths.size > 0) {
      const pathsArray = Array.from(externalExpandedPaths);

      expandPaths(pathsArray);
    }
  }, [externalExpandedPaths, expandPaths]);

  // Auto-expand matching field paths from search
  useEffect(() => {
    if (matchingFieldPaths && matchingFieldPaths.length > 0) {
      expandPaths(matchingFieldPaths);
    }
  }, [matchingFieldPaths, expandPaths]);

  // Funções de helper para propagar toggles para campos filhos
  const handleTogglePropagation = useCallback(
    (field: DefaultValueField, action: 'expose' | 'override', value: boolean) => {
      // Obtém o caminho do campo
      const fieldPath = field.path.join('.');

      // Propaga as alterações adequadamente com base na ação
      const childPaths =
        action === 'expose' ? propagateExpose(field, value) : propagateOverride(field, value);

      // Retorna os dados para permitir a propagação
      return {
        fieldPath,
        childPaths,
      };
    },
    [propagateExpose, propagateOverride]
  );

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
      // Helper para propagação de toggles
      onTogglePropagation={handleTogglePropagation}
      // Indica que estamos usando o novo contexto
      useFieldsContext={true}
    />
  );
};

// Componente principal que envolve o componente interno com o provider
export const TableViewContainer: React.FC<TableViewContainerProps> = (props) => {
  const { filteredFields, hasActiveFilters, templateValues } = props;

  // Determina os campos a serem usados para inicializar o contexto
  const fieldsToUse = hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

  // Handler para sincronizar estados expandidos com estado externo se necessário
  // DESABILITADO para evitar loops infinitos - vamos usar apenas o contexto interno
  const handleExpandedPathsChange = useCallback(
    (_paths: Set<string>) => {
      // Comentado temporariamente para evitar loops
      // if (props.setExpandedPaths) {
      //   props.setExpandedPaths(paths);
      // }
    },
    [props.setExpandedPaths]
  );

  // Ao receber novos props.expandedPaths, precisamos forçar uma atualização do contexto
  // Isso garante que os botões Expand/Collapse All funcionem corretamente
  return (
    <FieldsProvider
      initialFields={fieldsToUse}
      onExpandedPathsChange={handleExpandedPathsChange}
      // Simplificado - apenas usar os paths iniciais sem complexidade extra
      initialExpandedPaths={props.expandedPaths}
    >
      <TableViewWithContext {...props} />
    </FieldsProvider>
  );
};
