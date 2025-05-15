import { http, HttpResponse } from 'msw';

// Sample data
const environments = [
  { id: '1', name: 'Development', slug: 'dev', order: 1 },
  { id: '2', name: 'Staging', slug: 'stg', order: 2 },
  { id: '3', name: 'Production', slug: 'prod', order: 3 },
];

export const environmentsHandlers = [
  // GET /api/environments
  http.get('/api/environments', () => {
    return HttpResponse.json(environments);
  }),

  // GET /api/environments/:id
  http.get('/api/environments/:id', ({ params }) => {
    const { id } = params;
    const environment = environments.find((e) => e.id === id);

    if (!environment) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(environment);
  }),

  // POST /api/environments
  http.post('/api/environments', async ({ request }) => {
    const newEnvironment = await request.json();
    const id = String(environments.length + 1);
    const createdEnvironment = { id, ...newEnvironment };

    environments.push(createdEnvironment);
    return HttpResponse.json(createdEnvironment, { status: 201 });
  }),

  // PUT /api/environments/:id
  http.put('/api/environments/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const index = environments.findIndex((e) => e.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    environments[index] = { ...environments[index], ...updatedData };
    return HttpResponse.json(environments[index]);
  }),

  // DELETE /api/environments/:id
  http.delete('/api/environments/:id', ({ params }) => {
    const { id } = params;
    const index = environments.findIndex((e) => e.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const deleted = environments.splice(index, 1)[0];
    return HttpResponse.json(deleted);
  }),
];
