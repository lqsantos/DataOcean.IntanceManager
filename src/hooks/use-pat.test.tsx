// src/hooks/use-pat.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PATService } from '@/services/pat-service';

import { usePAT } from './use-pat';

// Mock do PAT Service
vi.mock('@/services/pat-service', () => ({
  PATService: {
    getStatus: vi.fn(),
    createToken: vi.fn(),
    updateToken: vi.fn(),
  },
}));

describe('usePAT', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    expect(result.current.status).toEqual({
      configured: false,
      lastUpdated: null,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isConfigured).toBe(false);
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should fetch status on initialization when autoFetch is true', async () => {
    const mockStatus = {
      configured: true,
      lastUpdated: '2023-05-15T10:30:00.000Z',
    };

    // Mock the service response
    vi.mocked(PATService.getStatus).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => usePAT());

    // Should start with loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for the status to be fetched
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(PATService.getStatus).toHaveBeenCalledTimes(1);
    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.isConfigured).toBe(true);
    expect(result.current.lastUpdated).toBe('2023-05-15T10:30:00.000Z');
  });

  it('should handle error when fetching status fails', async () => {
    const errorMessage = 'Failed to fetch';

    // Mock the service to throw an error
    vi.mocked(PATService.getStatus).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePAT());

    // Wait for the promise to resolve
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.status).toEqual({
      configured: false,
      lastUpdated: null,
    });
  });

  it('should create a new token', async () => {
    const mockToken = { token: 'new-token-12345' };
    const mockResponse = {
      configured: true,
      lastUpdated: '2023-05-15T10:30:00.000Z',
    };

    // Mock the service response
    vi.mocked(PATService.createToken).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    // Call createToken
    let response;

    await act(async () => {
      response = await result.current.createToken(mockToken);
    });

    // Verify the service was called and the hook updated
    expect(PATService.createToken).toHaveBeenCalledWith(mockToken);
    expect(response).toEqual(mockResponse);
    expect(result.current.status).toEqual({
      configured: true,
      lastUpdated: '2023-05-15T10:30:00.000Z',
    });
    expect(result.current.isConfigured).toBe(true);
  });

  it('should handle error when creating token fails', async () => {
    const mockToken = { token: 'invalid' };
    const errorMessage = 'Token deve ter pelo menos 8 caracteres';

    // Mock the service to throw an error
    vi.mocked(PATService.createToken).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    // Call createToken and expect it to throw
    let error;

    await act(async () => {
      try {
        await result.current.createToken(mockToken);
      } catch (e) {
        error = e;
      }
    });

    // Verify the error was caught and the hook updated
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should update an existing token', async () => {
    const mockToken = { token: 'updated-token-12345' };
    const mockResponse = {
      configured: true,
      lastUpdated: '2023-05-16T15:45:00.000Z',
    };

    // Mock the service response
    vi.mocked(PATService.updateToken).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    // Call updateToken
    let response;

    await act(async () => {
      response = await result.current.updateToken(mockToken);
    });

    // Verify the service was called and the hook updated
    expect(PATService.updateToken).toHaveBeenCalledWith(mockToken);
    expect(response).toEqual(mockResponse);
    expect(result.current.status).toEqual({
      configured: true,
      lastUpdated: '2023-05-16T15:45:00.000Z',
    });
  });

  it('should handle error when updating token fails', async () => {
    const mockToken = { token: 'invalid' };
    const errorMessage = 'Token deve ter pelo menos 8 caracteres';

    // Mock the service to throw an error
    vi.mocked(PATService.updateToken).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    // Call updateToken and expect it to throw
    let error;

    await act(async () => {
      try {
        await result.current.updateToken(mockToken);
      } catch (e) {
        error = e;
      }
    });

    // Verify the error was caught and the hook updated
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should manually fetch status when fetchStatus is called', async () => {
    const mockStatus = {
      configured: true,
      lastUpdated: '2023-05-15T10:30:00.000Z',
    };

    // Mock the service response
    vi.mocked(PATService.getStatus).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => usePAT({ autoFetch: false }));

    // Manually call fetchStatus
    await act(async () => {
      await result.current.fetchStatus();
    });

    // Verify the service was called and the hook updated
    expect(PATService.getStatus).toHaveBeenCalledTimes(1);
    expect(result.current.status).toEqual(mockStatus);
  });
});
