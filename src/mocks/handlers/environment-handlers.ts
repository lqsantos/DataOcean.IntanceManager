import { http, HttpResponse } from 'msw';
// Dados mockados
let environments = [
  {
    id: '1',
    name: 'Development',
    slug: 'dev',
    order: 1,
    status: 'Ready',
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Staging',
    slug: 'stg',
    order: 2,
    status: 'Ready',
    createdAt: '2023-01-15T10:35:00Z',
  },
  {
    id: '3',
    name: 'Production',
    slug: 'prod',
    order: 3,
    status: 'Active',
    createdAt: '2023-01-15T10:40:00Z',
  },
];

export const environmentHandlers = [
  // Handler para URL completa
  http.get('http://localhost:3000/api/environments', () => {
    console.log('🔄 Handler interceptou GET com URL completa');
    return HttpResponse.json(environments);
  }),
  
  // Handler para URL relativa
  http.get('/api/environments', () => {
    console.log('🔄 Handler interceptou GET com URL relativa');
    return HttpResponse.json(environments);
  }),

  // POST /api/environments
  http.post('/api/environments', async ({ request }) => {
    const data = await request.json();

    // Validações
    if (!data.name || !data.slug) {
      return new HttpResponse(JSON.stringify({ message: 'Nome e slug são obrigatórios' }), {
        status: 400,
      });
    }

    // Verificar se o slug já existe
    if (environments.some((env) => env.slug === data.slug)) {
      return new HttpResponse(
        JSON.stringify({ message: `Já existe um ambiente com o slug "${data.slug}"` }),
        { status: 409 }
      );
    }

    const newEnvironment = {
      id: Date.now().toString(),
      name: data.name,
      slug: data.slug,
      order: data.order ?? environments.length + 1,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };

    environments = [...environments, newEnvironment];

    return HttpResponse.json(newEnvironment, { status: 201 });
  }),

  // PATCH /api/environments/:id
  http.patch('/api/environments/:id', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();

    // Verificar se o ambiente existe
    const environmentIndex = environments.findIndex((env) => env.id === id);
    if (environmentIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
        status: 404,
      });
    }

    // Verificar se o slug já existe (e não é o mesmo ambiente)
    if (
      data.slug &&
      data.slug !== environments[environmentIndex].slug &&
      environments.some((env) => env.slug === data.slug)
    ) {
      return new HttpResponse(
        JSON.stringify({ message: `Já existe um ambiente com o slug "${data.slug}"` }),
        { status: 409 }
      );
    }

    const updatedEnvironment = {
      ...environments[environmentIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    environments = [
      ...environments.slice(0, environmentIndex),
      updatedEnvironment,
      ...environments.slice(environmentIndex + 1),
    ];

    return HttpResponse.json(updatedEnvironment);
  }),

  // DELETE /api/environments/:id
  http.delete('/api/environments/:id', ({ params }) => {
    const { id } = params;

    // Verificar se o ambiente existe
    const environmentIndex = environments.findIndex((env) => env.id === id);
    if (environmentIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Ambiente não encontrado' }), {
        status: 404,
      });
    }

    environments = [
      ...environments.slice(0, environmentIndex),
      ...environments.slice(environmentIndex + 1),
    ];

    return new HttpResponse(null, { status: 204 });
  }),
];
