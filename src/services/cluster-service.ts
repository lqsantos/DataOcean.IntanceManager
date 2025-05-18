// services/cluster-service.ts
import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';

const API_BASE_URL = '/api';

export const ClusterService = {
  async getAll(): Promise<Cluster[]> {
    const response = await fetch(`${API_BASE_URL}/clusters`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar clusters');
    }

    return response.json();
  },

  async create(data: CreateClusterDto): Promise<Cluster> {
    const response = await fetch(`${API_BASE_URL}/clusters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar cluster');
    }

    return response.json();
  },

  async update(id: string, data: UpdateClusterDto): Promise<Cluster> {
    const response = await fetch(`${API_BASE_URL}/clusters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar cluster');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clusters/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir cluster');
    }
  },
};
