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
      // Create a unique identifier based on template name
      let baseIdentifier = template.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // If a template with this identifier already exists, add a number
      const existingIds = selectedTemplates.map((t) => t.identifier);

      if (existingIds.includes(baseIdentifier)) {
        let counter = 1;

        while (existingIds.includes(`${baseIdentifier}-${counter}`)) {
          counter++;
        }
        baseIdentifier = `${baseIdentifier}-${counter}`;
      }

      // Add to the list with the next available order
      const nextOrder =
        selectedTemplates.length > 0 ? Math.max(...selectedTemplates.map((t) => t.order)) + 1 : 1;

      setSelectedTemplates([
        ...selectedTemplates,
        {
          templateId: template.id,
          identifier: baseIdentifier,
          order: nextOrder,
          overrideValues: '',
        },
      ]);

      return baseIdentifier;
    },
    [selectedTemplates]
  );

  /**
   * Remove a template from the selection list
   */
  const removeTemplate = useCallback(
    (index: number) => {
      setSelectedTemplates(selectedTemplates.filter((_, idx) => idx !== index));
    },
    [selectedTemplates]
  );

  /**
   * Update a template's identifier
   */
  const updateTemplateIdentifier = useCallback(
    (index: number, newIdentifier: string): boolean => {
      // Check if the new identifier already exists
      if (selectedTemplates.some((t, i) => i !== index && t.identifier === newIdentifier)) {
        return false; // Don't allow duplicate identifiers
      }

      setSelectedTemplates(
        selectedTemplates.map((template, idx) =>
          idx === index ? { ...template, identifier: newIdentifier } : template
        )
      );

      return true;
    },
    [selectedTemplates]
  );

  /**
   * Update template override values
   */
  const updateTemplateOverrides = useCallback(
    (index: number, overrideValues: string) => {
      setSelectedTemplates(
        selectedTemplates.map((template, idx) =>
          idx === index ? { ...template, overrideValues } : template
        )
      );
    },
    [selectedTemplates]
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
    updateTemplateOverrides,
    reorderTemplates,
  };
}
