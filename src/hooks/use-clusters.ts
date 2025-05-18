// hooks/use-clusters.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

import { ClusterService } from '@/services/cluster-service';
import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';
import { errorLogger } from '@/utils/errorLogger';

export function useClusters() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusters = useCallback(async () => {
    try {
      const data = await ClusterService.getAll();

      setClusters(data);
      setError(null);
    } catch (err) {
      errorLogger(err, 'Failed to fetch clusters');
      setError(err instanceof Error ? err.message : 'Falha ao carregar clusters');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshClusters = useCallback(async () => {
    setIsRefreshing(true);
    await fetchClusters();
  }, [fetchClusters]);

  const createCluster = useCallback(async (data: CreateClusterDto) => {
    try {
      const newCluster = await ClusterService.create(data);

      setClusters((prev) => [...prev, newCluster]);

      return newCluster;
    } catch (err) {
      errorLogger(err, 'Failed to create cluster');
      throw err;
    }
  }, []);

  const updateCluster = useCallback(async (id: string, data: UpdateClusterDto) => {
    try {
      const updatedCluster = await ClusterService.update(id, data);

      setClusters((prev) => prev.map((cluster) => (cluster.id === id ? updatedCluster : cluster)));

      return updatedCluster;
    } catch (err) {
      errorLogger(err, 'Failed to update cluster');
      throw err;
    }
  }, []);

  const deleteCluster = useCallback(async (id: string) => {
    try {
      await ClusterService.delete(id);
      setClusters((prev) => prev.filter((cluster) => cluster.id !== id));
    } catch (err) {
      errorLogger(err, 'Failed to delete cluster');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return {
    clusters,
    isLoading,
    isRefreshing,
    error,
    refreshClusters,
    createCluster,
    updateCluster,
    deleteCluster,
  };
}
