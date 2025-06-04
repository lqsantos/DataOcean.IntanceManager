'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import type {
  Blueprint,
  BlueprintChildTemplate,
  CreateBlueprintDto,
  UpdateBlueprintDto,
} from '@/types/blueprint';

import { useTemplates } from './use-templates';

export function useBlueprintStore() {
  const { t } = useTranslation(['common', 'templates']);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { templates } = useTemplates();

  // Load blueprints on mount
  useEffect(() => {
    const fetchBlueprints = async () => {
      setIsLoading(true);

      try {
        // In a real implementation, this would be an API call
        // For now, we'll simulate loading data from browser storage
        const storedBlueprints = localStorage.getItem('dataocean_blueprints');

        if (storedBlueprints) {
          setBlueprints(JSON.parse(storedBlueprints));
        } else {
          // Initial mock data if none exists
          const mockBlueprints = [
            {
              id: '1',
              name: 'Web Application Blueprint',
              description: 'Standard web application with load balancing',
              category: 'Application',
              templateId: 'template-web-app',
              templateName: 'Web Application',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              variables: [
                {
                  name: 'replicaCount',
                  description: 'Number of replicas',
                  defaultValue: '2',
                  required: true,
                  type: 'number',
                },
              ],
              childTemplates: [],
              helperTpl: `{{- define "helper.replicaCount" -}}
2
{{- end }}`,
            },
            {
              id: '2',
              name: 'Database Blueprint',
              description: 'PostgreSQL database with persistent storage',
              category: 'Database',
              templateId: 'template-db',
              templateName: 'PostgreSQL Database',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              variables: [
                {
                  name: 'storageSize',
                  description: 'Storage size in GB',
                  defaultValue: '10',
                  required: true,
                  type: 'number',
                },
              ],
              childTemplates: [
                {
                  templateId: 'template-monitoring',
                  templateName: 'Database Monitoring',
                  order: 1,
                  overrideValues: 'enabled: true\ninterval: 30s',
                },
              ],
              helperTpl: `{{- define "helper.storageSize" -}}
10
{{- end }}`,
            },
          ];

          setBlueprints(mockBlueprints);
          localStorage.setItem('dataocean_blueprints', JSON.stringify(mockBlueprints));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch blueprints'));
        toast.error(t('toast.error.title'), {
          description: t('toast.error.description'),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlueprints();
  }, [t]);

  // Fix: Update template names separately to avoid infinite loops
  useEffect(() => {
    if (templates.length > 0 && blueprints.length > 0) {
      // Create a deep copy of blueprints to prevent modifications to original state
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

      // Only update state if there were actual changes
      if (hasChanges) {
        setBlueprints(updatedBlueprints);
        // Update localStorage with the new blueprints
        localStorage.setItem('dataocean_blueprints', JSON.stringify(updatedBlueprints));
      }
    }
  }, [templates]);

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

  // Save blueprints to storage
  const saveBlueprints = (newBlueprints: Blueprint[]) => {
    localStorage.setItem('dataocean_blueprints', JSON.stringify(newBlueprints));
    setBlueprints(newBlueprints);
  };

  // Create a new blueprint
  const createBlueprint = async (data: CreateBlueprintDto): Promise<Blueprint> => {
    try {
      // Process child templates (if any)
      const processedChildTemplates: BlueprintChildTemplate[] = [];

      if (data.childTemplates && data.childTemplates.length > 0) {
        data.childTemplates.forEach((child, index) => {
          const childTemplateObj = templates.find((t) => t.id === child.templateId);

          if (childTemplateObj) {
            processedChildTemplates.push({
              ...child,
              templateName: childTemplateObj.name,
              order: index + 1,
            });
          }
        });
      }

      // Generate helper.tpl content if variables are provided
      const helperTpl = data.variables ? generateHelperTpl(data.variables) : '';

      const newBlueprint: Blueprint = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variables: data.variables || [],
        childTemplates: processedChildTemplates,
        helperTpl: helperTpl,
      };

      const newBlueprints = [...blueprints, newBlueprint];

      saveBlueprints(newBlueprints);

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
      const index = blueprints.findIndex((b) => b.id === data.id);

      if (index === -1) {
        throw new Error(`Blueprint with ID ${data.id} not found`);
      }

      // Process child templates if provided
      let processedChildTemplates: BlueprintChildTemplate[] | undefined = undefined;

      if (data.childTemplates) {
        processedChildTemplates = [];
        data.childTemplates.forEach((child, index) => {
          const childTemplateObj = templates.find((t) => t.id === child.templateId);

          if (childTemplateObj) {
            processedChildTemplates!.push({
              ...child,
              templateName: childTemplateObj.name,
              order: child.order || index + 1,
            });
          }
        });
      }

      // Generate or use provided helper.tpl
      let helperTpl = data.helperTpl;

      if (!helperTpl && data.variables) {
        helperTpl = generateHelperTpl(data.variables);
      }

      const updatedBlueprint: Blueprint = {
        ...blueprints[index],
        ...data,
        updatedAt: new Date().toISOString(),
        childTemplates:
          processedChildTemplates !== undefined
            ? processedChildTemplates
            : blueprints[index].childTemplates,
        helperTpl: helperTpl !== undefined ? helperTpl : blueprints[index].helperTpl,
      };

      const newBlueprints = [...blueprints];

      newBlueprints[index] = updatedBlueprint;
      saveBlueprints(newBlueprints);

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
      const index = blueprints.findIndex((b) => b.id === id);

      if (index === -1) {
        throw new Error(`Blueprint with ID ${id} not found`);
      }
      const newBlueprints = blueprints.filter((b) => b.id !== id);

      saveBlueprints(newBlueprints);
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
      const blueprint = blueprints.find((b) => b.id === id);

      if (!blueprint) {
        throw new Error(`Blueprint with ID ${id} not found`);
      }

      const newBlueprint: Blueprint = {
        ...blueprint,
        id: uuidv4(),
        name: `${blueprint.name} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure child templates are properly copied
        childTemplates: blueprint.childTemplates ? [...blueprint.childTemplates] : [],
      };

      const newBlueprints = [...blueprints, newBlueprint];

      saveBlueprints(newBlueprints);

      toast.success(t('toast.duplicated.title'), {
        description: t('toast.duplicated.description', { name: blueprint.name }),
      });

      return newBlueprint;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate blueprint');

      toast.error(t('toast.error.title'), {
        description: error.message,
      });
      throw error;
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
  };
}
