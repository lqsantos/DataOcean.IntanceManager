// hooks/use-clusters.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ClusterService } from '@/services/cluster-service';
import type { Cluster } from '@/types/cluster';

import { useClusters } from '../use-clusters';

// Mock the ClusterService
vi.mock('@/services/cluster-service', () => ({
  ClusterService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the logError function
vi.mock('@/utils/errorLogger', () => ({
  logError: vi.fn(),
}));

describe('useClusters', () => {
  const mockClusters: Cluster[] = [
    {
      id: '1',
      name: 'Cluster 1',
      slug: 'cluster-1',
      description: 'Description for Cluster 1',
      locationIds: ['loc1', 'loc2'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Cluster 2',
      slug: 'cluster-2',
      description: 'Description for Cluster 2',
      locationIds: ['loc3'],
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (ClusterService.getAll as any).mockResolvedValue(mockClusters);
  });

  it('should fetch clusters on mount', async () => {
    const { result } = renderHook(() => useClusters());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(ClusterService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.clusters).toEqual(mockClusters);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching clusters fails', async () => {
    const errorMessage = 'Failed to fetch';

    (ClusterService.getAll as any).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useClusters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(errorMessage);
  });

  it('should create cluster', async () => {
    const newCluster = {
      id: '3',
      name: 'New Cluster',
      slug: 'new-cluster',
      description: 'New Cluster Description',
      locationIds: ['loc1'],
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    };

    (ClusterService.create as any).mockResolvedValueOnce(newCluster);

    const { result } = renderHook(() => useClusters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createCluster({
        name: 'New Cluster',
        slug: 'new-cluster',
        description: 'New Cluster Description',
        locationIds: ['loc1'],
      });
    });

    expect(ClusterService.create).toHaveBeenCalledWith({
      name: 'New Cluster',
      slug: 'new-cluster',
      description: 'New Cluster Description',
      locationIds: ['loc1'],
    });

    expect(result.current.clusters).toContainEqual(newCluster);
  });

  it('should update cluster', async () => {
    const updatedCluster = {
      ...mockClusters[0],
      name: 'Updated Cluster',
      description: 'Updated Description',
    };

    (ClusterService.update as any).mockResolvedValueOnce(updatedCluster);

    const { result } = renderHook(() => useClusters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateCluster('1', {
        name: 'Updated Cluster',
        description: 'Updated Description',
      });
    });

    expect(ClusterService.update).toHaveBeenCalledWith('1', {
      name: 'Updated Cluster',
      description: 'Updated Description',
    });

    expect(result.current.clusters[0]).toEqual(updatedCluster);
  });

  it('should delete cluster', async () => {
    (ClusterService.delete as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useClusters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteCluster('1');
    });

    expect(ClusterService.delete).toHaveBeenCalledWith('1');
    expect(result.current.clusters).toHaveLength(1);
    expect(result.current.clusters[0].id).toBe('2');
  });

  it('should refresh clusters', async () => {
    const { result } = renderHook(() => useClusters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refreshClusters();
    });

    expect(ClusterService.getAll).toHaveBeenCalledTimes(2);
  });
});
