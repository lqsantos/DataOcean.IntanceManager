/**
 * TableViewContainer component - Simplified version
 */

import React from 'react';

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

  // Setup field expansion logic
  const { toggleFieldExpansion } = useFieldExpansion(
    templateValues.fields || [],
    expandedPaths,
    setExpandedPaths,
    ''
  );

  // Use filtered fields if active filters and fields are provided
  const fieldsToRender =
    hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

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
