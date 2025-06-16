/**
 * Custom hook for sharing filtering logic between components
 * Similar to useFieldFiltering but allows external state to be passed in
 */

import { useCallback, useMemo, useState } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import type { FilterState } from './types';

/**
 * useSharedFiltering hook - aplicar filtragem com estado compartilhado
 * @param fields - Campos a serem filtrados
 * @param externalFilterState - Estado de filtro externo (opcional)
 * @returns Objeto contendo os campos filtrados e utilitários
 */
export function useSharedFiltering(
  fields: DefaultValueField[],
  externalFilterState?: FilterState,
  externalRefreshCounter?: number
) {
  // Refresh counter to force re-renders when needed
  const [internalRefreshCounter, setInternalRefreshCounter] = useState<number>(0);

  // Use the external refresh counter if provided
  const refreshCounter = externalRefreshCounter ?? internalRefreshCounter;

  // Calculate filtered fields based on active filters
  const filteredFields = useMemo(() => {
    if (!fields) {
      return [];
    }

    // If no filters are active or no filter state provided, return all fields
    if (
      !externalFilterState ||
      !(
        externalFilterState.fieldName ||
        externalFilterState.exposed ||
        externalFilterState.overridable ||
        externalFilterState.customized
      )
    ) {
      console.warn('[useSharedFiltering] No active filters, returning all fields:', fields.length);

      return fields;
    }

    // Store filter values in constants to avoid repeated object access
    const { fieldName, exposed, overridable, customized } = externalFilterState;
    const searchTerm = fieldName ? fieldName.toLowerCase() : '';

    // Helper function that checks if a field or its children match the search criteria
    const fieldMatchesFilters = (field: DefaultValueField): boolean => {
      // Check for current field
      if (searchTerm) {
        const keyMatch = field.key.toLowerCase().includes(searchTerm);
        const displayNameMatch = field.displayName
          ? field.displayName.toLowerCase().includes(searchTerm)
          : false;
        const pathMatch = field.path.join('.').toLowerCase().includes(searchTerm);

        // If this field doesn't directly match but has children, we should check them too
        if (!keyMatch && !displayNameMatch && !pathMatch) {
          // If we have children, check if any of them match
          if (field.children && field.children.length > 0) {
            // If any child matches, this field should be included
            const hasMatchingChild = field.children.some((childField) =>
              fieldMatchesFilters(childField)
            );

            if (!hasMatchingChild) {
              return false;
            }
          } else {
            // No children and no direct match
            return false;
          }
        }
      }

      // Filter by exposed fields
      if (exposed && !field.exposed) {
        return false;
      }

      // Filter by overridable fields
      if (overridable && !field.overridable) {
        return false;
      }

      // Filter by customized fields (that were changed by the blueprint)
      if (customized && field.source === ValueSourceType.TEMPLATE) {
        // If the filter is active, return false for any field that was NOT customized
        return false;
      }

      return true;
    };

    // Apply the filter to all root fields
    const result = fields.filter(fieldMatchesFilters);

    console.warn('[useSharedFiltering] Filter applied, results:', result.length);

    return result;
  }, [
    fields,
    externalFilterState,
    // Track specific filter properties to ensure updates
    externalFilterState?.fieldName,
    externalFilterState?.exposed,
    externalFilterState?.overridable,
    externalFilterState?.customized,
    // Add refreshCounter to force recalculation when needed
    refreshCounter,
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
    refreshCounter,
    setRefreshCounter: setInternalRefreshCounter,
    detectCustomization,
  };
}
