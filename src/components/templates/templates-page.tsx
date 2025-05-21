'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { EntityPage } from '@/components/entities/entity-page';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/hooks/use-templates';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

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

  // Componente de ação personalizada para o cabeçalho
  const CustomHeaderAction = () => (
    <Button asChild className="gap-2">
      <Link href="/templates/new" data-testid="new-template-button">
        <Plus className="h-4 w-4" />
        Novo Template
      </Link>
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
    </div>
  );
}
