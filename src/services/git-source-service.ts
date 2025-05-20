import type {
  CreateGitSourceDto,
  GitSource,
  TestConnectionResult,
  UpdateGitSourceDto,
} from '@/types/git-source';

const API_BASE_URL = '/api';

export const GitSourceService = {
  async get(): Promise<GitSource | null> {
    const response = await fetch(`${API_BASE_URL}/git-source`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar fonte Git');
    }

    return response.json();
  },

  async create(data: CreateGitSourceDto): Promise<GitSource> {
    const response = await fetch(`${API_BASE_URL}/git-source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar fonte Git');
    }

    return response.json();
  },

  async update(id: string, data: UpdateGitSourceDto): Promise<GitSource> {
    const response = await fetch(`${API_BASE_URL}/git-source/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar fonte Git');
    }

    return response.json();
  },

  async testConnection(id: string): Promise<TestConnectionResult> {
    const response = await fetch(`${API_BASE_URL}/git-source/${id}/test-connection`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao testar conexão Git');
    }

    return response.json();
  },

  async activate(id: string): Promise<GitSource> {
    const response = await fetch(`${API_BASE_URL}/git-source/${id}/activate`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao ativar fonte Git');
    }

    return response.json();
  },

  async deactivate(id: string): Promise<GitSource> {
    const response = await fetch(`${API_BASE_URL}/git-source/${id}/deactivate`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao desativar fonte Git');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/git-source/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir fonte Git');
    }
  },
};
