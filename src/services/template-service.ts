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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`/api/templates/${id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Return validation result with error instead of throwing
        return {
          isValid: false,
          message: 'Falha na validação do template',
          errors: [`Erro na validação: ${response.status}`],
        };
      }

      return response.json();
    } catch (error) {
      // Return validation result with friendly error message
      return {
        isValid: false,
        message:
          error instanceof Error && error.name === 'AbortError'
            ? 'Tempo limite excedido ao acessar o repositório'
            : 'Falha ao validar o template',
        errors: [
          error instanceof Error && error.name === 'AbortError'
            ? 'Timeout ao acessar o repositório Git. Verifique se o repositório está acessível e tente novamente.'
            : 'Verifique se o repositório e o caminho estão corretos.',
        ],
      };
    }
  },

  async validateTemplateData(params: ValidateTemplateDataParams): Promise<{
    isValid: boolean;
    message?: string;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/templates/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Return validation result with error instead of throwing
        return {
          isValid: false,
          message: errorData.message || 'Falha na validação do template',
          errors: [errorData.message || `Erro na validação: ${response.status}`],
        };
      }

      return response.json();
    } catch (error) {
      // Return validation result with friendly error message
      return {
        isValid: false,
        message:
          error instanceof Error && error.name === 'AbortError'
            ? 'Tempo limite excedido ao acessar o repositório'
            : 'Falha ao validar o template',
        errors: [
          error instanceof Error && error.name === 'AbortError'
            ? 'Timeout ao acessar o repositório Git. Verifique se o repositório está acessível e tente novamente.'
            : 'Verifique se o repositório e o caminho estão corretos.',
        ],
      };
    }
  },
};
