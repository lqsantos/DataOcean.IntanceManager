/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React from 'react';

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField, TemplateDefaultValues } from '../types';

import { ColumnSizingProvider } from './ColumnSizingContext';
import { EnhancedTableRows } from './EnhancedTableRows';
import { useFieldManagement } from './hooks/useFieldManagement';
import { TableContainer } from './TableContainer';
import { TableFooter } from './TableFooter';
import { ValidationDisplay } from './ValidationDisplay';

// Props clássicas (legado)
export interface TableViewProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables: Array<{ name: string; value: string }>;
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;
  validationState?: {
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>;
  };
  showValidationFeedback?: boolean;

  // Props para expansão e navegação de campos aninhados
  expandedPaths?: Set<string>;
  toggleFieldExpansion?: (path: string) => void;

  // Função para propagar toggles para filhos
  onTogglePropagation?: (
    field: DefaultValueField,
    action: 'expose' | 'override',
    value: boolean
  ) => { fieldPath: string; childPaths: string[] } | undefined;

  // Flag que indica se estamos usando o novo contexto
  useFieldsContext?: boolean;
}

// Interface estendida com propriedades adicionais para o suporte a ValueConfiguration
export interface EnhancedTableViewProps extends TableViewProps {
  useTypedValueConfiguration: boolean;
  valueConfiguration: ValueConfiguration | null;
  onValueConfigurationChange?: (updatedConfig: ValueConfiguration) => void;
}

// Props tipadas para o componente
type CombinedTableViewProps = TableViewProps | EnhancedTableViewProps;

// O componente agora aceita tanto a interface antiga quanto a estendida
export const TableView: React.FC<CombinedTableViewProps> = React.memo((props) => {
  const {
    blueprintVariables,
    templateValues,
    validationState,
    showValidationFeedback = false,
    expandedPaths,
    toggleFieldExpansion,
  } = props;

  // Verificamos se estamos usando a interface estendida com suporte a ValueConfiguration
  const isEnhancedProps = 'useTypedValueConfiguration' in props;

  // Se for enhanced, extraímos as propriedades adicionais
  const useTypedValueConfiguration = isEnhancedProps
    ? (props as EnhancedTableViewProps).useTypedValueConfiguration
    : false;

  // Função de callback para mudanças no ValueConfiguration
  const onValueConfigurationChange = isEnhancedProps
    ? (props as EnhancedTableViewProps).onValueConfigurationChange
    : undefined;

  // Value configuration (se disponível)
  const valueConfiguration = isEnhancedProps
    ? (props as EnhancedTableViewProps).valueConfiguration
    : null;

  // Função onChange básica
  const onChange = props.onChange;

  // Safety check for fields array
  const fields = templateValues?.fields || [];

  // Usando o hook para gerenciamento de campos
  const {
    handleSourceChange,
    handleValueChange,
    handleExposeChange,
    handleOverrideChange,
    handleResetRecursive,
  } = useFieldManagement({
    templateValues,
    valueConfiguration,
    useTypedValueConfiguration,
    onValueConfigurationChange,
    onChange,
    onTogglePropagation: props.onTogglePropagation,
  });

  return (
    <ColumnSizingProvider enableAutoSizing={true} enableResizing={true}>
      <div className="mt-4 flex h-full min-h-0 flex-col" data-testid="table-view">
        {/* Validation Display Component */}
        <ValidationDisplay
          validationState={validationState}
          showValidationFeedback={showValidationFeedback}
        />

        {/* Table Container */}
        <TableContainer
          fields={fields}
          enableColumnResizing={true}
          enableAutoSizing={true}
          tableContent={
            <EnhancedTableRows
              fields={fields}
              valueConfig={valueConfiguration || undefined}
              useTypedValueConfiguration={useTypedValueConfiguration}
              onSourceChange={handleSourceChange}
              onValueChange={handleValueChange}
              onExposeChange={handleExposeChange}
              onOverrideChange={handleOverrideChange}
              onValueConfigChange={onValueConfigurationChange}
              onResetRecursive={handleResetRecursive}
              blueprintVariables={blueprintVariables}
              showValidationFeedback={showValidationFeedback}
              expandedPaths={expandedPaths}
              toggleFieldExpansion={toggleFieldExpansion}
            />
          }
        />

        {/* Footer with Required Fields Legend */}
        <TableFooter showRequiredLegend={true} />
      </div>
    </ColumnSizingProvider>
  );
});

TableView.displayName = 'TableView';
