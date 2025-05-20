import { http, HttpResponse } from 'msw';

import type { GitSource } from '@/types/git-source';

// Estado inicial (nenhuma fonte Git configurada)
let gitSource: GitSource | null = null;

export const gitSourceHandlers = [
  // GET /api/git-source
  http.get('/api/git-source', () => {
    if (!gitSource) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(gitSource);
  }),

  // POST /api/git-source (criar nova fonte Git)
  http.post('/api/git-source', async ({ request }) => {
    const data = await request.json();

    // Validar campos obrigatórios
    if (!data.name || !data.provider || !data.url || !data.token) {
      return new HttpResponse(
        JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }),
        { status: 400 }
      );
    }

    // Verificar se já existe uma fonte Git
    if (gitSource) {
      return new HttpResponse(
        JSON.stringify({
          message: 'Já existe uma fonte Git configurada. Só é permitida uma fonte.',
        }),
        { status: 409 }
      );
    }

    // Criar a nova fonte Git
    const newGitSource: GitSource = {
      id: Date.now().toString(),
      name: data.name,
      provider: data.provider,
      url: data.url,
      token: data.token,
      namespace: data.namespace,
      organization: data.organization,
      project: data.project,
      status: 'active',
      repositoryCount: Math.floor(Math.random() * 100) + 5,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    gitSource = newGitSource;

    return HttpResponse.json(newGitSource, { status: 201 });
  }),

  // PUT /api/git-source/:id (atualizar fonte Git)
  http.put('/api/git-source/:id', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Atualizar a fonte Git
    gitSource = {
      ...gitSource,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(gitSource);
  }),

  // POST /api/git-source/:id/test-connection (testar conexão)
  http.post('/api/git-source/:id/test-connection', ({ params }) => {
    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Simular sucesso na maioria das vezes (80%)
    const success = Math.random() < 0.8;

    if (success) {
      const repositoryCount = Math.floor(Math.random() * 100) + 5;

      gitSource = {
        ...gitSource,
        repositoryCount,
      };

      return HttpResponse.json({
        success: true,
        message: 'Conexão bem sucedida!',
        repositoryCount,
      });
    } else {
      return HttpResponse.json(
        {
          success: false,
          message: 'Falha na conexão. Verifique as credenciais e URL.',
        },
        { status: 200 }
      ); // Status 200 mas com success: false
    }
  }),

  // PATCH /api/git-source/:id/activate (ativar fonte Git)
  http.patch('/api/git-source/:id/activate', ({ params }) => {
    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Ativar a fonte Git
    gitSource = {
      ...gitSource,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(gitSource);
  }),

  // PATCH /api/git-source/:id/deactivate (desativar fonte Git)
  http.patch('/api/git-source/:id/deactivate', ({ params }) => {
    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Desativar a fonte Git
    gitSource = {
      ...gitSource,
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(gitSource);
  }),

  // DELETE /api/git-source/:id (excluir fonte Git)
  http.delete('/api/git-source/:id', ({ params }) => {
    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Excluir a fonte Git
    gitSource = null;

    return new HttpResponse(null, { status: 204 });
  }),
];
