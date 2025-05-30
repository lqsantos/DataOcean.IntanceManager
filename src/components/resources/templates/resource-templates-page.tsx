'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EntityPage } from '@/components/entities/entity-page';
import { Button } from '@/components/ui/button';
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
        entities={templates}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error ? error.message : undefined} // Only pass error message if error exists
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
          templates,
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
        customHeaderAction={
          <Button onClick={openModal} className="gap-2" data-testid="new-resource-template-button">
            <Plus className="h-4 w-4" />
            {tTemplates('newButton')}
          </Button>
        }
      />
      <CreateTemplateModal />
    </div>
  );
}
