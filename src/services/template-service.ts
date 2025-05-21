import type {
  CreateTemplateDto,
  Template,
  TemplateChartInfo,
  TemplatePreview,
  UpdateTemplateDto,
} from '@/types/template';

const API_BASE_URL = '/api';

export const TemplateService = {
  async getAll(): Promise<Template[]> {
    const response = await fetch(`${API_BASE_URL}/templates`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar templates');
    }

    return response.json();
  },

  async getById(id: string): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar template');
    }

    return response.json();
  },

  async create(data: CreateTemplateDto): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao criar template');
    }

    return response.json();
  },

  async update(id: string, data: UpdateTemplateDto): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao atualizar template');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao excluir template');
    }
  },

  async validate(
    gitRepositoryId: string,
    branch: string,
    path: string
  ): Promise<TemplateChartInfo> {
    const response = await fetch(`${API_BASE_URL}/templates/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gitRepositoryId, branch, path }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao validar template');
    }

    return response.json();
  },

  async previewFiles(
    gitRepositoryId: string,
    branch: string,
    path: string
  ): Promise<TemplatePreview> {
    const response = await fetch(`${API_BASE_URL}/templates/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gitRepositoryId, branch, path }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao carregar a pré-visualização do template');
    }

    return response.json();
  },
};
