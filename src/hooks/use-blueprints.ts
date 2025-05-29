'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import type { Blueprint, CreateBlueprintDto, UpdateBlueprintDto } from '@/types/blueprint';

import { useTemplates } from './use-templates';

export function useBlueprintStore() {
  const { t } = useTranslation('blueprints');
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
        const template = templates.find((t) => t.id === blueprint.templateId);

        // Only update if template name is different to avoid unnecessary re-renders
        if (template && blueprint.templateName !== template.name) {
          return {
            ...blueprint,
            templateName: template.name,
          };
        }

        // Return the original blueprint if no changes
        return blueprint;
      });

      // Check if there were actual changes
      const hasChanges = updatedBlueprints.some(
        (updatedBp, index) => updatedBp.templateName !== blueprints[index].templateName
      );

      // Only update state if there were actual changes
      if (hasChanges) {
        setBlueprints(updatedBlueprints);
        // Update localStorage with the new blueprints
        localStorage.setItem('dataocean_blueprints', JSON.stringify(updatedBlueprints));
      }
    }
  }, [templates]);

  // Save blueprints to storage
  const saveBlueprints = (newBlueprints: Blueprint[]) => {
    localStorage.setItem('dataocean_blueprints', JSON.stringify(newBlueprints));
    setBlueprints(newBlueprints);
  };

  // Create a new blueprint
  const createBlueprint = async (data: CreateBlueprintDto): Promise<Blueprint> => {
    try {
      const template = templates.find((t) => t.id === data.templateId);

      const newBlueprint: Blueprint = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        category: data.category,
        templateId: data.templateId,
        templateName: template?.name || 'Unknown Template',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variables: [],
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

      const updatedBlueprint: Blueprint = {
        ...blueprints[index],
        ...data,
        updatedAt: new Date().toISOString(),
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
