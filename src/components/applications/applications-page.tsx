// components/applications/applications-page.tsx
'use client';

import { EntityPage } from '@/components/ui/entity-page';
import { useApplications } from '@/hooks/use-applications';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

import { ApplicationForm } from './application-form';
import { ApplicationsTable } from './applications-table';

export function ApplicationsPage() {
  const {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();

  return (
    <div data-testid="applications-container">
      <EntityPage<Application, CreateApplicationDto, UpdateApplicationDto>
        entities={applications}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshApplications}
        createEntity={createApplication}
        updateEntity={updateApplication}
        deleteEntity={deleteApplication}
        EntityTable={ApplicationsTable}
        EntityForm={ApplicationForm}
        entityName={{
          singular: 'Aplicação',
          plural: 'Aplicações',
          description: 'Gerencie suas aplicações',
        }}
        testIdPrefix="applications"
        tableProps={{
          applications,
          'data-testid': 'applications-table',
        }}
        formProps={{
          'data-testid': 'application-form',
        }}
      />
    </div>
  );
}
