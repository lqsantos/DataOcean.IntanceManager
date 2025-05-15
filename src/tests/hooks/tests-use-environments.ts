import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useEnvironments } from '@/hooks/use-environments';
import { EnvironmentService } from '@/services/environment-service';

// Mock the EnvironmentService
vi.mock('@/services/environment-service', () => ({
  EnvironmentService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Sample test data
const mockEnvironments = [
  {
    id: '1',
    name: 'Production',
    slug: 'prod',
    order: 1,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Development',
    slug: 'dev',
    order: 2,
    createdAt: '2023-01-02T00:00:00Z',
  },
];

describe('useEnvironments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for getAll
    (EnvironmentService.getAll as any).mockResolvedValue(mockEnvironments);
  });

  it('fetches environments on initialization', async () => {
    const { result } = renderHook(() => useEnvironments());

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the loading to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have fetched environments
    expect(EnvironmentService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.environments).toEqual(mockEnvironments);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error correctly', async () => {
    // Mock getAll to reject with an error
    (EnvironmentService.getAll as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEnvironments());

    // Wait for the loading to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.environments).toEqual([]);
  });

  it('refreshes environments correctly', async () => {
    const { result } = renderHook(() => useEnvironments());

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock getAll to return different data on refresh
    const updatedEnvironments = [
      ...mockEnvironments,
      {
        id: '3',
        name: 'Staging',
        slug: 'staging',
        order: 3,
        createdAt: '2023-01-03T00:00:00Z',
      },
    ];

    (EnvironmentService.getAll as any).mockResolvedValue(updatedEnvironments);

    // Trigger refresh
    await act(async () => {
      await result.current.refreshEnvironments();
    });

    // Should have refetched environments
    expect(EnvironmentService.getAll).toHaveBeenCalledTimes(2);
    expect(result.current.environments).toEqual(updatedEnvironments);
  });

  it('creates a new environment correctly', async () => {
    const newEnvironment = {
      id: '3',
      name: 'Staging',
      slug: 'staging',
      order: 3,
      createdAt: '2023-01-03T00:00:00Z',
    };

    (EnvironmentService.create as any).mockResolvedValue(newEnvironment);

    const { result } = renderHook(() => useEnvironments());

    // Wait for initial loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Create a new environment
    await act(async () => {
      await result.current.createEnvironment({ name: 'Staging', slug: 'staging', order: 3 });
    });

    // Service should have been called with correct data
    expect(EnvironmentService.create).toHaveBeenCalledWith({
      name: 'Staging',
      slug: 'staging',
      order: 3,
    });

    // New environment should be added to the list
    expect(result.current.environments).toContainEqual(newEnvironment);
  });

  it('updates an environment correctly', async () => {
    const updatedEnvironment = {
      ...mockEnvironments[0],
      name: 'Updated Production',
    };

    (EnvironmentService.update as any).mockResolvedValue(updatedEnvironment);

    const { result } = renderHook(() => useEnvironments());

    // Wait for initial loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update an environment
    await act(async () => {
      await result.current.updateEnvironment('1', { name: 'Updated Production' });
    });

    // Service should have been called with correct data
    expect(EnvironmentService.update).toHaveBeenCalledWith('1', { name: 'Updated Production' });

    // Environment should be updated in the list
    expect(result.current.environments.find((env) => env.id === '1')).toEqual(updatedEnvironment);
  });

  it('deletes an environment correctly', async () => {
    (EnvironmentService.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEnvironments());

    // Wait for initial loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Delete an environment
    await act(async () => {
      await result.current.deleteEnvironment('1');
    });

    // Service should have been called with correct id
    expect(EnvironmentService.delete).toHaveBeenCalledWith('1');

    // Environment should be removed from the list
    expect(result.current.environments.find((env) => env.id === '1')).toBeUndefined();
    expect(result.current.environments.length).toBe(1);
  });
});
