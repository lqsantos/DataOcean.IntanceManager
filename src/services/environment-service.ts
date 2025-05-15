import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

const API_BASE_URL = '/api';

export const EnvironmentService = {
  async getAll(): Promise<Environment[]> {
    const response = await fetch(`${API_BASE_URL}/environments`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar ambientes');
    }

    return response.json();
  },

  async create(data: CreateEnvironmentDto): Promise<Environment> {
    const response = await fetch(`${API_BASE_URL}/environments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar ambiente');
    }

    return response.json();
  },

  async update(id: string, data: UpdateEnvironmentDto): Promise<Environment> {
    const response = await fetch(`${API_BASE_URL}/environments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar ambiente');
    }

    return response.json();
  },
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/environments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir ambiente');
    }
  },
};
