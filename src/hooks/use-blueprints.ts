'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { blueprintService } from '@/services/blueprint-service';
import type { Blueprint, CreateBlueprintDto, UpdateBlueprintDto } from '@/types/blueprint';

import { useTemplates } from './use-templates';

export function useBlueprintStore() {
  const { t } = useTranslation(['common', 'blueprints']);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { templates } = useTemplates();

  // Function to fetch blueprints (can be called from outside)
  const fetchBlueprints = async () => {
    setIsLoading(true);

    try {
      // Use the blueprintService to fetch blueprints from the API
      const data = await blueprintService.getAllBlueprints();

      setBlueprints(data);

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch blueprints');

      setError(error);
      toast.error(t('toast.error.title'), {
        description: t('toast.error.description'),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load blueprints on mount
  useEffect(() => {
    fetchBlueprints();
  }, [t]);

  // Update template names when templates change
  useEffect(() => {
    if (templates.length > 0 && blueprints.length > 0) {
      const updatedBlueprints = blueprints.map((blueprint) => {
        const updatedBlueprint = { ...blueprint };

        // Update child template names if they exist
        if (blueprint.childTemplates && blueprint.childTemplates.length > 0) {
          updatedBlueprint.childTemplates = blueprint.childTemplates.map((childTemplate) => {
            const childTemplateObj = templates.find((t) => t.id === childTemplate.templateId);

            if (childTemplateObj && childTemplate.templateName !== childTemplateObj.name) {
              return { ...childTemplate, templateName: childTemplateObj.name };
            }

            return childTemplate;
          });
        }

        return updatedBlueprint;
      });

      // Check if there were actual changes
      const hasChanges = updatedBlueprints.some((updatedBp, index) => {
        // Check main template name
        if (updatedBp.templateName !== blueprints[index].templateName) {
          return true;
        }

        // Check child template names
        const updatedChildren = updatedBp.childTemplates || [];
        const originalChildren = blueprints[index].childTemplates || [];

        if (updatedChildren.length !== originalChildren.length) {
          return true;
        }

        return updatedChildren.some((child, childIndex) => {
          return child.templateName !== originalChildren[childIndex]?.templateName;
        });
      });

      if (hasChanges) {
        setBlueprints(updatedBlueprints);
      }
    }
  }, [templates, blueprints]);

  // Generate helper.tpl content from variables
  const generateHelperTpl = (variables: Blueprint['variables']) => {
    if (!variables || variables.length === 0) {
      return '';
    }

    const helperContent = variables
      .map((variable) => {
        let defaultValue = '';

        // Format the default value according to the type
        if (variable.defaultValue !== undefined) {
          if (variable.type === 'string') {
            defaultValue = variable.defaultValue;
          } else if (variable.type === 'number') {
            defaultValue = String(Number(variable.defaultValue) || 0);
          } else if (variable.type === 'boolean') {
            defaultValue = variable.defaultValue.toLowerCase() === 'true' ? 'true' : 'false';
          }
        }

        return `{{- define "helper.${variable.name}" -}}
${defaultValue}
{{- end }}`;
      })
      .join('\n\n');

    return helperContent;
  };

  // Create a new blueprint
  const createBlueprint = async (data: CreateBlueprintDto): Promise<Blueprint> => {
    try {
      // Process child templates if provided
      const processedData = { ...data };

      // Garantir que applicationId esteja definido
      if (!processedData.applicationId) {
        processedData.applicationId = '1'; // Usar valor padrão se não estiver definido
      }

      if (data.childTemplates) {
        processedData.childTemplates = data.childTemplates.map((child, index) => {
          const childTemplateObj = templates.find((t) => t.id === child.templateId);

          return {
            ...child,
            templateName: childTemplateObj?.name || `Template ${index + 1}`,
            order: child.order || index + 1,
          };
        });
      }

      // Generate helper.tpl if variables are provided
      if (data.variables && !data.helperTpl) {
        processedData.helperTpl = generateHelperTpl(data.variables);
      }

      // Call API to create the blueprint
      const newBlueprint = await blueprintService.createBlueprint(processedData);

      // Update local state
      setBlueprints((prev) => [...prev, newBlueprint]);

      toast.success(t('toast.created.title'), {
        description: t('toast.created.description', { name: data.name }),
      });

      return newBlueprint;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create blueprint');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  // Update an existing blueprint
  const updateBlueprint = async (data: UpdateBlueprintDto): Promise<Blueprint> => {
    try {
      // Process child templates if provided
      const processedData = { ...data };

      if (data.childTemplates) {
        processedData.childTemplates = data.childTemplates.map((child, index) => {
          const childTemplateObj = templates.find((t) => t.id === child.templateId);

          return {
            ...child,
            templateName: childTemplateObj?.name || `Template ${index + 1}`,
            order: child.order || index + 1,
          };
        });
      }

      // Generate helper.tpl if variables are provided and helperTpl not already set
      if (data.variables && !data.helperTpl) {
        processedData.helperTpl = generateHelperTpl(data.variables);
      }

      // Call API to update the blueprint
      const updatedBlueprint = await blueprintService.updateBlueprint(processedData);

      // Update local state
      setBlueprints((prev) =>
        prev.map((b) => (b.id === updatedBlueprint.id ? updatedBlueprint : b))
      );

      toast.success(t('toast.updated.title'), {
        description: t('toast.updated.description'),
      });

      return updatedBlueprint;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update blueprint');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  // Delete a blueprint
  const deleteBlueprint = async (id: string): Promise<void> => {
    try {
      // Call API to delete the blueprint
      await blueprintService.deleteBlueprint(id);

      // Update local state
      setBlueprints((prev) => prev.filter((b) => b.id !== id));

      toast.success(t('toast.deleted.title'), {
        description: t('toast.deleted.description'),
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete blueprint');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  // Duplicate a blueprint
  const duplicateBlueprint = async (id: string): Promise<Blueprint> => {
    try {
      // Call API to duplicate the blueprint
      const duplicatedBlueprint = await blueprintService.duplicateBlueprint(id);

      // Update local state
      setBlueprints((prev) => [...prev, duplicatedBlueprint]);

      const originalBlueprint = blueprints.find((b) => b.id === id);

      toast.success(t('toast.duplicated.title'), {
        description: t('toast.duplicated.description', {
          name: originalBlueprint?.name || 'Blueprint',
        }),
      });

      return duplicatedBlueprint;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate blueprint');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
    }
  };

  // Validate a blueprint
  const validateBlueprint = async (
    blueprint: CreateBlueprintDto,
    signal?: AbortSignal
  ): Promise<{ valid: boolean; message?: string }> => {
    try {
      return await blueprintService.validateBlueprint(blueprint, signal);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to validate blueprint');

      return { valid: false, message: error.message };
    }
  };

  return {
    blueprints,
    isLoading,
    error,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint,
    duplicateBlueprint,
    validateBlueprint,
    refreshBlueprints: fetchBlueprints, // Expose the function to refresh blueprints
  };
}
