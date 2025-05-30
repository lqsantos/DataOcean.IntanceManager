// components/clusters/clusters-page.tsx
'use client';

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useClusterModal } from '@/contexts/modal-manager-context';
import { useClusters } from '@/hooks/use-clusters';
import type { Cluster } from '@/types/cluster';

import { ClustersTable } from './clusters-table';
import { CreateClusterModal } from './create-cluster-modal';

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
  const { isOpen, clusterToEdit, openModal, openEditModal, closeModal } = useClusterModal();

  const handleEdit = (cluster: Cluster) => {
    openEditModal(cluster);
  };

  return (
    <div className="space-y-4" data-testid="clusters-container">
      <div className="flex items-center justify-end">
        <Button onClick={openModal} className="gap-2" data-testid="clusters-page-add-button">
          <PlusCircle className="h-4 w-4" />
          Adicionar Cluster
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-4 text-destructive"
          data-testid="clusters-page-error-alert"
        >
          {error}
        </div>
      )}

      <ClustersTable
        clusters={clusters}
        entities={clusters}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={handleEdit}
        onDelete={deleteCluster}
        data-testid="clusters-table"
      />

      <CreateClusterModal
        isOpen={isOpen}
        onClose={closeModal}
        createCluster={createCluster}
        updateCluster={updateCluster}
        clusterToEdit={clusterToEdit}
        onCreateSuccess={refreshClusters}
      />
    </div>
  );
}
