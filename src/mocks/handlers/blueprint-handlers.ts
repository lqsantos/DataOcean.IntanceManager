import { delay, http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

import type { Blueprint, CreateBlueprintDto, UpdateBlueprintDto } from '@/types/blueprint';

// Mock data store
let blueprints: Blueprint[] = [
  {
    id: '1',
    name: 'Web Application Blueprint',
    description: 'Standard web application with load balancing',
    category: 'Application',
    templateId: '1',
    templateName: 'Web Application Template',
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
      {
        name: 'imageTag',
        description: 'Docker image tag',
        defaultValue: 'latest',
        required: true,
        type: 'string',
      },
    ],
  },
  {
    id: '2',
    name: 'Database Blueprint',
    description: 'PostgreSQL database with persistent storage',
    category: 'Database',
    templateId: '2',
    templateName: 'Database Template',
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
      {
        name: 'databaseName',
        description: 'Name of the database to create',
        defaultValue: 'appdb',
        required: true,
        type: 'string',
      },
    ],
  },
  {
    id: '3',
    name: 'API Service Blueprint',
    description: 'REST API service with autoscaling',
    category: 'Application',
    templateId: '3',
    templateName: 'API Service Template',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variables: [
      {
        name: 'minReplicas',
        description: 'Minimum number of replicas',
        defaultValue: '2',
        required: true,
        type: 'number',
      },
      {
        name: 'maxReplicas',
        description: 'Maximum number of replicas',
        defaultValue: '10',
        required: true,
        type: 'number',
      },
    ],
  },
];

export const blueprintHandlers = [
  // Get all blueprints
  http.get('/api/blueprints', async () => {
    await delay();

    return HttpResponse.json(blueprints);
  }),

  // Get blueprint by ID
  http.get('/api/blueprints/:id', async ({ params }) => {
    await delay();
    const { id } = params;

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(blueprint);
  }),

  // Create a new blueprint
  http.post('/api/blueprints', async ({ request }) => {
    await delay();

    const data = (await request.json()) as CreateBlueprintDto;

    const newBlueprint: Blueprint = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      category: data.category,
      templateId: data.templateId,
      templateName: 'Template Name', // This would typically come from a template lookup
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variables: [],
    };

    blueprints = [...blueprints, newBlueprint];

    return HttpResponse.json(newBlueprint, { status: 201 });
  }),

  // Update a blueprint
  http.put('/api/blueprints/:id', async ({ request, params }) => {
    await delay();

    const { id } = params;
    const data = (await request.json()) as UpdateBlueprintDto;

    const index = blueprints.findIndex((b) => b.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedBlueprint = {
      ...blueprints[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    blueprints[index] = updatedBlueprint;

    return HttpResponse.json(updatedBlueprint);
  }),

  // Delete a blueprint
  http.delete('/api/blueprints/:id', async ({ params }) => {
    await delay();

    const { id } = params;

    const index = blueprints.findIndex((b) => b.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    blueprints = blueprints.filter((b) => b.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),

  // Duplicate a blueprint
  http.post('/api/blueprints/:id/duplicate', async ({ params }) => {
    await delay();

    const { id } = params;

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    const duplicatedBlueprint: Blueprint = {
      ...blueprint,
      id: uuidv4(),
      name: `${blueprint.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    blueprints = [...blueprints, duplicatedBlueprint];

    return HttpResponse.json(duplicatedBlueprint, { status: 201 });
  }),

  // Create instance from blueprint
  http.post('/api/blueprints/:id/create-instance', async ({ params, request }) => {
    await delay(1000);

    const { id } = params;
    const data = await request.json();

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    // In a real implementation, this would create an instance
    // For now, we'll just return success

    return HttpResponse.json({
      success: true,
      message: `Instance created from blueprint ${blueprint.name}`,
      instanceId: uuidv4(),
    });
  }),
];
