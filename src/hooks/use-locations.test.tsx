import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

import { useLocations } from './use-locations';

// Mock data para testes
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'São Paulo',
    slug: 'sao-paulo',
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Rio de Janeiro',
    slug: 'rio-de-janeiro',
    createdAt: '2023-01-15T10:35:00Z',
  },
];

const mockNewLocation: Location = {
  id: '3',
  name: 'Belo Horizonte',
  slug: 'belo-horizonte',
  createdAt: '2023-01-16T12:00:00Z',
};

const mockUpdatedLocation: Location = {
  id: '1',
  name: 'São Paulo Updated',
  slug: 'sao-paulo-updated',
  createdAt: '2023-01-15T10:30:00Z',
};

describe('useLocations', () => {
  // Teste para o carregamento inicial
  it('should load locations on initial render', async () => {
    // Sobrescreve o handler para retornar nossas localidades de mock
    server.use(
      http.get('/api/locations', () => {
        return HttpResponse.json(mockLocations);
      })
    );

    const { result } = renderHook(() => useLocations());

    // Inicialmente, o estado de carregamento deve ser true
    expect(result.current.isLoading).toBe(true);

    // Aguardar a conclusão do carregamento
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar se as localidades foram carregadas corretamente
    expect(result.current.locations).toEqual(mockLocations);
    expect(result.current.error).toBeNull();
  });

  // Teste para o carregamento com erro
  it('should handle errors when loading locations fails', async () => {
    // Sobrescreve o handler para simular um erro
    server.use(
      http.get('/api/locations', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar a conclusão do carregamento
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar se o erro foi tratado
    expect(result.current.error).not.toBeNull();
    expect(result.current.locations).toEqual([]);
  });

  // Teste para a função refreshLocations
  it('should refresh locations when refreshLocations is called', async () => {
    // Configurar o mock para retornar dados diferentes na primeira e na segunda chamada
    let callCount = 0;

    server.use(
      http.get('/api/locations', () => {
        callCount++;

        if (callCount === 1) {
          return HttpResponse.json(mockLocations);
        } else {
          return HttpResponse.json([...mockLocations, mockNewLocation]);
        }
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar dados iniciais
    expect(result.current.locations).toEqual(mockLocations);

    // Chamar refreshLocations
    act(() => {
      result.current.refreshLocations();
    });

    // Verificar se isRefreshing é true durante o refresh
    expect(result.current.isRefreshing).toBe(true);

    // Aguardar a conclusão do refresh
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    // Verificar se os dados foram atualizados
    expect(result.current.locations).toEqual([...mockLocations, mockNewLocation]);
  });

  // Teste para a função createLocation (sucesso)
  it('should create a new location successfully', async () => {
    server.use(
      http.post('/api/locations', () => {
        return HttpResponse.json(mockNewLocation, { status: 201 });
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Criar nova localidade
    const createDto: CreateLocationDto = {
      name: 'Belo Horizonte',
      slug: 'belo-horizonte',
    };

    let createdLoc: Location | null = null;

    await act(async () => {
      createdLoc = await result.current.createLocation(createDto);
    });

    // Verificar se a localidade foi criada e adicionada ao estado
    expect(createdLoc).toEqual(mockNewLocation);
    expect(result.current.locations).toContainEqual(mockNewLocation);
  });

  // Teste para a função createLocation (erro)
  it('should handle error when creating location fails', async () => {
    server.use(
      http.post('/api/locations', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Já existe uma localidade com o slug "belo-horizonte"' }),
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar criar localidade com slug duplicado
    const createDto: CreateLocationDto = {
      name: 'Belo Horizonte',
      slug: 'belo-horizonte',
    };

    // Verificar se o erro é lançado
    await expect(result.current.createLocation(createDto)).rejects.toThrow();
  });

  // Teste para a função updateLocation (sucesso)
  it('should update a location successfully', async () => {
    server.use(
      http.get('/api/locations', () => {
        return HttpResponse.json(mockLocations);
      }),
      http.patch('/api/locations/1', () => {
        return HttpResponse.json(mockUpdatedLocation);
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Atualizar localidade
    const updateDto: UpdateLocationDto = {
      name: 'São Paulo Updated',
      slug: 'sao-paulo-updated',
    };

    let updatedLoc: Location | null = null;

    await act(async () => {
      updatedLoc = await result.current.updateLocation('1', updateDto);
    });

    // Verificar se a localidade foi atualizada
    expect(updatedLoc).toEqual(mockUpdatedLocation);

    // Verificar se a lista de localidades foi atualizada
    expect(result.current.locations.find((loc) => loc.id === '1')).toEqual(mockUpdatedLocation);
  });

  // Teste para a função updateLocation (erro)
  it('should handle error when updating location fails', async () => {
    server.use(
      http.patch('/api/locations/999', () => {
        return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
          status: 404,
        });
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar atualizar localidade que não existe
    const updateDto: UpdateLocationDto = {
      name: 'Localidade Inexistente',
    };

    // Verificar se o erro é lançado
    await expect(result.current.updateLocation('999', updateDto)).rejects.toThrow();
  });

  // Teste para a função deleteLocation (sucesso)
  it('should delete a location successfully', async () => {
    server.use(
      http.get('/api/locations', () => {
        return HttpResponse.json(mockLocations);
      }),
      http.delete('/api/locations/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.locations).toHaveLength(2);
    });

    // Excluir localidade
    await act(async () => {
      await result.current.deleteLocation('1');
    });

    // Verificar se a localidade foi removida da lista
    expect(result.current.locations).toHaveLength(1);
    expect(result.current.locations.find((loc) => loc.id === '1')).toBeUndefined();
  });

  // Teste para a função deleteLocation (erro)
  it('should handle error when deleting location fails', async () => {
    server.use(
      http.delete('/api/locations/999', () => {
        return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
          status: 404,
        });
      })
    );

    const { result } = renderHook(() => useLocations());

    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Tentar excluir localidade que não existe
    await expect(result.current.deleteLocation('999')).rejects.toThrow();
  });
});
