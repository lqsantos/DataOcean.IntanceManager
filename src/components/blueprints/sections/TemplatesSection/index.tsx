'use client';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useEffect, useRef } from 'react';

import { useBlueprintForm } from '@/contexts/blueprint-form-context';
import { useTemplateSelection } from '@/hooks/blueprint';
import { useTemplates } from '@/hooks/use-templates';

import { SelectedTemplatesList } from './SelectedTemplatesList';
import { TemplateCatalog } from './TemplateCatalog';

/**
 * TemplatesSection - A section for selecting and organizing templates in the blueprint creation/edition flow
 *
 * This component allows users to:
 * 1. Browse available templates
 * 2. Search and filter templates
 * 3. Add templates to the blueprint via drag & drop or clicking
 * 4. Organize templates in a specific order
 * 5. Add unique identifiers to each template
 */
export function TemplatesSection() {
  const { state, updateSection, validateSection, markSectionComplete, markSectionDirty } =
    useBlueprintForm();

  // Get templates from the state
  const selectedTemplatesFromState = state.formData.templates?.selectedTemplates || [];

  // Fetch all available templates from API
  const { templates, isLoading: templatesLoading } = useTemplates();

  // Garantir que a seção de metadados esteja marcada como concluída
  useEffect(() => {
    if (state.formData.metadata?.name && state.formData.metadata?.version) {
      validateSection('metadata');
      markSectionComplete('metadata', true);
    }
  }, [state.formData.metadata, validateSection, markSectionComplete]);

  // Template selection hook to manage the selected templates
  const {
    selectedTemplates,
    addTemplate,
    removeTemplate,
    updateTemplateIdentifier,
    reorderTemplates,
  } = useTemplateSelection(selectedTemplatesFromState);

  // Inicializar estado da seção, marcando metadata como concluída e templates como válida se já tiver templates
  useEffect(() => {
    // Tentar validar a seção quando o componente é montado
    if (selectedTemplates.length > 0) {
      validateSection('templates');
      markSectionComplete('templates', true);
    }
  }, [validateSection, markSectionComplete, selectedTemplates.length]);

  // Track previous state to prevent unnecessary updates
  const prevSelectedTemplatesRef = useRef<string>(JSON.stringify(selectedTemplates));

  // Update form state when selected templates change
  useEffect(() => {
    // Convert to JSON strings for deep comparison
    const currentTemplatesJSON = JSON.stringify(selectedTemplates);
    const stateTemplatesJSON = JSON.stringify(selectedTemplatesFromState);

    // Skip if this is the initial load and templates are the same
    if (stateTemplatesJSON === currentTemplatesJSON) {
      return;
    }

    // Skip if templates haven't actually changed since last update
    if (prevSelectedTemplatesRef.current === currentTemplatesJSON) {
      return;
    }

    // Update ref with current value to track changes
    prevSelectedTemplatesRef.current = currentTemplatesJSON;

    // Update the global state with the new templates
    const updatedTemplates = selectedTemplates.map((template, index) => ({
      ...template,
      order: index + 1, // Ensure correct order
    }));

    updateSection('templates', updatedTemplates);

    // Marcar a seção como "suja" para indicar que houve alteração
    markSectionDirty('templates');

    // Validar a seção após atualizar os dados
    // Se houver pelo menos um template selecionado, a seção está válida
    if (selectedTemplates.length > 0) {
      validateSection('templates');
      markSectionComplete('templates', true);
    } else {
      markSectionComplete('templates', false);
    }
  }, [
    selectedTemplates,
    selectedTemplatesFromState,
    updateSection,
    validateSection,
    markSectionComplete,
    markSectionDirty,
  ]);

  // Get template name from ID
  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);

    return template ? template.name : 'Unknown template';
  };

  // Handle drag and drop events
  const handleDragEnd = (result: DropResult) => {
    // Ignore if no destination
    if (!result.destination) {
      return;
    }

    // Handle drag from catalog to selected
    if (
      result.source.droppableId === 'template-catalog' &&
      result.destination.droppableId === 'selected-templates'
    ) {
      const templateId = result.draggableId;
      const template = templates.find((t) => t.id === templateId);

      if (template) {
        addTemplate(template);
        // Marcar seção como concluída quando um template for adicionado
        validateSection('templates');
        markSectionComplete('templates', true);
      }

      return;
    }

    // Handle reordering of selected templates
    if (
      result.source.droppableId === 'selected-templates' &&
      result.destination.droppableId === 'selected-templates'
    ) {
      reorderTemplates(result.source.index, result.destination.index);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" data-testid="templates-section">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <TemplateCatalog
              templates={templatesLoading ? [] : templates}
              isLoading={templatesLoading}
              onAddTemplate={addTemplate}
              selectedTemplateIds={selectedTemplates.map((t) => t.templateId)}
            />
          </div>
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SelectedTemplatesList
              selectedTemplates={selectedTemplates}
              onRemoveTemplate={removeTemplate}
              onUpdateIdentifier={updateTemplateIdentifier}
              getTemplateName={getTemplateName}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
