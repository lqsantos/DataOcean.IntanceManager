'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { templateService } from '@/services/template-service';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const refreshTemplates = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const data = await templateService.getAllTemplates();

      setTemplates(data);
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch templates'));
      toast.error('Erro', {
        description: 'Falha ao atualizar templates',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);

      try {
        const data = await templateService.getAllTemplates();

        setTemplates(data);
        setError(undefined);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch templates'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const createTemplate = async (template: CreateTemplateDto): Promise<Template> => {
    try {
      const newTemplate = await templateService.createTemplate(template);

      setTemplates((prev) => [...prev, newTemplate]);
      toast.success('Sucesso', {
        description: `Template ${template.name} criado com sucesso`,
      });

      return newTemplate;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to create template');

      toast.error('Erro', {
        description: error.message,
      });
      throw error;
    }
  };

  const updateTemplate = async (template: UpdateTemplateDto): Promise<Template> => {
    try {
      const updatedTemplate = await templateService.updateTemplate(template);

      setTemplates((prev) => prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)));
      toast.success('Sucesso', {
        description: `Template ${updatedTemplate.name} atualizado com sucesso`,
      });

      return updatedTemplate;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to update template');

      toast.error('Erro', {
        description: error.message,
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string | { id: string }): Promise<void> => {
    try {
      // Extrair o ID string do objeto se necessário
      const templateId = typeof id === 'object' ? id.id : id;

      await templateService.deleteTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success('Sucesso', {
        description: 'Template excluído com sucesso',
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to delete template');

      toast.error('Erro', {
        description: error.message,
      });
      throw error;
    }
  };

  const validateTemplate = async (id: string): Promise<boolean> => {
    try {
      const result = await templateService.validateTemplate(id);

      return result.isValid;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to validate template');

      toast.error('Erro', {
        description: error.message,
      });
      throw error;
    }
  };

  return {
    templates,
    isLoading,
    isRefreshing,
    error,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateTemplate,
  };
}
