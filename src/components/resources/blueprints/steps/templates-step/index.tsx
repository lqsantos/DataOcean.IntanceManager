'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { useTemplates } from '@/hooks/use-templates';

import { useTemplateSelection } from '../../hooks/use-template-selection';
import type { FormValues } from '../../types';

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

  // State for search and filter
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Get form values
  const formTemplates = form.getValues('selectedTemplates') || [];

  // Template selection hook
  const {
    selectedTemplates,
    addTemplate,
    removeTemplate,
    updateTemplateIdentifier,
    updateTemplateOverrides,
    reorderTemplates,
  } = useTemplateSelection(formTemplates);

  // Extract unique categories
  const templateCategories = Array.from(
    new Set(templates.map((template) => template.category).filter(Boolean))
  );

  // Update form value when selectedTemplates change
  const updateFormTemplates = () => {
    form.setValue('selectedTemplates', selectedTemplates);
  };

  // Get template name from ID
  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);

    return template ? template.name : 'Template desconhecido';
  };

  // Filter catalog templates
  const filteredCatalogTemplates = templates
    .filter((template) => template.isActive)
    .filter((template) => {
      // Category filter
      if (selectedCategoryFilter && template.category !== selectedCategoryFilter) {
        return false;
      }

      // Search text filter
      if (templateSearchQuery) {
        const searchLower = templateSearchQuery.toLowerCase();
        const nameMatch = template.name.toLowerCase().includes(searchLower);
        const descMatch = (template.description || '').toLowerCase().includes(searchLower);
        const categoryMatch = (template.category || '').toLowerCase().includes(searchLower);

        return nameMatch || descMatch || categoryMatch;
      }

      return true;
    });

  // Handle dragdrop events
  const handleDragEnd = (result: any) => {
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
        updateFormTemplates();
      }

      return;
    }

    // Handle reordering within selected templates
    if (
      result.source.droppableId === 'selected-templates' &&
      result.destination.droppableId === 'selected-templates'
    ) {
      reorderTemplates(result.source.index, result.destination.index);
      updateFormTemplates();
    }
  };

  // Handle add template
  const handleAddTemplate = (template: any) => {
    addTemplate(template);
    updateFormTemplates();
  };

  // Handle remove template
  const handleRemoveTemplate = (index: number) => {
    removeTemplate(index);
    updateFormTemplates();
  };

  // Handle update identifier
  const handleUpdateIdentifier = (index: number, identifier: string) => {
    const result = updateTemplateIdentifier(index, identifier);

    updateFormTemplates();

    return result;
  };

  // Handle update overrides
  const handleUpdateOverrides = (index: number, overrides: string) => {
    updateTemplateOverrides(index, overrides);
    updateFormTemplates();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Templates Associados</h2>
        <p className="text-sm text-muted-foreground">
          Selecione os templates que farão parte deste blueprint.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TemplateCatalog
            templates={filteredCatalogTemplates}
            isLoading={templatesLoading}
            searchQuery={templateSearchQuery}
            setSearchQuery={setTemplateSearchQuery}
            selectedCategory={selectedCategoryFilter}
            setSelectedCategory={setSelectedCategoryFilter}
            onAddTemplate={handleAddTemplate}
            categories={templateCategories}
          />
          <SelectedTemplatesList
            selectedTemplates={selectedTemplates}
            onRemoveTemplate={handleRemoveTemplate}
            onUpdateIdentifier={handleUpdateIdentifier}
            onUpdateOverrides={handleUpdateOverrides}
            getTemplateName={getTemplateName}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
