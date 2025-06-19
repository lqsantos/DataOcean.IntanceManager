'use client';

import { useCallback, useState } from 'react';

import type { BlueprintChildTemplate } from '../types';

/**
 * Custom hook to manage template selection and ordering
 */
export function useTemplateSelection(initialTemplates: BlueprintChildTemplate[] = []) {
  const [selectedTemplates, setSelectedTemplates] =
    useState<BlueprintChildTemplate[]>(initialTemplates);

  /**
   * Add a template to the selection list
   */
  const addTemplate = useCallback(
    (template: { id: string; name: string }) => {
      let finalIdentifier = '';

      setSelectedTemplates((prevTemplates) => {
        // Create a unique identifier based on template name
        let baseIdentifier = template.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        // If a template with this identifier already exists, add a number
        const existingIds = prevTemplates.map((t) => t.identifier);

        if (existingIds.includes(baseIdentifier)) {
          let counter = 1;

          while (existingIds.includes(`${baseIdentifier}-${counter}`)) {
            counter++;
          }
          baseIdentifier = `${baseIdentifier}-${counter}`;
        }

        finalIdentifier = baseIdentifier;

        // Add to the list with the next available order
        const nextOrder =
          prevTemplates.length > 0 ? Math.max(...prevTemplates.map((t) => t.order)) + 1 : 1;

        return [
          ...prevTemplates,
          {
            templateId: template.id,
            identifier: baseIdentifier,
            order: nextOrder,
            overrideValues: '',
          },
        ];
      });

      return finalIdentifier;
    },
    [] // Removed selectedTemplates from dependency array since we use the function form of setState
  );

  /**
   * Remove a template from the selection list
   */
  const removeTemplate = useCallback(
    (index: number) => {
      setSelectedTemplates((prevTemplates) => {
        return prevTemplates.filter((_, idx) => idx !== index);
      });
    },
    [] // Removed dependency since we use the function form of setState
  );

  /**
   * Update a template's identifier
   */
  const updateTemplateIdentifier = useCallback(
    (index: number, newIdentifier: string): boolean => {
      let success = true;

      setSelectedTemplates((prevTemplates) => {
        // Check if the new identifier already exists
        if (prevTemplates.some((t, i) => i !== index && t.identifier === newIdentifier)) {
          success = false;

          return prevTemplates; // Don't update if duplicate
        }

        return prevTemplates.map((template, idx) =>
          idx === index ? { ...template, identifier: newIdentifier } : template
        );
      });

      return success;
    },
    [] // Removed dependency since we use the function form of setState
  );

  /**
   * Reorder templates
   */
  const reorderTemplates = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      if (sourceIndex === destinationIndex) {
        return;
      }

      const reorderedItems = [...selectedTemplates];
      const [removed] = reorderedItems.splice(sourceIndex, 1);

      reorderedItems.splice(destinationIndex, 0, removed);

      // Update order numbers after reordering
      const reorderedWithCorrectOrder = reorderedItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setSelectedTemplates(reorderedWithCorrectOrder);
    },
    [selectedTemplates]
  );

  return {
    selectedTemplates,
    setSelectedTemplates,
    addTemplate,
    removeTemplate,
    updateTemplateIdentifier,
    reorderTemplates,
  };
}
