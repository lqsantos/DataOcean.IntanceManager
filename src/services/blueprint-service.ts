// services/blueprint-service.ts
import type { Blueprint, CreateBlueprintDto, UpdateBlueprintDto } from '@/types/blueprint';

export const blueprintService = {
  async getAllBlueprints(): Promise<Blueprint[]> {
    const response = await fetch('/api/blueprints');

    if (!response.ok) {
      throw new Error('Failed to fetch blueprints');
    }

    return response.json();
  },

  async getBlueprint(id: string): Promise<Blueprint> {
    const response = await fetch(`/api/blueprints/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blueprint with id ${id}`);
    }

    return response.json();
  },

  async createBlueprint(blueprint: CreateBlueprintDto): Promise<Blueprint> {
    const response = await fetch('/api/blueprints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blueprint),
    });

    if (!response.ok) {
      throw new Error('Failed to create blueprint');
    }

    return response.json();
  },

  async updateBlueprint(blueprint: UpdateBlueprintDto): Promise<Blueprint> {
    const response = await fetch(`/api/blueprints/${blueprint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blueprint),
    });

    if (!response.ok) {
      throw new Error(`Failed to update blueprint with id ${blueprint.id}`);
    }

    return response.json();
  },

  async deleteBlueprint(id: string): Promise<void> {
    const response = await fetch(`/api/blueprints/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete blueprint with id ${id}`);
    }
  },

  async duplicateBlueprint(id: string): Promise<Blueprint> {
    const response = await fetch(`/api/blueprints/${id}/duplicate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to duplicate blueprint with id ${id}`);
    }

    return response.json();
  },

  async createInstanceFromBlueprint(
    id: string,
    params: Record<string, any>
  ): Promise<{
    success: boolean;
    message: string;
    instanceId: string;
  }> {
    const response = await fetch(`/api/blueprints/${id}/create-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create instance from blueprint with id ${id}`);
    }

    return response.json();
  },
};
