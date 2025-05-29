'use client';

import { Plus } from 'lucide-react';

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
import { ValidateTemplateModal } from './validate-template-modal';

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

  // Custom header action component
  const CustomHeaderAction = () => (
    <Button onClick={openModal} className="gap-2" data-testid="new-resource-template-button">
      <Plus className="h-4 w-4" />
      Novo Template
    </Button>
  );

  const handleValidateTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      await validateTemplate(templateId, template.name);

      return true;
    }

    return false;
  };

  return (
    <div
      data-testid="resource-templates-page-container"
      data-page-state={isLoading ? 'loading' : error ? 'error' : 'loaded'}
      data-templates-count={templates.length}
    >
      <EntityPage<Template, CreateTemplateDto, UpdateTemplateDto>
        entities={templates}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshTemplates}
        createEntity={createTemplate}
        updateEntity={updateTemplate}
        deleteEntity={deleteTemplate}
        EntityTable={ResourceTemplatesTable}
        EntityForm={ResourceTemplateForm}
        entityName={{
          singular: 'Template',
          plural: 'Templates',
          description: 'Gerencie seus templates Helm para padronização de implantações',
        }}
        testIdPrefix="resource-templates"
        tableProps={{
          templates,
          validateTemplate: handleValidateTemplate,
          'data-testid': 'resource-templates-table',
          DeleteDialog: DeleteResourceTemplateDialog,
        }}
        formProps={{
          'data-testid': 'resource-template-form',
        }}
        entityPropName="template"
        customHeaderAction={<CustomHeaderAction />}
        hideCreateButton={true}
      />
      <ValidateTemplateModal />
      <CreateTemplateModal />
    </div>
  );
}
