import { delay, http, HttpResponse } from 'msw';

import type { GitSource } from '@/types/git-source';

// Estado inicial (nenhuma fonte Git configurada)
let gitSource: GitSource | null = null;

export const gitSourceHandlers = [
  // GET /api/git-source
  http.get('/api/git-source', async () => {
    console.log('🔄 MSW intercepted GET /api/git-source');
    await delay(300);

    if (!gitSource) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(gitSource);
  }),

  // POST /api/git-source (criar nova fonte Git)
  http.post('/api/git-source', async ({ request }) => {
    console.log('🔄 MSW intercepted POST /api/git-source');
    await delay(500);

    const data = await request.json();

    console.log('📦 POST /api/git-source received data:', data);

    // Validar campos obrigatórios com base no provedor
    if (!data.name || !data.provider || !data.url || !data.token) {
      console.log('❌ Validation failed: Missing required fields');

      return new HttpResponse(
        JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }),
        { status: 400 }
      );
    }

    // Validações específicas por provedor
    if (data.provider === 'github' && !data.organization) {
      console.log('❌ Validation failed: Missing GitHub organization');

      return new HttpResponse(
        JSON.stringify({ message: 'O campo Owner é obrigatório para fontes GitHub' }),
        { status: 400 }
      );
    }

    if (data.provider === 'gitlab' && !data.namespace) {
      console.log('❌ Validation failed: Missing GitLab namespace');

      return new HttpResponse(
        JSON.stringify({ message: 'O campo Namespace é obrigatório para fontes GitLab' }),
        { status: 400 }
      );
    }

    if (data.provider === 'azure-devops' && (!data.organization || !data.project)) {
      console.log('❌ Validation failed: Missing Azure DevOps organization or project');

      return new HttpResponse(
        JSON.stringify({
          message: 'Os campos Organização e Projeto são obrigatórios para fontes Azure DevOps',
        }),
        { status: 400 }
      );
    }

    // Verificar se já existe uma fonte Git
    if (gitSource) {
      console.log('❌ Validation failed: Git source already exists');

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
      namespace: data.namespace || undefined,
      organization: data.organization || undefined,
      project: data.project || undefined,
      status: 'active',
      repositoryCount: Math.floor(Math.random() * 100) + 5,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    gitSource = newGitSource;
    console.log('✅ Git source created successfully:', newGitSource.id);

    // Remover o token da resposta por segurança
    const responseGitSource = { ...newGitSource };

    delete responseGitSource.token;

    return HttpResponse.json(responseGitSource, { status: 201 });
  }),

  // PUT /api/git-source/:id (atualizar fonte Git)
  http.put('/api/git-source/:id', async ({ params, request }) => {
    console.log(`🔄 MSW intercepted PUT /api/git-source/${params.id}`);
    await delay(500);

    const { id } = params;
    const data = await request.json();

    console.log(`📦 PUT /api/git-source/${id} received data:`, data);

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      console.log('❌ Git source not found');

      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Validações específicas por provedor
    if (data.provider === 'github' && data.provider === gitSource.provider && !data.organization) {
      console.log('❌ Validation failed: Missing GitHub organization');

      return new HttpResponse(
        JSON.stringify({ message: 'O campo Owner é obrigatório para fontes GitHub' }),
        { status: 400 }
      );
    }

    if (data.provider === 'gitlab' && data.provider === gitSource.provider && !data.namespace) {
      console.log('❌ Validation failed: Missing GitLab namespace');

      return new HttpResponse(
        JSON.stringify({ message: 'O campo Namespace é obrigatório para fontes GitLab' }),
        { status: 400 }
      );
    }

    if (
      data.provider === 'azure-devops' &&
      data.provider === gitSource.provider &&
      (!data.organization || !data.project)
    ) {
      console.log('❌ Validation failed: Missing Azure DevOps organization or project');

      return new HttpResponse(
        JSON.stringify({
          message: 'Os campos Organização e Projeto são obrigatórios para fontes Azure DevOps',
        }),
        { status: 400 }
      );
    }

    // Atualizar a fonte Git
    gitSource = {
      ...gitSource,
      name: data.name || gitSource.name,
      url: data.url || gitSource.url,
      token: data.token || gitSource.token, // Mantém o token existente se não fornecido
      organization: data.organization !== undefined ? data.organization : gitSource.organization,
      namespace: data.namespace !== undefined ? data.namespace : gitSource.namespace,
      project: data.project !== undefined ? data.project : gitSource.project,
      notes: data.notes !== undefined ? data.notes : gitSource.notes,
      updatedAt: new Date().toISOString(),
    };

    // Remover o token da resposta por segurança
    const responseGitSource = { ...gitSource };

    delete responseGitSource.token;

    console.log('✅ Git source updated successfully');

    return HttpResponse.json(responseGitSource);
  }),

  // POST /api/git-source/:id/test-connection (testar conexão)
  http.post('/api/git-source/:id/test-connection', async ({ params }) => {
    console.log(`🔄 MSW intercepted POST /api/git-source/${params.id}/test-connection`);
    await delay(800); // Simular o tempo de resposta do teste

    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      console.log('❌ Git source not found');

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

      console.log('✅ Test connection successful:', repositoryCount, 'repositories found');

      return HttpResponse.json({
        success: true,
        message: 'Conexão bem sucedida!',
        repositoryCount,
      });
    } else {
      console.log('❌ Test connection failed');

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
  http.patch('/api/git-source/:id/activate', async ({ params }) => {
    console.log(`🔄 MSW intercepted PATCH /api/git-source/${params.id}/activate`);
    await delay(300);

    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      console.log('❌ Git source not found');

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

    // Remover o token da resposta por segurança
    const responseGitSource = { ...gitSource };

    delete responseGitSource.token;

    console.log('✅ Git source activated');

    return HttpResponse.json(responseGitSource);
  }),

  // PATCH /api/git-source/:id/deactivate (desativar fonte Git)
  http.patch('/api/git-source/:id/deactivate', async ({ params }) => {
    console.log(`🔄 MSW intercepted PATCH /api/git-source/${params.id}/deactivate`);
    await delay(300);

    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      console.log('❌ Git source not found');

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

    // Remover o token da resposta por segurança
    const responseGitSource = { ...gitSource };

    delete responseGitSource.token;

    console.log('✅ Git source deactivated');

    return HttpResponse.json(responseGitSource);
  }),

  // DELETE /api/git-source/:id (excluir fonte Git)
  http.delete('/api/git-source/:id', async ({ params }) => {
    console.log(`🔄 MSW intercepted DELETE /api/git-source/${params.id}`);
    await delay(400);

    const { id } = params;

    // Verificar se a fonte Git existe
    if (!gitSource || gitSource.id !== id) {
      console.log('❌ Git source not found');

      return new HttpResponse(JSON.stringify({ message: 'Fonte Git não encontrada' }), {
        status: 404,
      });
    }

    // Excluir a fonte Git
    gitSource = null;
    console.log('✅ Git source deleted');

    return new HttpResponse(null, { status: 204 });
  }),
];
