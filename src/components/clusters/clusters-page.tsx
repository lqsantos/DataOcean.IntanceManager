// components/clusters/clusters-page.tsx
'use client';

import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clusterToEdit, setClusterToEdit] = useState<Cluster | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (data: CreateClusterDto) => {
    setIsSubmitting(true);

    try {
      await createCluster(data);
      setIsCreateDialogOpen(false);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Error already handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: UpdateClusterDto) => {
    if (!clusterToEdit) {
      return;
    }
    setIsSubmitting(true);

    try {
      await updateCluster(clusterToEdit.id, data);
      setClusterToEdit(null);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Error already handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in" data-testid="clusters-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clusters</h1>
          <p className="mt-1 text-muted-foreground">Gerencie seus clusters de infraestrutura</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshClusters}
            disabled={isRefreshing || isLoading}
            data-testid="clusters-page-refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="clusters-page-add-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cluster
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" data-testid="clusters-page-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card data-testid="clusters-page-card">
        <CardHeader>
          <CardTitle>Clusters</CardTitle>
        </CardHeader>
        <CardContent>
          <ClustersTable
            clusters={clusters}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onEdit={setClusterToEdit}
            onDelete={deleteCluster}
          />
        </CardContent>
      </Card>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="clusters-page-create-dialog">
          <DialogHeader>
            <DialogTitle>Criar Cluster</DialogTitle>
          </DialogHeader>
          <ClusterForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={!!clusterToEdit} onOpenChange={(open) => !open && setClusterToEdit(null)}>
        <DialogContent className="sm:max-w-[500px]" data-testid="clusters-page-edit-dialog">
          <DialogHeader>
            <DialogTitle>Editar Cluster</DialogTitle>
          </DialogHeader>
          {clusterToEdit && (
            <ClusterForm
              cluster={clusterToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => setClusterToEdit(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
