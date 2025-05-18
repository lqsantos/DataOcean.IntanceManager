// src/mocks/handlers/application-handlers.ts
import { delay, http, HttpResponse } from 'msw';

import type { Application } from '@/types/application';

// Factory function to create a new mock application
const createApplication = (overrides?: Partial<Application>): Application => {
  const id = overrides?.id || Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  return {
    id,
    name: overrides?.name || `Application ${id.substring(0, 6)}`,
    slug: overrides?.slug || `app-${id.substring(0, 6)}`,
    description: overrides?.description || `Description for application ${id.substring(0, 6)}`,
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  };
};

// Mock database for applications
let applications: Application[] = [
  createApplication({
    id: '1',
    name: 'Frontend Web',
    slug: 'frontend-web',
    description: 'Main frontend web application',
    createdAt: '2023-01-15T10:00:00.000Z',
  }),
  createApplication({
    id: '2',
    name: 'API Gateway',
    slug: 'api-gateway',
    description: 'API Gateway service',
    createdAt: '2023-02-10T08:30:00.000Z',
  }),
  createApplication({
    id: '3',
    name: 'Auth Service',
    slug: 'auth-service',
    description: 'Authentication and authorization service',
    createdAt: '2023-03-05T14:20:00.000Z',
  }),
  createApplication({
    id: '4',
    name: 'User Service',
    slug: 'user-service',
    description: 'User management service',
    createdAt: '2023-04-12T11:45:00.000Z',
  }),
  createApplication({
    id: '5',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Real-time analytics dashboard',
    createdAt: '2023-05-20T09:15:00.000Z',
  }),
];

export const applicationHandlers = [
  // GET /api/applications - Get all applications
  http.get('/api/applications', async () => {
    // Add artificial delay to simulate network latency
    await delay(500);

    return HttpResponse.json(applications);
  }),

  // POST /api/applications - Create a new application
  http.post('/api/applications', async ({ request }) => {
    // Add artificial delay
    await delay(700);

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.slug) {
      return new HttpResponse(JSON.stringify({ message: 'Nome e slug são obrigatórios' }), {
        status: 400,
      });
    }

    // Check for duplicate slug
    if (applications.some((app) => app.slug === data.slug)) {
      return new HttpResponse(
        JSON.stringify({ message: 'Uma aplicação com este slug já existe' }),
        { status: 409 }
      );
    }

    const newApplication = createApplication({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
    });

    applications.push(newApplication);

    return HttpResponse.json(newApplication, { status: 201 });
  }),

  // GET /api/applications/:id - Get a specific application
  http.get('/api/applications/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const application = applications.find((app) => app.id === id);

    if (!application) {
      return new HttpResponse(JSON.stringify({ message: 'Aplicação não encontrada' }), {
        status: 404,
      });
    }

    return HttpResponse.json(application);
  }),

  // PUT /api/applications/:id - Update an application
  http.put('/api/applications/:id', async ({ params, request }) => {
    await delay(600);

    const { id } = params;
    const data = await request.json();
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Aplicação não encontrada' }), {
        status: 404,
      });
    }

    // Check if updating to a slug that already exists
    if (
      data.slug &&
      data.slug !== applications[applicationIndex].slug &&
      applications.some((app) => app.slug === data.slug)
    ) {
      return new HttpResponse(
        JSON.stringify({ message: 'Uma aplicação com este slug já existe' }),
        { status: 409 }
      );
    }

    const updatedApplication = {
      ...applications[applicationIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    applications[applicationIndex] = updatedApplication;

    return HttpResponse.json(updatedApplication);
  }),

  // DELETE /api/applications/:id - Delete an application
  http.delete('/api/applications/:id', async ({ params }) => {
    await delay(400);

    const { id } = params;
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Aplicação não encontrada' }), {
        status: 404,
      });
    }

    applications = applications.filter((app) => app.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),
];
