import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import type { CreateLocationDto, UpdateLocationDto } from '@/types/location';

import { LocationService } from './location-service';

describe('LocationService', () => {
  describe('getAll', () => {
    it('retorna dados com sucesso', async () => {
      const mockLocations = [
        { id: '1', name: 'Brasil', slug: 'brasil', createdAt: '2023-01-01T12:00:00Z' },
        {
          id: '2',
          name: 'Estados Unidos',
          slug: 'estados-unidos',
          createdAt: '2023-01-02T14:30:00Z',
        },
      ];

      server.use(
        http.get('/api/locations', () => {
          return HttpResponse.json(mockLocations);
        })
      );

      const result = await LocationService.getAll();

      expect(result).toEqual(mockLocations);
    });

    it('lida com erro na resposta', async () => {
      server.use(
        http.get('/api/locations', () => {
          return new HttpResponse(JSON.stringify({ message: 'Falha ao buscar localidades' }), {
            status: 500,
          });
        })
      );

      await expect(LocationService.getAll()).rejects.toThrow('Falha ao buscar localidades');
    });
  });

  describe('create', () => {
    const createData: CreateLocationDto = {
      name: 'Nova Localidade',
      slug: 'nova-localidade',
    };

    it('cria uma localidade com sucesso', async () => {
      const mockCreatedLocation = {
        id: '123',
        name: createData.name,
        slug: createData.slug,
        createdAt: '2023-01-15T10:30:00Z',
      };

      server.use(
        http.post('/api/locations', async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(createData);

          return HttpResponse.json(mockCreatedLocation, { status: 201 });
        })
      );

      const result = await LocationService.create(createData);

      expect(result).toEqual(mockCreatedLocation);
    });

    it('lida com erro de validação', async () => {
      server.use(
        http.post('/api/locations', () => {
          return new HttpResponse(JSON.stringify({ message: 'Nome e slug são obrigatórios' }), {
            status: 400,
          });
        })
      );

      await expect(LocationService.create({} as CreateLocationDto)).rejects.toThrow(
        'Nome e slug são obrigatórios'
      );
    });

    it('lida com erro de recurso duplicado', async () => {
      server.use(
        http.post('/api/locations', () => {
          return new HttpResponse(
            JSON.stringify({ message: 'Já existe uma localidade com o slug "nova-localidade"' }),
            { status: 409 }
          );
        })
      );

      await expect(LocationService.create(createData)).rejects.toThrow(
        'Já existe uma localidade com o slug "nova-localidade"'
      );
    });
  });

  describe('update', () => {
    const locationId = '123';
    const updateData: UpdateLocationDto = {
      name: 'Localidade Atualizada',
      slug: 'localidade-atualizada',
    };

    it('atualiza uma localidade com sucesso', async () => {
      const mockUpdatedLocation = {
        id: locationId,
        name: updateData.name,
        slug: updateData.slug,
        createdAt: '2023-01-15T10:30:00Z',
      };

      server.use(
        http.patch(`/api/locations/${locationId}`, async ({ request }) => {
          const requestData = await request.json();

          // Verifica se os dados enviados estão corretos
          expect(requestData).toEqual(updateData);

          return HttpResponse.json(mockUpdatedLocation);
        })
      );

      const result = await LocationService.update(locationId, updateData);

      expect(result).toEqual(mockUpdatedLocation);
    });

    it('lida com localidade não encontrada', async () => {
      server.use(
        http.patch(`/api/locations/${locationId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
            status: 404,
          });
        })
      );

      await expect(LocationService.update(locationId, updateData)).rejects.toThrow(
        'Localidade não encontrada'
      );
    });

    it('lida com erro de conflito no slug', async () => {
      server.use(
        http.patch(`/api/locations/${locationId}`, () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Já existe uma localidade com o slug "localidade-atualizada"',
            }),
            { status: 409 }
          );
        })
      );

      await expect(LocationService.update(locationId, updateData)).rejects.toThrow(
        'Já existe uma localidade com o slug "localidade-atualizada"'
      );
    });
  });

  describe('delete', () => {
    const locationId = '123';

    it('exclui uma localidade com sucesso', async () => {
      server.use(
        http.delete(`/api/locations/${locationId}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(LocationService.delete(locationId)).resolves.not.toThrow();
    });

    it('lida com localidade não encontrada', async () => {
      server.use(
        http.delete(`/api/locations/${locationId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
            status: 404,
          });
        })
      );

      await expect(LocationService.delete(locationId)).rejects.toThrow('Localidade não encontrada');
    });

    it('lida com erro do servidor', async () => {
      server.use(
        http.delete(`/api/locations/${locationId}`, () => {
          return new HttpResponse(JSON.stringify({ message: 'Erro interno do servidor' }), {
            status: 500,
          });
        })
      );

      await expect(LocationService.delete(locationId)).rejects.toThrow('Erro interno do servidor');
    });
  });
});
