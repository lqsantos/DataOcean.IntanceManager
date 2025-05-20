// src/services/pat-service.test.ts
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/mocks/server';

import { PATService } from './pat-service';

describe('PATService', () => {
  // Spy on console.error to prevent log pollution during tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getStatus', () => {
    it('should return PAT status when request is successful', async () => {
      const mockStatus = {
        configured: true,
        lastUpdated: '2023-05-15T10:30:00.000Z',
      };

      // Mock the API response - Fix endpoint to match implementation
      server.use(
        http.get('/api/pat/status', () => {
          return HttpResponse.json(mockStatus);
        })
      );

      const result = await PATService.getStatus();

      expect(result).toEqual(mockStatus);
    });

    it('should return default status when request fails', async () => {
      // Mock API error - Fix endpoint to match implementation
      server.use(
        http.get('/api/pat/status', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await PATService.getStatus();

      expect(result).toEqual({
        configured: false,
        lastUpdated: null,
      });
    });
  });

  describe('createToken', () => {
    it('should configure a new token successfully', async () => {
      const mockToken = { token: 'new-token-12345' };
      const mockResponse = {
        configured: true,
        lastUpdated: '2023-05-15T10:30:00.000Z',
      };

      // Mock the API response
      server.use(
        http.post('/api/pat', () => {
          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const result = await PATService.createToken(mockToken);

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when creation fails', async () => {
      const mockToken = { token: 'invalid' };
      const errorMessage = 'Token deve ter pelo menos 8 caracteres';

      // Mock API error
      server.use(
        http.post('/api/pat', () => {
          return new HttpResponse(JSON.stringify({ message: errorMessage }), { status: 400 });
        })
      );

      await expect(PATService.createToken(mockToken)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateToken', () => {
    it('should update an existing token successfully', async () => {
      const tokenId = '1'; // Add token ID parameter
      const mockToken = { token: 'updated-token-12345' };
      const mockResponse = {
        configured: true,
        lastUpdated: '2023-05-16T15:45:00.000Z',
      };

      // Fix the endpoint to match implementation
      server.use(
        http.put(`/api/pat/${tokenId}`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await PATService.updateToken(tokenId, mockToken);

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when update fails', async () => {
      const tokenId = '1'; // Add token ID parameter
      const mockToken = { token: 'invalid' };
      const errorMessage = 'Token deve ter pelo menos 8 caracteres';

      // Fix the endpoint to match implementation
      server.use(
        http.put(`/api/pat/${tokenId}`, () => {
          return new HttpResponse(JSON.stringify({ message: errorMessage }), { status: 400 });
        })
      );

      await expect(PATService.updateToken(tokenId, mockToken)).rejects.toThrow(errorMessage);
    });
  });
});
