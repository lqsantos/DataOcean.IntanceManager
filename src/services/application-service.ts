// services/application-service.ts
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

const API_BASE_URL = '/api';

export const ApplicationService = {
  async getAll(): Promise<Application[]> {
    const response = await fetch(`${API_BASE_URL}/applications`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar aplicações');
    }

    return response.json();
  },

  async create(data: CreateApplicationDto): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar aplicação');
    }

    return response.json();
  },

  async update(id: string, data: UpdateApplicationDto): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar aplicação');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir aplicação');
    }
  },
};
