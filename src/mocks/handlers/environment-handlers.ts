// src/mocks/handlers/environment-handlers.ts
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { rest } from 'msw';

// Dados mockados
let environments: Environment[] = [
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
  // GET /api/environments
  rest.get('/api/environments', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(environments));
  }),

  // POST /api/environments
  rest.post('/api/environments', async (req, res, ctx) => {
    const data = (await req.json()) as CreateEnvironmentDto;

    // Validações
    if (!data.name || !data.slug) {
      return res(ctx.status(400), ctx.json({ message: 'Nome e slug são obrigatórios' }));
    }

    // Verificar se o slug já existe
    if (environments.some((env) => env.slug === data.slug)) {
      return res(
        ctx.status(409),
        ctx.json({ message: `Já existe um ambiente com o slug "${data.slug}"` })
      );
    }

    const newEnvironment: Environment = {
      id: Date.now().toString(),
      name: data.name,
      slug: data.slug,
      order: data.order ?? environments.length + 1,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };

    environments = [...environments, newEnvironment];

    return res(ctx.status(201), ctx.json(newEnvironment));
  }),

  // PATCH /api/environments/:id
  rest.patch('/api/environments/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = (await req.json()) as UpdateEnvironmentDto;

    // Verificar se o ambiente existe
    const environmentIndex = environments.findIndex((env) => env.id === id);
    if (environmentIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Ambiente não encontrado' }));
    }

    // Verificar se o slug já existe (e não é o mesmo ambiente)
    if (
      data.slug &&
      data.slug !== environments[environmentIndex].slug &&
      environments.some((env) => env.slug === data.slug)
    ) {
      return res(
        ctx.status(409),
        ctx.json({ message: `Já existe um ambiente com o slug "${data.slug}"` })
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

    return res(ctx.status(200), ctx.json(updatedEnvironment));
  }),

  // DELETE /api/environments/:id
  rest.delete('/api/environments/:id', (req, res, ctx) => {
    const { id } = req.params;

    // Verificar se o ambiente existe
    const environmentIndex = environments.findIndex((env) => env.id === id);
    if (environmentIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Ambiente não encontrado' }));
    }

    environments = [
      ...environments.slice(0, environmentIndex),
      ...environments.slice(environmentIndex + 1),
    ];

    return res(ctx.status(204));
  }),
];
