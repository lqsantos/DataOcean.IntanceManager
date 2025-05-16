import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import type { CreateEnvironmentDto, UpdateEnvironmentDto } from '@/types/environment';

import { EnvironmentService } from './environment-service';

describe('EnvironmentService', () => {
  describe('getAll', () => {
    it('retorna dados com sucesso', async () => {
      const mockEnvironments = [
        { id: '1', name: 'Dev', slug: 'dev', order: 1, createdAt: '2023-01-15T10:30:00Z' },
        { id: '2', name: 'Prod', slug: 'prod', order: 2, createdAt: '2023-01-15T10:35:00Z' },
      ];

      server.use(
        http.get('/api/environments', () => {
          return HttpResponse.json(mockEnvironments);
        })
      );

      const result = await EnvironmentService.getAll();

      expect(result).toEqual(mockEnvironments);
    });

    it('lida com erro na resposta', async () => {
      server.use(
        http.get('/api/environments', () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao buscar ambientes' }), {
            status: 500,
          });
        })
      );

      await expect(EnvironmentService.getAll()).rejects.toThrow('Falha ao buscar ambientes');
    });
  });

  describe('create', () => {
    const createData: CreateEnvironmentDto = {
      name: 'Test Environment',
      slug: 'test',
      order: 3,
    };

    it('cria um ambiente com sucesso', async () => {
      const mockCreatedEnvironment = {
        id: '123',
        name: createData.name,
        slug: createData.slug,
        order: createData.order,
        createdAt: '2023-01-15T10:30:00Z',
      };

      server.use(
        http.post('/api/environments', async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(createData);

          return HttpResponse.json(mockCreatedEnvironment, { status: 201 });
        })
      );

      const result = await EnvironmentService.create(createData);

      expect(result).toEqual(mockCreatedEnvironment);
    });

    it('lida com erro de validação', async () => {
      server.use(
        http.post('/api/environments', () => {
          return new HttpResponse(JSON.stringify({ message: 'Nome e slug são obrigatórios' }), {
            status: 400,
          });
        })
      );

      await expect(EnvironmentService.create({} as CreateEnvironmentDto)).rejects.toThrow(
        'Nome e slug são obrigatórios'
      );
    });

    it('lida com erro de recurso duplicado', async () => {
      server.use(
        http.post('/api/environments', () => {
          return new HttpResponse(
            JSON.stringify({ message: 'Já existe um ambiente com o slug "test"' }),
            { status: 409 }
          );
        })
      );

      await expect(EnvironmentService.create(createData)).rejects.toThrow(
        'Já existe um ambiente com o slug "test"'
      );
    });
  });

  describe('update', () => {
    const environmentId = '123';
    const updateData: UpdateEnvironmentDto = {
      name: 'Updated Environment',
      slug: 'updated-slug',
    };

    it('atualiza um ambiente com sucesso', async () => {
      const mockUpdatedEnvironment = {
        id: environmentId,
        name: updateData.name,
        slug: updateData.slug,
        order: 3,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-16T10:30:00Z',
      };

      server.use(
        http.patch(`/api/environments/${environmentId}`, async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(updateData);

          return HttpResponse.json(mockUpdatedEnvironment);
        })
      );

      const result = await EnvironmentService.update(environmentId, updateData);

      expect(result).toEqual(mockUpdatedEnvironment);
    });

    it('lida com ambiente não encontrado', async () => {
      server.use(
        http.patch(`/api/environments/${environmentId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
            status: 404,
          });
        })
      );

      await expect(EnvironmentService.update(environmentId, updateData)).rejects.toThrow(
        'Ambiente não encontrado'
      );
    });

    it('lida com erro de validação', async () => {
      server.use(
        http.patch(`/api/environments/${environmentId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Dados inválidos' }), { status: 400 });
        })
      );

      await expect(EnvironmentService.update(environmentId, updateData)).rejects.toThrow(
        'Dados inválidos'
      );
    });
  });

  describe('delete', () => {
    const environmentId = '123';

    it('exclui um ambiente com sucesso', async () => {
      server.use(
        http.delete(`/api/environments/${environmentId}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(EnvironmentService.delete(environmentId)).resolves.not.toThrow();
    });

    it('lida com ambiente não encontrado', async () => {
      server.use(
        http.delete(`/api/environments/${environmentId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
            status: 404,
          });
        })
      );

      await expect(EnvironmentService.delete(environmentId)).rejects.toThrow(
        'Ambiente não encontrado'
      );
    });

    it('lida com erro do servidor', async () => {
      server.use(
        http.delete(`/api/environments/${environmentId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Erro interno do servidor' }), {
            status: 500,
          });
        })
      );

      await expect(EnvironmentService.delete(environmentId)).rejects.toThrow(
        'Erro interno do servidor'
      );
    });
  });
});
