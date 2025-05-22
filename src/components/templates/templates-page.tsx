'use client';

import { Plus } from 'lucide-react';

import { EntityPage } from '@/components/entities/entity-page';
import { Button } from '@/components/ui/button';
import { useCreateTemplateModal } from '@/contexts/create-template-modal-context';
import { useTemplates } from '@/hooks/use-templates';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

import { CreateTemplateModal } from './create-template-modal';
import { DeleteTemplateDialog } from './delete-template-dialog';
import { PATChecker } from './pat-checker';
import { TemplateForm } from './template-form';
import { TemplatesTable } from './templates-table';

export function TemplatesPage() {
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

  // Componente de ação personalizada para o cabeçalho
  const CustomHeaderAction = () => (
    <Button onClick={openModal} className="gap-2" data-testid="new-template-button">
      <Plus className="h-4 w-4" />
      Novo Template
    </Button>
  );

  return (
    <div
      data-testid="templates-page-container"
      data-page-state={isLoading ? 'loading' : error ? 'error' : 'loaded'}
      data-templates-count={templates.length}
    >
      <PATChecker data-testid="templates-page-pat-checker" />
      <EntityPage<Template, CreateTemplateDto, UpdateTemplateDto>
        entities={templates}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshTemplates}
        createEntity={createTemplate}
        updateEntity={updateTemplate}
        deleteEntity={deleteTemplate}
        EntityTable={TemplatesTable}
        EntityForm={TemplateForm}
        entityName={{
          singular: 'Template',
          plural: 'Templates',
          description: 'Gerencie seus templates para padronização de implantações',
        }}
        testIdPrefix="templates"
        tableProps={{
          templates,
          'data-testid': 'templates-table',
          DeleteDialog: DeleteTemplateDialog,
        }}
        formProps={{
          'data-testid': 'template-form',
        }}
        entityPropName="template"
        customHeaderAction={<CustomHeaderAction />}
        hideCreateButton={true} // Esconde o botão padrão de criação já que usamos nosso próprio botão
      />
      <CreateTemplateModal />
    </div>
  );
}
