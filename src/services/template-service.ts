import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

// Interface for template schema validation

// Interface para validação direta com dados
interface ValidateTemplateDataParams {
  repositoryUrl: string;
  chartPath: string;
  branch: string;
}

// Response type for fetchTemplateSchemaForDefaultValues
interface TemplateSchemaResponse {
  fields: DefaultValueField[];
  rawYaml: string;
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

      const result = await response.json();

      // Se a validação foi bem-sucedida, atualizamos a data da última validação
      if (result.isValid) {
        try {
          // Atualiza o template com a nova data de validação
          await this.updateTemplate({
            id,
            lastValidatedAt: new Date().toISOString(),
          });
        } catch (updateError) {
          console.error('Erro ao atualizar data de validação:', updateError);
          // Não falha a operação se não conseguir atualizar a data
        }
      }

      return result;
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

  /**
   * Fetches template schema and default values for a given template ID
   * @param templateId - The ID of the template to fetch
   * @returns Template schema with fields and raw YAML
   */
  async fetchTemplateSchemaForDefaultValues(templateId: string): Promise<TemplateSchemaResponse> {
    try {
      console.log(`Fetching schema for template ID: ${templateId}`);
      const response = await fetch(`/api/templates/${templateId}/schema`);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch schema for template ${templateId}`);
      }

      const data = await response.json();

      console.log('Schema data received:', data);

      return data;
    } catch (error) {
      console.error(`Error fetching template schema for ${templateId}`, error);
      throw new Error(`Failed to load schema for template ${templateId}`);
    }
  },
};
