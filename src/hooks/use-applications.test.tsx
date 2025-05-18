// hooks/use-applications.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationService } from '@/services/application-service';
import type { Application } from '@/types/application';

import { useApplications } from './use-applications';

// Mock the ApplicationService
vi.mock('@/services/application-service', () => ({
  ApplicationService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the errorLogger
vi.mock('@/utils/errorLogger', () => ({
  errorLogger: vi.fn(),
}));

describe('useApplications', () => {
  const mockApplications: Application[] = [
    {
      id: '1',
      name: 'Application 1',
      slug: 'app-1',
      description: 'Description for Application 1',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Application 2',
      slug: 'app-2',
      description: 'Description for Application 2',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (ApplicationService.getAll as any).mockResolvedValue(mockApplications);
  });

  it('should fetch applications on mount', async () => {
    const { result } = renderHook(() => useApplications());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(ApplicationService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.applications).toEqual(mockApplications);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching applications fails', async () => {
    const errorMessage = 'Failed to fetch';

    (ApplicationService.getAll as any).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(errorMessage);
  });

  it('should create application', async () => {
    const newApplication = {
      id: '3',
      name: 'New Application',
      slug: 'new-app',
      description: 'New Application Description',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    };

    (ApplicationService.create as any).mockResolvedValueOnce(newApplication);

    const { result } = renderHook(() => useApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createApplication({
        name: 'New Application',
        slug: 'new-app',
        description: 'New Application Description',
      });
    });

    expect(ApplicationService.create).toHaveBeenCalledWith({
      name: 'New Application',
      slug: 'new-app',
      description: 'New Application Description',
    });

    expect(result.current.applications).toContainEqual(newApplication);
  });

  it('should update application', async () => {
    const updatedApplication = {
      ...mockApplications[0],
      name: 'Updated Application',
      description: 'Updated Description',
    };

    (ApplicationService.update as any).mockResolvedValueOnce(updatedApplication);

    const { result } = renderHook(() => useApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateApplication('1', {
        name: 'Updated Application',
        description: 'Updated Description',
      });
    });

    expect(ApplicationService.update).toHaveBeenCalledWith('1', {
      name: 'Updated Application',
      description: 'Updated Description',
    });

    expect(result.current.applications[0]).toEqual(updatedApplication);
  });

  it('should delete application', async () => {
    (ApplicationService.delete as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteApplication('1');
    });

    expect(ApplicationService.delete).toHaveBeenCalledWith('1');
    expect(result.current.applications).toHaveLength(1);
    expect(result.current.applications[0].id).toBe('2');
  });

  it('should refresh applications', async () => {
    const { result } = renderHook(() => useApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refreshApplications();
    });

    expect(ApplicationService.getAll).toHaveBeenCalledTimes(2);
  });
});
