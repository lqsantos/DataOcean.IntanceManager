// components/environments/environments-page.tsx
'use client';

import { EntityPage } from '@/components/ui/entity-page';
import { useEnvironments } from '@/hooks/use-environments';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

import { EnvironmentForm } from './environment-form';
import { EnvironmentsTable } from './environments-table';

export function EnvironmentsPage() {
  const {
    environments,
    isLoading,
    isRefreshing,
    error,
    refreshEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useEnvironments();

  return (
    <div data-testid="environments-container">
      <EntityPage<Environment, CreateEnvironmentDto, UpdateEnvironmentDto>
        entities={environments}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshEnvironments}
        createEntity={createEnvironment}
        updateEntity={updateEnvironment}
        deleteEntity={deleteEnvironment}
        EntityTable={EnvironmentsTable}
        EntityForm={EnvironmentForm}
        entityName={{
          singular: 'Ambiente',
          plural: 'Ambientes',
          description: 'Gerencie seus ambientes de implantação',
        }}
        testIdPrefix="environments"
        tableProps={{
          environments,
          'data-testid': 'environments-table',
        }}
        formProps={{
          'data-testid': 'environment-form',
        }}
      />
    </div>
  );
}
