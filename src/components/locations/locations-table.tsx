'use client';

import type { Column } from '@/components/ui/entity-table';
import { EntityTable } from '@/components/ui/entity-table';
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
  // Usar entities se locations não for fornecido
  const items = locations || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Location>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
    },
    {
      key: 'slug',
      title: 'Slug',
      sortable: true,
    },
    {
      key: 'createdAt',
      title: 'Criado em',
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
      searchPlaceholder="Buscar localidades..."
      emptySearchMessage="Nenhuma localidade encontrada para a pesquisa atual."
      emptyMessage="Nenhuma localidade cadastrada."
      testIdPrefix="locations-table"
    />
  );
}
