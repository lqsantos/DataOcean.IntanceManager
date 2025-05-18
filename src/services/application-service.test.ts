// services/application-service.test.ts
import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

import { ApplicationService } from './application-service';

describe('ApplicationService', () => {
  const mockApplication: Application = {
    id: '1',
    name: 'Test Application',
    slug: 'test-application',
    description: 'A test application',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  describe('getAll', () => {
    it('should return applications when fetch is successful', async () => {
      const mockApplications = [mockApplication];

      server.use(
        http.get('/api/applications', () => {
          return HttpResponse.json(mockApplications);
        })
      );

      const result = await ApplicationService.getAll();

      expect(result).toEqual(mockApplications);
    });

    it('should throw error when fetch fails', async () => {
      server.use(
        http.get('/api/applications', () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao buscar aplicações' }), {
            status: 500,
          });
        })
      );

      await expect(ApplicationService.getAll()).rejects.toThrow('Falha ao buscar aplicações');
    });
  });

  describe('create', () => {
    const createData: CreateApplicationDto = {
      name: 'New Application',
      slug: 'new-application',
      description: 'A new application',
    };

    it('should create application when fetch is successful', async () => {
      const mockCreatedApplication = {
        id: '123',
        name: createData.name,
        slug: createData.slug,
        description: createData.description,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
      };

      server.use(
        http.post('/api/applications', async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(createData);

          return HttpResponse.json(mockCreatedApplication, { status: 201 });
        })
      );

      const result = await ApplicationService.create(createData);

      expect(result).toEqual(mockCreatedApplication);
    });

    it('should throw error when fetch fails', async () => {
      server.use(
        http.post('/api/applications', () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao criar aplicação' }), {
            status: 400,
          });
        })
      );

      await expect(ApplicationService.create(createData)).rejects.toThrow(
        'Falha ao criar aplicação'
      );
    });
  });

  describe('update', () => {
    const applicationId = '1';
    const updateData: UpdateApplicationDto = {
      name: 'Updated Application',
      description: 'An updated application',
    };

    it('should update application when fetch is successful', async () => {
      const mockUpdatedApplication = {
        ...mockApplication,
        name: updateData.name,
        description: updateData.description,
        updatedAt: '2023-01-16T10:30:00Z',
      };

      server.use(
        http.put(`/api/applications/${applicationId}`, async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(updateData);

          return HttpResponse.json(mockUpdatedApplication);
        })
      );

      const result = await ApplicationService.update(applicationId, updateData);

      expect(result).toEqual(mockUpdatedApplication);
    });

    it('should throw error when fetch fails', async () => {
      server.use(
        http.put(`/api/applications/${applicationId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao atualizar aplicação' }), {
            status: 404,
          });
        })
      );

      await expect(ApplicationService.update(applicationId, updateData)).rejects.toThrow(
        'Falha ao atualizar aplicação'
      );
    });
  });

  describe('delete', () => {
    const applicationId = '1';

    it('should delete application when fetch is successful', async () => {
      server.use(
        http.delete(`/api/applications/${applicationId}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(ApplicationService.delete(applicationId)).resolves.not.toThrow();
    });

    it('should throw error when fetch fails', async () => {
      server.use(
        http.delete(`/api/applications/${applicationId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao excluir aplicação' }), {
            status: 404,
          });
        })
      );

      await expect(ApplicationService.delete(applicationId)).rejects.toThrow(
        'Falha ao excluir aplicação'
      );
    });
  });
});
