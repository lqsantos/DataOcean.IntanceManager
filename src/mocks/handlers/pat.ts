// src/mocks/handlers/pat.ts
import { delay, http, HttpResponse } from 'msw';

import { patData } from '../data/pat';

// Handler para as requisições relacionadas ao PAT
export const patHandlers = [
  // GET /api/pat - Obter status do token
  http.get('/api/pat', async () => {
    console.log('🔄 MSW intercepted GET /api/pat');
    // Simular latência de rede
    await delay(300);

    // Retornar apenas o status e a data da última atualização
    // Omitir o token por segurança
    return HttpResponse.json({
      configured: patData.configured,
      lastUpdated: patData.lastUpdated,
    });
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

      // Armazenar o novo token
      Object.assign(patData, {
        configured: true,
        lastUpdated: new Date().toISOString(),
        token: data.token,
      });

      console.log('✅ Token configured successfully:', patData.configured);

      // Retornar sucesso (sem incluir o token na resposta)
      return HttpResponse.json(
        {
          configured: true,
          lastUpdated: patData.lastUpdated,
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

  // PUT /api/pat - Atualizar token existente
  http.put('/api/pat', async ({ request }) => {
    console.log('🔄 MSW intercepted PUT /api/pat');
    await delay(500);

    try {
      const data = await request.json();

      console.log('📦 PUT /api/pat received data:', data);

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

      // Verificar se já existe um token configurado
      if (!patData.configured) {
        console.log('❌ No token configured to update');

        return new HttpResponse(
          JSON.stringify({ message: 'Não há token configurado para atualizar' }),
          { status: 404 }
        );
      }

      // Atualizar o token
      Object.assign(patData, {
        lastUpdated: new Date().toISOString(),
        token: data.token,
      });

      console.log('✅ Token updated successfully');

      // Retornar sucesso (sem incluir o token na resposta)
      return HttpResponse.json({
        configured: true,
        lastUpdated: patData.lastUpdated,
      });
    } catch (error) {
      console.error('❌ Error updating token:', error);

      return new HttpResponse(JSON.stringify({ message: 'Erro ao processar a requisição' }), {
        status: 400,
      });
    }
  }),
];
