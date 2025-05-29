import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

// Interface para validação direta com dados
interface ValidateTemplateDataParams {
  repositoryUrl: string;
  chartPath: string;
  branch: string;
}

export const templateService = {
  async getAllTemplates(): Promise<Template[]> {
    const response = await fetch('/api/templates');

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  },

  async getTemplate(id: string): Promise<Template> {
    const response = await fetch(`/api/templates/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch template with id ${id}`);
    }

    return response.json();
  },

  async createTemplate(template: CreateTemplateDto): Promise<Template> {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      throw new Error('Failed to create template');
    }

    return response.json();
  },

  async updateTemplate(template: UpdateTemplateDto): Promise<Template> {
    const response = await fetch(`/api/templates/${template.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      throw new Error(`Failed to update template with id ${template.id}`);
    }

    return response.json();
  },

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete template with id ${id}`);
    }
  },

  async validateTemplate(
    id: string,
    branch: string = 'main'
  ): Promise<{
    isValid: boolean;
    message?: string;
    errors?: string[];
    warnings?: string[];
  }> {
    const response = await fetch(`/api/templates/${id}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ branch }),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate template with id ${id}`);
    }

    return response.json();
  },

  async validateTemplateData(params: ValidateTemplateDataParams): Promise<{
    isValid: boolean;
    message?: string;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      const response = await fetch('/api/templates/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || `Falha na validação do template (${response.status})`;

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ocorreu um erro desconhecido durante a validação do template');
    }
  },
};
