// services/application-service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Application } from '@/types/application';

import { ApplicationService } from './application-service';

// Mock global fetch
const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('ApplicationService', () => {
  const mockApplication: Application = {
    id: '1',
    name: 'Test Application',
    slug: 'test-application',
    description: 'A test application',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getAll', () => {
    it('should return applications when fetch is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockApplication],
      });

      const result = await ApplicationService.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/applications');
      expect(result).toEqual([mockApplication]);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to fetch' }),
      });

      await expect(ApplicationService.getAll()).rejects.toThrow('Failed to fetch');
      expect(mockFetch).toHaveBeenCalledWith('/api/applications');
    });
  });

  describe('create', () => {
    const newApplication = {
      name: 'New Application',
      slug: 'new-application',
      description: 'A new application',
    };

    it('should create application when fetch is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApplication,
      });

      const result = await ApplicationService.create(newApplication);

      expect(mockFetch).toHaveBeenCalledWith('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newApplication),
      });
      expect(result).toEqual(mockApplication);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to create' }),
      });

      await expect(ApplicationService.create(newApplication)).rejects.toThrow('Failed to create');
    });
  });

  describe('update', () => {
    const updateData = {
      name: 'Updated Application',
      description: 'An updated application',
    };

    it('should update application when fetch is successful', async () => {
      const updatedApplication = { ...mockApplication, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedApplication,
      });

      const result = await ApplicationService.update('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/applications/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedApplication);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to update' }),
      });

      await expect(ApplicationService.update('1', updateData)).rejects.toThrow('Failed to update');
    });
  });

  describe('delete', () => {
    it('should delete application when fetch is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await ApplicationService.delete('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/applications/1', {
        method: 'DELETE',
      });
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to delete' }),
      });

      await expect(ApplicationService.delete('1')).rejects.toThrow('Failed to delete');
    });
  });
});
