// src/mocks/handlers/pat.ts
import { delay, http, HttpResponse } from 'msw';

import { patData } from '../data/pat';

// Array para armazenar múltiplas PATs (preparando para o futuro)
// No MVP, apenas uma PAT é usada
const pats = patData.configured
  ? [
      {
        id: '1',
        configured: patData.configured,
        lastUpdated: patData.lastUpdated,
        token: patData.token,
        name: 'PAT Default',
        provider: 'azure-devops',
        isDefault: true,
      },
    ]
  : [];

// Handler para as requisições relacionadas ao PAT
export const patHandlers = [
  // GET /api/pat/status - Obter apenas o status do token (sem expor o token)
  http.get('/api/pat/status', async ({ request }) => {
    console.log('🔄 MSW intercepted GET /api/pat/status');
    // Simular latência de rede
    await delay(300);

    // Verificar se há um ID específico na query string
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Buscar uma PAT específica pelo ID
      const pat = pats.find((p) => p.id === id);

      if (!pat) {
        return new HttpResponse(JSON.stringify({ message: `Token com ID ${id} não encontrado` }), {
          status: 404,
        });
      }

      // Retornar o status da PAT específica (sem o token)
      return HttpResponse.json({
        id: pat.id,
        configured: pat.configured,
        lastUpdated: pat.lastUpdated,
        name: pat.name,
        provider: pat.provider,
        isDefault: pat.isDefault,
      });
    }

    // Retrocompatibilidade: retornar o status da PAT padrão (para o MVP)
    const defaultPat = pats.find((p) => p.isDefault) || (pats.length > 0 ? pats[0] : null);

    if (!defaultPat) {
      return HttpResponse.json({
        configured: false,
        lastUpdated: null,
      });
    }

    return HttpResponse.json({
      id: defaultPat.id,
      configured: defaultPat.configured,
      lastUpdated: defaultPat.lastUpdated,
      name: defaultPat.name,
      provider: defaultPat.provider,
      isDefault: defaultPat.isDefault,
    });
  }),

  // GET /api/pat/status/all - Obter status de todas as PATs (sem expor os tokens)
  http.get('/api/pat/status/all', async () => {
    console.log('🔄 MSW intercepted GET /api/pat/status/all');
    await delay(300);

    // Retornar status de todas as PATs, sem expor os tokens
    return HttpResponse.json(
      pats.map((pat) => ({
        id: pat.id,
        configured: pat.configured,
        lastUpdated: pat.lastUpdated,
        name: pat.name,
        provider: pat.provider,
        isDefault: pat.isDefault,
      }))
    );
  }),

  // GET /api/pat - Obter o token completo (para uso em operações que necessitam do token)
  http.get('/api/pat', async ({ request }) => {
    console.log('🔄 MSW intercepted GET /api/pat');
    // Simular latência de rede
    await delay(300);

    // Verificar se há um ID específico na query string
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Buscar uma PAT específica pelo ID
      const pat = pats.find((p) => p.id === id);

      if (!pat) {
        return new HttpResponse(JSON.stringify({ message: `Token com ID ${id} não encontrado` }), {
          status: 404,
        });
      }

      // Retornar a PAT completa incluindo o token
      return HttpResponse.json(pat);
    }

    // Retrocompatibilidade: retornar a PAT padrão (para o MVP)
    const defaultPat = pats.find((p) => p.isDefault) || (pats.length > 0 ? pats[0] : null);

    // Verificar se há token configurado
    if (!defaultPat) {
      return new HttpResponse(JSON.stringify({ message: 'Nenhum token de acesso configurado' }), {
        status: 404,
      });
    }

    // Retornar o token para operações que requerem autenticação
    return HttpResponse.json(defaultPat);
  }),

  // POST /api/pat - Criar novo token
  http.post('/api/pat', async ({ request }) => {
    console.log('🔄 MSW intercepted POST /api/pat');
    await delay(500);

    try {
      const data = await request.json();

      console.log('📦 POST /api/pat received data:', data);

      // Validação do token
      if (!data.token) {
        console.log('❌ Token validation failed: Token is empty');

        return new HttpResponse(JSON.stringify({ message: 'Token não pode estar vazio' }), {
          status: 400,
        });
      }

      if (data.token.length < 8) {
        console.log('❌ Token validation failed: Token too short');

        return new HttpResponse(
          JSON.stringify({ message: 'Token deve ter pelo menos 8 caracteres' }),
          { status: 400 }
        );
      }

      // Gerar ID único para o novo token
      const newId = String(Date.now());
      const isFirstToken = pats.length === 0;

      // Criar nova PAT
      const newPat = {
        id: newId,
        configured: true,
        lastUpdated: new Date().toISOString(),
        token: data.token,
        name: data.name || `PAT ${newId}`,
        provider: data.provider || 'azure-devops',
        isDefault: isFirstToken, // Primeiro token é automaticamente o padrão
      };

      // Adicionar ao array de PATs
      pats.push(newPat);

      // Atualizar também o patData para retrocompatibilidade (MVP)
      if (isFirstToken) {
        Object.assign(patData, {
          configured: true,
          lastUpdated: newPat.lastUpdated,
          token: data.token,
        });
      }

      console.log('✅ Token configured successfully:', newPat.id);

      // Retornar sucesso (sem incluir o token na resposta)
      return HttpResponse.json(
        {
          id: newPat.id,
          configured: true,
          lastUpdated: newPat.lastUpdated,
          name: newPat.name,
          provider: newPat.provider,
          isDefault: newPat.isDefault,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('❌ Error processing token:', error);

      return new HttpResponse(JSON.stringify({ message: 'Erro ao processar a requisição' }), {
        status: 400,
      });
    }
  }),

  // PUT /api/pat/:id - Atualizar token existente
  http.put('/api/pat/:id', async ({ request, params }) => {
    const { id } = params;

    console.log(`🔄 MSW intercepted PUT /api/pat/${id}`);
    await delay(500);

    try {
      const data = await request.json();

      console.log(`📦 PUT /api/pat/${id} received data:`, data);

      // Validação do token
      if (data.token && data.token.length < 8) {
        console.log('❌ Token validation failed: Token too short');

        return new HttpResponse(
          JSON.stringify({ message: 'Token deve ter pelo menos 8 caracteres' }),
          { status: 400 }
        );
      }

      // Buscar PAT a ser atualizada
      const patIndex = pats.findIndex((p) => p.id === id);

      if (patIndex === -1) {
        console.log(`❌ No token found with ID ${id}`);

        return new HttpResponse(JSON.stringify({ message: `Token com ID ${id} não encontrado` }), {
          status: 404,
        });
      }

      // Atualizar a PAT
      const updatedPat = {
        ...pats[patIndex],
        lastUpdated: new Date().toISOString(),
        token: data.token || pats[patIndex].token,
        name: data.name || pats[patIndex].name,
        provider: data.provider || pats[patIndex].provider,
      };

      pats[patIndex] = updatedPat;

      // Se for a PAT padrão, atualizar também o patData para retrocompatibilidade (MVP)
      if (updatedPat.isDefault) {
        Object.assign(patData, {
          configured: true,
          lastUpdated: updatedPat.lastUpdated,
          token: updatedPat.token,
        });
      }

      console.log('✅ Token updated successfully');

      // Retornar sucesso (sem incluir o token na resposta)
      return HttpResponse.json({
        id: updatedPat.id,
        configured: true,
        lastUpdated: updatedPat.lastUpdated,
        name: updatedPat.name,
        provider: updatedPat.provider,
        isDefault: updatedPat.isDefault,
      });
    } catch (error) {
      console.error('❌ Error updating token:', error);

      return new HttpResponse(JSON.stringify({ message: 'Erro ao processar a requisição' }), {
        status: 400,
      });
    }
  }),

  // DELETE /api/pat/:id - Excluir um token
  http.delete('/api/pat/:id', async ({ params }) => {
    const { id } = params;

    console.log(`🔄 MSW intercepted DELETE /api/pat/${id}`);
    await delay(300);

    // Buscar PAT a ser excluída
    const patIndex = pats.findIndex((p) => p.id === id);

    if (patIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: `Token com ID ${id} não encontrado` }), {
        status: 404,
      });
    }

    // Verificar se é a PAT padrão
    const isDefault = pats[patIndex].isDefault;

    // Remover a PAT
    pats.splice(patIndex, 1);

    // Se era a PAT padrão e ainda existem outras PATs, definir a primeira como padrão
    if (isDefault && pats.length > 0) {
      pats[0].isDefault = true;

      // Atualizar também o patData para retrocompatibilidade (MVP)
      Object.assign(patData, {
        configured: true,
        lastUpdated: pats[0].lastUpdated,
        token: pats[0].token,
      });
    } else if (pats.length === 0) {
      // Se não há mais PATs, atualizar patData para refletir isso
      Object.assign(patData, {
        configured: false,
        lastUpdated: null,
        token: undefined,
      });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /api/pat/:id/default - Definir um token como padrão
  http.patch('/api/pat/:id/default', async ({ params }) => {
    const { id } = params;

    console.log(`🔄 MSW intercepted PATCH /api/pat/${id}/default`);
    await delay(300);

    // Buscar PAT a ser definida como padrão
    const patIndex = pats.findIndex((p) => p.id === id);

    if (patIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: `Token com ID ${id} não encontrado` }), {
        status: 404,
      });
    }

    // Remover a flag isDefault de todas as PATs
    pats.forEach((p) => {
      p.isDefault = false;
    });

    // Definir a PAT selecionada como padrão
    pats[patIndex].isDefault = true;

    // Atualizar também o patData para retrocompatibilidade (MVP)
    Object.assign(patData, {
      configured: true,
      lastUpdated: pats[patIndex].lastUpdated,
      token: pats[patIndex].token,
    });

    return HttpResponse.json({
      id: pats[patIndex].id,
      configured: pats[patIndex].configured,
      lastUpdated: pats[patIndex].lastUpdated,
      name: pats[patIndex].name,
      provider: pats[patIndex].provider,
      isDefault: true,
    });
  }),
];
