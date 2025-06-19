import { useCallback, useMemo } from 'react';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import type { FilterState } from './types';

export function useSharedFiltering(fields: DefaultValueField[], externalFilterState?: FilterState) {
  const filteredFields = useMemo(() => {
    if (!fields || fields.length === 0) {
      return [];
    }

    const hasFilters = !!(
      externalFilterState?.fieldName ||
      externalFilterState?.exposed ||
      externalFilterState?.overridable ||
      externalFilterState?.customized
    );

    if (!externalFilterState || !hasFilters) {
      return fields;
    }

    const { fieldName, exposed, overridable, customized } = externalFilterState;
    const searchTerm = fieldName ? fieldName.toLowerCase() : '';

    const filterFieldRecursively = (field: DefaultValueField): DefaultValueField | null => {
      let thisNodeMatches = false;

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

        if (thisNodeMatches && overridable && !field.overridable) {
          thisNodeMatches = false;
        }

        if (thisNodeMatches && customized && field.source === ValueSourceType.TEMPLATE) {
          thisNodeMatches = false;
        }
      }

      let filteredChildren: DefaultValueField[] = [];

      if (field.children && field.children.length > 0) {
        filteredChildren = field.children
          .map(filterFieldRecursively)
          .filter((child): child is DefaultValueField => child !== null);
      }

      const shouldInclude = thisNodeMatches || filteredChildren.length > 0;

      if (shouldInclude) {
        return {
          ...field,
          children: filteredChildren,
        };
      }

      return null;
    };

    const result = fields
      .map(filterFieldRecursively)
      .filter((field): field is DefaultValueField => field !== null);

    return result;
  }, [
    fields,
    externalFilterState,
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
    matchingFieldPaths,
  };
}
