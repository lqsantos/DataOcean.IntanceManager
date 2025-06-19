'use client';

import { useTranslation } from 'react-i18next';

import type { Column } from '@/components/entities/entity-table';
import { EntityTable } from '@/components/entities/entity-table';
import type { Location } from '@/types/location';

import { DeleteLocationDialog } from './delete-location-dialog';

interface LocationsTableProps {
  locations?: Location[];
  entities?: Location[];
  isLoading: boolean;
  isRefreshing?: boolean;
  _isRefreshing?: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => Promise<void>;
}

export function LocationsTable({
  locations,
  entities,
  isLoading,
  _isRefreshing,
  isRefreshing,
  onEdit,
  onDelete,
}: LocationsTableProps) {
  const { t } = useTranslation(['settings', 'entityTable']);

  // Usar entities se locations não for fornecido
  const items = locations || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Location>[] = [
    {
      key: 'name',
      title: t('locations.table.columns.name'),
      sortable: true,
    },
    {
      key: 'slug',
      title: 'Slug',
      sortable: true,
    },
    {
      key: 'createdAt',
      title: t('entityTable:columns.createdAt'),
      sortable: true,
    },
  ];

  return (
    <EntityTable<Location>
      entities={items}
      isLoading={isLoading}
      isRefreshing={isRefreshing || _isRefreshing}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      DeleteDialog={DeleteLocationDialog}
      searchPlaceholder={t('locations.table.searchPlaceholder')}
      emptySearchMessage={t('locations.table.emptySearchMessage')}
      emptyMessage={t('locations.table.emptyMessage')}
      testIdPrefix="locations-table"
    />
  );
}
