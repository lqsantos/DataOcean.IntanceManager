'use client';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { useTemplates } from '@/hooks/use-templates';

import { useTemplateSelection } from '../../hooks/use-template-selection';
import type { CatalogTemplate, FormValues } from '../../types';

import { SelectedTemplatesList } from './selected-templates';
import { TemplateCatalog } from './template-catalog';

interface TemplatesStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * Second step in blueprint form to select and configure templates
 */
export function TemplatesStep({ form }: TemplatesStepProps) {
  // Fetch templates from API
  const { templates, isLoading: templatesLoading } = useTemplates();

  // State for search
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');

  // Get form values
  const formTemplates = form.getValues('selectedTemplates') || [];

  // Template selection hook
  const {
    selectedTemplates,
    addTemplate,
    removeTemplate,
    updateTemplateIdentifier,
    reorderTemplates,
  } = useTemplateSelection(formTemplates);

  // Use useEffect to update form when selectedTemplates changes
  useEffect(() => {
    const updatedTemplates = selectedTemplates.map((template, index) => ({
      ...template,
      order: index + 1, // Ensure correct order
    }));

    form.setValue('selectedTemplates', updatedTemplates, { shouldValidate: true });
  }, [selectedTemplates, form]);

  // Get template name from ID
  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);

    return template ? template.name : 'Unknown template';
  };

  // Filter catalog templates
  const filteredCatalogTemplates = templates
    .filter((template) => template.isActive)
    .filter((template) => {
      if (templateSearchQuery) {
        const searchLower = templateSearchQuery.toLowerCase();
        const nameMatch = template.name.toLowerCase().includes(searchLower);
        const descMatch = (template.description || '').toLowerCase().includes(searchLower);

        return nameMatch || descMatch;
      }

      return true;
    });

  // Handle dragdrop events
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
      const template = filteredCatalogTemplates.find((t) => t.id === templateId);

      if (template) {
        addTemplate(template);
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

  // Handle add template
  const handleAddTemplate = (template: CatalogTemplate) => {
    addTemplate(template);
  };

  // Handle remove template
  const handleRemoveTemplate = (index: number) => {
    removeTemplate(index);
  };

  // Handle update identifier  const handleUpdateIdentifier = (index: number, identifier: string) => {
  const handleUpdateIdentifier = (index: number, identifier: string) => {
    return updateTemplateIdentifier(index, identifier);
  };

  // We always need to wrap our components in DragDropContext
  // otherwise the Droppable components will throw an error

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Templates Associados</h2>
        <p className="text-sm text-muted-foreground">
          Selecione e organize os templates que compõem este blueprint.{' '}
          <span className="text-primary">É necessário selecionar pelo menos um template.</span>
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TemplateCatalog
            templates={templatesLoading ? [] : filteredCatalogTemplates}
            isLoading={templatesLoading}
            searchQuery={templateSearchQuery}
            setSearchQuery={setTemplateSearchQuery}
            onAddTemplate={handleAddTemplate}
          />
          <SelectedTemplatesList
            selectedTemplates={selectedTemplates}
            onRemoveTemplate={handleRemoveTemplate}
            onUpdateIdentifier={handleUpdateIdentifier}
            getTemplateName={getTemplateName}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
