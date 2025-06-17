/**
 * Custom hook for sharing filtering logic between components
 * Similar to useFieldFiltering but allows external state to be passed in
 */

import { useCallback, useMemo } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import type { FilterState } from './types';

/**
 * useSharedFiltering hook - aplicar filtragem com estado compartilhado
 * @param fields - Campos a serem filtrados
 * @param externalFilterState - Estado de filtro externo (opcional)
 * @returns Objeto contendo os campos filtrados e utilitários
 */
export function useSharedFiltering(fields: DefaultValueField[], externalFilterState?: FilterState) {
  // Log para debug inicial - desativado para evitar loops
  // console.warn(
  //   '[useSharedFiltering] Inicializando com campos:',
  //   fields?.length,
  //   'Filtros:',
  //   JSON.stringify(externalFilterState)
  // );

  // Calculate filtered fields based on active filters
  const filteredFields = useMemo(() => {
    if (!fields || fields.length === 0) {
      return [];
    }

    // Determine if any filters are active
    const hasFilters = !!(
      externalFilterState?.fieldName ||
      externalFilterState?.exposed ||
      externalFilterState?.overridable ||
      externalFilterState?.customized
    );

    // If no filters are active or no filter state provided, return all fields
    if (!externalFilterState || !hasFilters) {
      // console.warn('[useSharedFiltering] No active filters, returning all fields:', fields.length);

      return fields;
    }

    // Store filter values in constants to avoid repeated object access
    const { fieldName, exposed, overridable, customized } = externalFilterState;
    const searchTerm = fieldName ? fieldName.toLowerCase() : '';

    // Helper function that checks if a field or its children match the search criteria
    const fieldMatchesFilters = (field: DefaultValueField): boolean => {
      // Track if this field or any child matches (for parent fields to be included)
      let thisNodeMatches = true;
      let anyChildMatches = false;

      // Check search term filter
      if (searchTerm) {
        const keyMatch = field.key.toLowerCase().includes(searchTerm);
        const displayNameMatch = field.displayName
          ? field.displayName.toLowerCase().includes(searchTerm)
          : false;
        const pathMatch = field.path.join('.').toLowerCase().includes(searchTerm);

        thisNodeMatches = keyMatch || displayNameMatch || pathMatch;
      }

      // Check toggle filters for this node
      if (thisNodeMatches) {
        // Filter by exposed fields
        if (exposed && !field.exposed) {
          thisNodeMatches = false;
        }

        // Filter by overridable fields
        if (thisNodeMatches && overridable && !field.overridable) {
          thisNodeMatches = false;
        }

        // Filter by customized fields (that were changed by the blueprint)
        if (thisNodeMatches && customized && field.source === ValueSourceType.TEMPLATE) {
          thisNodeMatches = false;
        }
      }

      // If this node has children, check if any of them match
      if (field.children && field.children.length > 0) {
        anyChildMatches = field.children.some((childField) => fieldMatchesFilters(childField));
      }

      // A field should be included if it matches itself OR has any matching children
      return thisNodeMatches || anyChildMatches;
    };

    // Apply the filter to all root fields
    const result = fields.filter(fieldMatchesFilters);

    // console.warn('[useSharedFiltering] Filter applied, results:', result.length);

    return result;
  }, [
    fields,
    externalFilterState,
    // Track specific filter properties to ensure updates
    externalFilterState?.fieldName,
    externalFilterState?.exposed,
    externalFilterState?.overridable,
    externalFilterState?.customized,
  ]);

  // Helper to detect if customization happened (for onChange handler)
  const detectCustomization = useCallback(
    (original: DefaultValueField[], updated: DefaultValueField[]) => {
      let foundCustomization = false;

      // Recursive function to find customized fields
      const findCustomizedDiff = (
        origFields: DefaultValueField[],
        updatedFields: DefaultValueField[]
      ) => {
        // Create maps for quick comparison
        const originalMap = new Map(origFields.map((f) => [f.path.join('.'), f]));

        // Check each updated field
        updatedFields.forEach((updatedField) => {
          const path = updatedField.path.join('.');
          const originalField = originalMap.get(path);

          // If found a field that changed from TEMPLATE to BLUEPRINT
          if (
            originalField &&
            originalField.source === ValueSourceType.TEMPLATE &&
            updatedField.source === ValueSourceType.BLUEPRINT
          ) {
            console.warn(`[useSharedFiltering] Customized field detected: ${path}`);
            foundCustomization = true;
          }

          // Recursively check children
          if (
            !foundCustomization &&
            updatedField.children &&
            originalField &&
            originalField.children
          ) {
            findCustomizedDiff(originalField.children, updatedField.children);
          }
        });
      };

      // Start comparison if we have both sets of fields
      if (original && updated) {
        findCustomizedDiff(original, updated);
      }

      return foundCustomization;
    },
    []
  );

  // Determine if any filters are active
  const hasActiveFilters = !!(
    externalFilterState?.fieldName ||
    externalFilterState?.exposed ||
    externalFilterState?.overridable ||
    externalFilterState?.customized
  );

  return {
    filteredFields,
    hasActiveFilters,
    detectCustomization,
  };
}
