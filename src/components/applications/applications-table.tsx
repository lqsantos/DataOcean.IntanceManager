// components/applications/applications-table.tsx
'use client';

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
  // Usar entities se applications não for fornecido
  const items = applications || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Application>[] = [
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
      key: 'description',
      title: 'Descrição',
      render: (application) => (
        <div className="max-w-[300px] truncate">{application.description}</div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Criado em',
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
      searchPlaceholder="Buscar aplicações..."
      emptySearchMessage="Nenhuma aplicação encontrada para a pesquisa atual."
      emptyMessage="Nenhuma aplicação cadastrada."
      testIdPrefix="application"
    />
  );
}
