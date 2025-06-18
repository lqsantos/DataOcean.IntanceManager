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
      return fields;
    }

    // Store filter values in constants to avoid repeated object access
    const { fieldName, exposed, overridable, customized } = externalFilterState;
    const searchTerm = fieldName ? fieldName.toLowerCase() : '';

    // Helper function that filters a field and recursively filters its children
    const filterFieldRecursively = (field: DefaultValueField): DefaultValueField | null => {
      // Track if this field matches
      let thisNodeMatches = false;

      // Check search term filter
      if (searchTerm) {
        const keyMatch = field.key.toLowerCase().includes(searchTerm);
        const displayNameMatch = field.displayName
          ? field.displayName.toLowerCase().includes(searchTerm)
          : false;
        const pathMatch = field.path.join('.').toLowerCase().includes(searchTerm);

        thisNodeMatches = keyMatch || displayNameMatch || pathMatch;
      } else {
        // If no search term, assume this node matches (for toggle filters only)
        thisNodeMatches = true;
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

      // Recursively filter children
      let filteredChildren: DefaultValueField[] = [];

      if (field.children && field.children.length > 0) {
        filteredChildren = field.children
          .map(filterFieldRecursively)
          .filter((child): child is DefaultValueField => child !== null);
      }

      // Include this field if:
      // 1. This node matches the filters, OR
      // 2. It has children that match (to show parent paths)
      const shouldInclude = thisNodeMatches || filteredChildren.length > 0;

      if (shouldInclude) {
        // Return a copy of the field with filtered children
        return {
          ...field,
          children: filteredChildren,
        };
      }

      return null;
    };

    // Apply the filter to all root fields
    const result = fields
      .map(filterFieldRecursively)
      .filter((field): field is DefaultValueField => field !== null);

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

  // Function to find matching field paths for auto-expansion
  const getMatchingFieldPaths = useCallback(
    (fields: DefaultValueField[], searchTerm: string): string[] => {
      const matchingPaths: string[] = [];

      const findMatches = (fieldList: DefaultValueField[]) => {
        fieldList.forEach((field) => {
          if (searchTerm) {
            const keyMatch = field.key.toLowerCase().includes(searchTerm);
            const displayNameMatch = field.displayName
              ? field.displayName.toLowerCase().includes(searchTerm)
              : false;
            const pathMatch = field.path.join('.').toLowerCase().includes(searchTerm);

            if (keyMatch || displayNameMatch || pathMatch) {
              // Add this field and all parent paths for expansion
              let currentPath = '';

              field.path.forEach((segment, index) => {
                if (index === 0) {
                  currentPath = segment;
                } else {
                  currentPath = `${currentPath}.${segment}`;
                }

                if (!matchingPaths.includes(currentPath)) {
                  matchingPaths.push(currentPath);
                }
              });
            }
          }

          // Recursively check children
          if (field.children && field.children.length > 0) {
            findMatches(field.children);
          }
        });
      };

      findMatches(fields);

      return matchingPaths;
    },
    []
  );

  // Get matching paths for auto-expansion when search is active
  const matchingFieldPaths = useMemo(() => {
    if (externalFilterState?.fieldName && fields) {
      return getMatchingFieldPaths(fields, externalFilterState.fieldName.toLowerCase());
    }

    return [];
  }, [fields, externalFilterState?.fieldName, getMatchingFieldPaths]);

  return {
    filteredFields,
    hasActiveFilters,
    detectCustomization,
    matchingFieldPaths, // New property for auto-expansion
  };
}
