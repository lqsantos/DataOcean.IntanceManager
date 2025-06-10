'use client';

import { useCallback, useEffect, useState } from 'react';

// Definição local do tipo para evitar conflitos
export interface BlueprintChildTemplate {
  templateId: string;
  identifier: string;
  order: number;
  defaultValues?: Record<string, unknown>;
}

export type TemplateViewMode = 'list' | 'card' | 'hierarchy';

/**
 * Custom hook to manage template selection, ordering, and view mode
 * @param initialTemplates - Initial list of templates
 */
export function useTemplateSelection(initialTemplates: BlueprintChildTemplate[] = []) {
  const [selectedTemplates, setSelectedTemplates] = useState<BlueprintChildTemplate[]>([]);

  // Syncronizar templates quando eles mudam externamente
  useEffect(() => {
    // Comparar JSON stringified para deep comparison
    const currentJSON = JSON.stringify(selectedTemplates);
    const initialJSON = JSON.stringify(initialTemplates);

    // Só atualizamos quando os initialTemplates mudam e são diferentes dos nossos
    if (initialJSON !== currentJSON && initialTemplates.length > 0) {
      setSelectedTemplates(initialTemplates);
    }
  }, [initialTemplates]);

  // View mode state for different template visualization options
  const [viewMode, setViewMode] = useState<TemplateViewMode>('list');

  /**
   * Add a template to the selection list
   */
  const addTemplate = useCallback((template: { id: string; name: string }) => {
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
        },
      ];
    });

    return finalIdentifier;
  }, []);

  /**
   * Remove a template from the selection
   */
  const removeTemplate = useCallback((index: number) => {
    setSelectedTemplates((prevTemplates) => {
      const newTemplates = [...prevTemplates];

      newTemplates.splice(index, 1);

      // Reorder remaining templates to ensure sequential order
      return newTemplates.map((template, idx) => ({
        ...template,
        order: idx + 1,
      }));
    });
  }, []);

  /**
   * Update the identifier of a template
   */
  const updateTemplateIdentifier = useCallback(
    (index: number, newIdentifier: string): boolean => {
      // Validate the identifier format
      if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(newIdentifier)) {
        return false;
      }

      // Verificar se o identificador é único
      let isIdUnique = true;

      setSelectedTemplates((prevTemplates) => {
        // Verificar se o identificador já existe em outro template
        const hasDuplicate = prevTemplates.some(
          (t, idx) => idx !== index && t.identifier === newIdentifier
        );

        if (hasDuplicate) {
          isIdUnique = false;

          return prevTemplates; // Não modifica o estado se não for único
        }

        isIdUnique = true;

        // Update the identifier if unique
        return prevTemplates.map((template, idx) =>
          idx === index ? { ...template, identifier: newIdentifier } : template
        );
      });

      return isIdUnique;
    },
    [] // Sem dependências para evitar o loop infinito
  );

  /**
   * Reorder templates via drag and drop
   */
  const reorderTemplates = useCallback((startIndex: number, endIndex: number) => {
    setSelectedTemplates((prevTemplates) => {
      const newTemplates = [...prevTemplates];
      const [removed] = newTemplates.splice(startIndex, 1);

      newTemplates.splice(endIndex, 0, removed);

      // Update order values after reordering
      return newTemplates.map((template, idx) => ({
        ...template,
        order: idx + 1,
      }));
    });
  }, []);

  return {
    selectedTemplates,
    addTemplate,
    removeTemplate,
    updateTemplateIdentifier,
    reorderTemplates,
    viewMode,
    setViewMode,
  };
}
