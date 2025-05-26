// components/environments/environments-table.tsx
'use client';

import { useTranslation } from 'react-i18next';

import type { Column } from '@/components/entities/entity-table';
import { EntityTable } from '@/components/entities/entity-table';
import type { Environment } from '@/types/environment';

import { DeleteEnvironmentDialog } from './delete-environment-dialog';

interface EnvironmentsTableProps {
  environments?: Environment[];
  entities?: Environment[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (environment: Environment) => void;
  onDelete: (id: string) => Promise<void>;
}

export function EnvironmentsTable({
  environments,
  entities,
  isLoading,
  isRefreshing,
  onEdit,
  onDelete,
}: EnvironmentsTableProps) {
  const { t } = useTranslation(['settings', 'entityTable']);

  // Usar entities se environments não for fornecido
  const items = environments || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Environment>[] = [
    {
      key: 'name',
      title: t('environments.table.columns.name'),
      sortable: true,
    },
    {
      key: 'slug',
      title: 'Slug',
      sortable: true,
    },
    {
      key: 'description',
      title: t('environments.table.columns.description'),
      render: (environment) => (
        <div className="max-w-[300px] truncate">{environment.description}</div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      sortable: true,
    },
  ];

  return (
    <EntityTable<Environment>
      entities={items}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      DeleteDialog={DeleteEnvironmentDialog}
      searchPlaceholder={t('environments.table.searchPlaceholder')}
      emptySearchMessage={t('environments.table.emptySearchMessage')}
      emptyMessage={t('environments.table.emptyMessage')}
      testIdPrefix="environment"
    />
  );
}
