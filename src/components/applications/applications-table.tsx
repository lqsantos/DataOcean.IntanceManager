// components/applications/applications-table.tsx
'use client';

import { useTranslation } from 'react-i18next';

import type { Column } from '@/components/entities/entity-table';
import { EntityTable } from '@/components/entities/entity-table';
import type { Application } from '@/types/application';

import { DeleteApplicationDialog } from './delete-application-dialog';

interface ApplicationsTableProps {
  applications?: Application[];
  entities?: Application[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ApplicationsTable({
  applications,
  entities,
  isLoading,
  isRefreshing,
  onEdit,
  onDelete,
}: ApplicationsTableProps) {
  const { t } = useTranslation(['settings', 'entityTable']);

  // Usar entities se applications não for fornecido
  const items = applications || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Application>[] = [
    {
      key: 'name',
      title: t('applications.table.columns.name'),
      sortable: true,
    },
    {
      key: 'slug',
      title: 'Slug',
      sortable: true,
    },
    {
      key: 'description',
      title: t('applications.table.columns.description'),
      render: (application) => (
        <div className="max-w-[300px] truncate">{application.description}</div>
      ),
    },
    {
      key: 'createdAt',
      title: t('entityTable:columns.createdAt'),
      sortable: true,
    },
  ];

  return (
    <EntityTable<Application>
      entities={items}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      DeleteDialog={DeleteApplicationDialog}
      searchPlaceholder={t('applications.table.searchPlaceholder')}
      emptySearchMessage={t('applications.table.emptySearchMessage')}
      emptyMessage={t('applications.table.emptyMessage')}
      testIdPrefix="application"
    />
  );
}
