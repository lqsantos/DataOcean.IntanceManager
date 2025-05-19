// components/environments/environments-table.tsx
'use client';

import type { Column } from '@/components/ui/entity-table';
import { EntityTable } from '@/components/ui/entity-table';
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
  // Usar entities se environments não for fornecido
  const items = environments || entities || [];

  // Definir as colunas da tabela
  const columns: Column<Environment>[] = [
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
      searchPlaceholder="Buscar ambientes..."
      emptySearchMessage="Nenhum ambiente encontrado para a pesquisa atual."
      emptyMessage="Nenhum ambiente cadastrado."
      testIdPrefix="environment"
    />
  );
}
