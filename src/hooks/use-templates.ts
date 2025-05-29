'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { templateService } from '@/services/template-service';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

export function useTemplates() {
  const { t } = useTranslation('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshTemplates = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const data = await templateService.getAllTemplates();

      setTemplates(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch templates'));
      toast.error(t('toast.error.title'), {
        description: t('toast.error.refreshFailed'),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);

      try {
        const data = await templateService.getAllTemplates();

        setTemplates(data);
        setError(null);
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
      toast.success(t('toast.created.title'), {
        description: t('toast.created.description', { name: template.name }),
      });

      return newTemplate;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to create template');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  const updateTemplate = async (template: UpdateTemplateDto): Promise<Template> => {
    try {
      const updatedTemplate = await templateService.updateTemplate(template);

      setTemplates((prev) => prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)));
      toast.success(t('toast.updated.title'), {
        description: t('toast.updated.description', { name: updatedTemplate.name }),
      });

      return updatedTemplate;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to update template');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success(t('toast.deleted.title'), {
        description: t('toast.deleted.description'),
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to delete template');

      toast.error(t('toast.error.title'), {
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

      toast.error(t('toast.error.title'), {
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
