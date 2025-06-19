'use client';

import { Plus, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EntityPage } from '@/components/entities/entity-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CreateTemplateModalProvider,
  useCreateTemplateModal,
} from '@/contexts/create-template-modal-context';
import {
  TemplateValidationProvider,
  useTemplateValidation,
} from '@/contexts/template-validation-context';
import { useTemplates } from '@/hooks/use-templates';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

import { CreateTemplateModal } from './create-template-modal';
import { DeleteResourceTemplateDialog } from './delete-resource-template-dialog';
import { ResourceTemplateForm } from './resource-template-form';
import { ResourceTemplatesTable } from './resource-templates-table';

export function ResourceTemplatesPage() {
  // Wrap with both required providers
  return (
    <CreateTemplateModalProvider>
      <TemplateValidationProvider>
        <ResourceTemplatesContent />
      </TemplateValidationProvider>
    </CreateTemplateModalProvider>
  );
}

// Create a separate component that uses the contexts
function ResourceTemplatesContent() {
  const { t: tTemplates } = useTranslation('templates');
  const { t: tResources } = useTranslation('resources');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    templates,
    isLoading,
    isRefreshing,
    error,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates();

  const { openModal } = useCreateTemplateModal();
  const { validateTemplate } = useTemplateValidation();

  // Filtrar templates com base na consulta de pesquisa
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return templates;
    }

    const query = searchQuery.toLowerCase();

    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.repositoryUrl.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  const getPageState = () => {
    if (isLoading) {
      return 'loading';
    }

    if (error) {
      return 'error';
    }

    return 'loaded';
  };

  const handleEditTemplate = (templateId: string) => {
    return templates.find((t) => t.id === templateId);
  };

  const handleUpdateTemplate = async (id: string, data: UpdateTemplateDto) => {
    return updateTemplate({ ...data, id });
  };

  const handleValidateTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      await validateTemplate(templateId, template.name);

      return true;
    }

    return false;
  };

  // Type assertion to satisfy the EntityTable props
  const ResourceTemplatesTableTyped = ResourceTemplatesTable as unknown as React.ComponentType<{
    [key: string]: unknown;
    entities: Template[];
    isLoading: boolean;
    isRefreshing: boolean;
    onEdit: (id: string) => Template | undefined;
    onDelete: (id: string) => Promise<void>;
  }>;

  return (
    <div
      data-testid="resource-templates-page-container"
      data-page-state={getPageState()}
      data-templates-count={templates.length}
    >
      <EntityPage<Template, CreateTemplateDto, UpdateTemplateDto>
        entities={filteredTemplates}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error ? error.message : undefined}
        refreshEntities={refreshTemplates}
        createEntity={createTemplate}
        updateEntity={handleUpdateTemplate}
        deleteEntity={deleteTemplate}
        EntityTable={ResourceTemplatesTableTyped}
        EntityForm={ResourceTemplateForm}
        entityName={{
          singular: tTemplates('pageTitle'),
          plural: tTemplates('pageTitle'),
          description: tTemplates('description'),
        }}
        testIdPrefix="resource-templates"
        tableProps={{
          templates: filteredTemplates,
          'data-testid': 'resource-templates-table',
          DeleteDialog: DeleteResourceTemplateDialog,
          onEdit: handleEditTemplate,
          validateTemplate: handleValidateTemplate,
        }}
        formProps={{
          'data-testid': 'resource-template-form',
        }}
        entityPropName="template"
        hideCreateButton={true}
        hideHeader={true}
        customHeaderContent={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={tResources('table.search.placeholder')}
                  className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="templates-search-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={refreshTemplates}
                disabled={isRefreshing || isLoading}
                data-testid="resource-templates-page-refresh-button"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">{tResources('actions.refresh')}</span>
              </Button>
              <Button
                onClick={openModal}
                className="gap-2"
                data-testid="new-resource-template-button"
              >
                <Plus className="h-4 w-4" />
                {tTemplates('newButton')}
              </Button>
            </div>
          </div>
        }
      />
      <CreateTemplateModal />
    </div>
  );
}
