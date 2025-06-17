/**
 * TableViewContainer component - Refatorado para usar o novo FieldsContext
 */

import React, { useCallback, useEffect } from 'react';

import { FieldsProvider, useFields } from '../fields';
import { TableView } from '../TableComponents/TableView';
import type { DefaultValueField } from '../types';

import type { ValueEditorBaseProps } from './types';

interface TableViewContainerProps extends ValueEditorBaseProps {
  onFieldsChange?: (fields: DefaultValueField[]) => void;
  expandedPaths?: Set<string>;
  setExpandedPaths?: React.Dispatch<React.SetStateAction<Set<string>>>;
  // Campos filtrados já fornecidos pelo componente pai
  filteredFields?: DefaultValueField[];
  hasActiveFilters?: boolean;
}

// Componente interno que usa o contexto
const TableViewWithContext: React.FC<TableViewContainerProps> = ({
  templateValues,
  blueprintVariables,
  onChange,
  filteredFields,
  hasActiveFilters,
}) => {
  // Acessa o contexto de campos
  const {
    state: { expandedPaths },
    toggleFieldExpansion,
    updateFields,
    propagateExpose,
    propagateOverride,
  } = useFields();

  // Use filtered fields if active filters and fields are provided
  const fieldsToRender =
    hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

  // Atualiza os campos no contexto quando eles mudam
  useEffect(() => {
    console.warn('[TableViewWithContext] Atualizando campos no contexto:', fieldsToRender.length);
    updateFields(fieldsToRender);
  }, [fieldsToRender, updateFields]);

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
  const {
    setExpandedPaths: externalSetExpandedPaths,
    filteredFields,
    hasActiveFilters,
    templateValues,
  } = props;

  // Estado para forçar recriação do contexto quando necessário
  // Usando uma constante fixa ao invés de um estado para evitar loops
  const refreshCounter = 0; // Valor fixo para estabilidade

  // Determina os campos a serem usados para inicializar o contexto
  const fieldsToUse = hasActiveFilters && filteredFields ? filteredFields : templateValues.fields;

  // Handler para sincronizar estados expandidos com estado externo se necessário
  const handleExpandedPathsChange = useCallback(
    (paths: Set<string>) => {
      if (externalSetExpandedPaths) {
        console.warn('[TableViewContainer] Sincronizando caminhos expandidos:', paths.size);
        externalSetExpandedPaths(paths);
      }
    },
    [externalSetExpandedPaths]
  );

  // Melhoria: Inicialização adicional para garantir que os filtros funcionem bem com expansão
  useEffect(() => {
    // Registra alterações nos filtros para debugging
    if (hasActiveFilters) {
      console.warn(
        '[TableViewContainer] Filtros ativos detectados, campos filtrados:',
        filteredFields?.length
      );
    }
  }, [hasActiveFilters, filteredFields?.length]);

  // ATENÇÃO: Esta era uma das causas do loop infinito - não devemos atualizar o estado no useEffect
  // que depende dos valores que serão modificados pelo próprio useEffect
  /* Removido para evitar loop infinito
  useEffect(() => {
    console.warn('[TableViewContainer] Campos ou filtros atualizados, preparando reinicialização');
    setRefreshCounter((prev) => prev + 1);
  }, [fieldsToUse, props.expandedPaths]);
  */

  // Ao receber novos props.expandedPaths, precisamos forçar uma atualização do contexto
  // Isso garante que os botões Expand/Collapse All funcionem corretamente
  return (
    <FieldsProvider
      key={`fields-${refreshCounter}`} // Força recriação do contexto quando os filtros/refresh mudam
      initialFields={fieldsToUse}
      onExpandedPathsChange={handleExpandedPathsChange}
      // Garante que sempre recebemos a referência mais recente dos caminhos expandidos
      initialExpandedPaths={new Set(Array.from(props.expandedPaths || new Set()))}
    >
      <TableViewWithContext {...props} />
    </FieldsProvider>
  );
};
