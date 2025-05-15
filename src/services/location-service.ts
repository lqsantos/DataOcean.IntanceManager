import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

const API_BASE_URL = '/api';

export const LocationService = {
  async getAll(): Promise<Location[]> {
    const response = await fetch(`${API_BASE_URL}/locations`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar localidades');
    }

    return response.json();
  },

  async create(data: CreateLocationDto): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar localidade');
    }

    return response.json();
  },

  async update(id: string, data: UpdateLocationDto): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar localidade');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir localidade');
    }
  },
};
