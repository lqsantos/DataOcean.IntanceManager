// components/clusters/clusters-page.tsx
'use client';

import { EntityPage } from '@/components/entities/entity-page';
import { useClusters } from '@/hooks/use-clusters';
import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';

import { ClusterForm } from './cluster-form';
import { ClustersTable } from './clusters-table';

export function ClustersPage() {
  const {
    clusters,
    isLoading,
    isRefreshing,
    error,
    refreshClusters,
    createCluster,
    updateCluster,
    deleteCluster,
  } = useClusters();

  return (
    <div data-testid="clusters-container">
      <EntityPage<Cluster, CreateClusterDto, UpdateClusterDto>
        entities={clusters}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        refreshEntities={refreshClusters}
        createEntity={createCluster}
        updateEntity={updateCluster}
        deleteEntity={deleteCluster}
        EntityTable={ClustersTable}
        EntityForm={ClusterForm}
        entityName={{
          singular: 'Cluster',
          plural: 'Clusters',
          description: 'Gerencie seus clusters de infraestrutura',
        }}
        testIdPrefix="clusters"
        tableProps={{
          clusters,
          'data-testid': 'clusters-table',
        }}
        formProps={{
          'data-testid': 'cluster-form',
        }}
        entityPropName="cluster"
      />
    </div>
  );
}
