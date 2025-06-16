/**
 * Custom hook for handling filtering logic
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import type { FilterState } from './types';

// Initial filter state
const initialFilterState: FilterState = {
  fieldName: '',
  exposed: false,
  overridable: false,
  customized: false,
};

export function useFieldFiltering(fields: DefaultValueField[]) {
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);

  // Refresh counter to force re-renders when needed
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // Keep track of expanded paths
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filterState.fieldName ||
      filterState.exposed ||
      filterState.overridable ||
      filterState.customized
    );
  }, [filterState]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      // Only update if there are actual changes
      if (JSON.stringify(newFilters) === JSON.stringify(filterState)) {
        return;
      }

      console.warn('[useFieldFiltering] Updating filters:', newFilters);
      setFilterState(newFilters);
    },
    [filterState]
  );

  // Force clear all filters
  const handleForceFilterClear = useCallback(() => {
    console.warn('[useFieldFiltering] Forcing filter clear');

    // Reset all filters to initial state
    setFilterState(initialFilterState);

    // Clear expanded paths
    setExpandedPaths(new Set());

    // Increment refresh counter to force re-render
    setRefreshCounter((prev) => prev + 1);
  }, []);

  // Calculate filtered fields based on active filters
  const filteredFields = useMemo(() => {
    if (!fields) {
      return [];
    }

    // If no filters are active, return all fields
    if (!hasActiveFilters) {
      console.warn('[useFieldFiltering] No active filters, returning all fields:', fields.length);

      return fields;
    }

    // Store filter values in constants to avoid repeated object access
    const { fieldName, exposed, overridable, customized } = filterState;
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

    console.warn('[useFieldFiltering] Filter applied, results:', result.length);

    return result;
  }, [
    fields,
    hasActiveFilters,
    filterState,
    // Track specific filter properties to ensure updates
    filterState.fieldName,
    filterState.exposed,
    filterState.overridable,
    filterState.customized,
    // Add refreshCounter to force recalculation when needed
    refreshCounter,
  ]);

  // Log filter changes for debugging
  useEffect(() => {
    console.warn(
      '[useFieldFiltering] Filter state updated:',
      JSON.stringify(filterState),
      'Active filters:',
      hasActiveFilters
    );
  }, [filterState, hasActiveFilters]);

  // Log filtered fields changes
  useEffect(() => {
    console.warn(
      '[useFieldFiltering] Filtered fields changed:',
      `${filteredFields.length} items, active filters:`,
      hasActiveFilters
    );
  }, [filteredFields.length, hasActiveFilters]);

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
            console.warn(`[useFieldFiltering] Customized field detected: ${path}`);
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

  return {
    filterState,
    setFilterState,
    handleFilterChange,
    handleForceFilterClear,
    hasActiveFilters,
    filteredFields,
    refreshCounter,
    setRefreshCounter,
    expandedPaths,
    setExpandedPaths,
    detectCustomization,
  };
}
