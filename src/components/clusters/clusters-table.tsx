// components/clusters/clusters-table.tsx
'use client';

import type { Column } from '@/components/ui/entity-table';
import { EntityTable } from '@/components/ui/entity-table';
import { useLocations } from '@/hooks/use-locations';
import type { Cluster } from '@/types/cluster';

import { DeleteClusterDialog } from './delete-cluster-dialog';

interface ClustersTableProps {
  clusters?: Cluster[];
  entities?: Cluster[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (cluster: Cluster) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ClustersTable({
  clusters,
  entities,
  isLoading,
  isRefreshing,
  onEdit,
  onDelete,
}: ClustersTableProps) {
  const { locations } = useLocations();
  
  // Usar entities se clusters não for fornecido
  const items = clusters || entities || [];

  // Get location names by ids
  const getLocationNames = (locationIds: string[]) => {
    return locationIds
      .map((id) => locations.find((loc) => loc.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Definir as colunas da tabela
  const columns: Column<Cluster>[] = [
    { 
      key: 'name', 
      title: 'Nome',
      sortable: true
    },
    { 
      key: 'slug', 
      title: 'Slug',
      sortable: true
    },
    { 
      key: 'description', 
      title: 'Descrição',
      render: (cluster) => (
        <div className="max-w-[300px] truncate">
          {cluster.description || <span className="italic text-muted-foreground">Nenhuma</span>}
        </div>
      )
    },
    {
      key: 'locations',
      title: 'Localidades',
      render: (cluster) => (
        <div className="max-w-[300px] truncate">
          {getLocationNames(cluster.locationIds) || (
            <span className="italic text-muted-foreground">Nenhuma</span>
          )}
        </div>
      )
    },
    { 
      key: 'createdAt', 
      title: 'Criado em',
      sortable: true
    }
  ];

  return (
    <EntityTable<Cluster>
      entities={items}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onEdit={onEdit}
      onDelete={onDelete}
      columns={columns}
      DeleteDialog={DeleteClusterDialog}
      searchPlaceholder="Buscar clusters..."
      emptySearchMessage="Nenhum cluster encontrado para a pesquisa atual."
      emptyMessage="Nenhum cluster cadastrado."
      testIdPrefix="cluster"
    />
  );
}
