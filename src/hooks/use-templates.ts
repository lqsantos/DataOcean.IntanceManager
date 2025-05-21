import { useCallback, useEffect, useState } from 'react';

import { TemplateService } from '@/services/template-service';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TemplateService.getAll();

      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Não foi possível carregar os templates. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh templates
  const refreshTemplates = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchTemplates();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTemplates]);

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Create a new template
  const createTemplate = useCallback(async (data: CreateTemplateDto): Promise<Template> => {
    try {
      const newTemplate = await TemplateService.create(data);

      setTemplates((prev) => [...prev, newTemplate]);

      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar template';

      console.error('Failed to create template:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Update an existing template
  const updateTemplate = useCallback(
    async (id: string, data: UpdateTemplateDto): Promise<Template> => {
      try {
        const updatedTemplate = await TemplateService.update(id, data);

        setTemplates((prev) =>
          prev.map((template) => (template.id === id ? updatedTemplate : template))
        );

        return updatedTemplate;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar template';

        console.error('Failed to update template:', err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Delete a template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      await TemplateService.delete(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir template';

      console.error('Failed to delete template:', err);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    templates,
    isLoading,
    isRefreshing,
    error,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
