import { setupWorker } from 'msw/browser';

import { handlers } from './handlers/index';

// Configuração básica do worker
export const worker = setupWorker(...handlers);

// Log all handlers for debugging
console.log('🔍 MSW Handlers registered:', handlers.length);

// Função para inicializar com configurações avançadas
export async function startWorker() {
  try {
    await worker.start({
      // Configuração para ignorar requisições não tratadas e para UI-Avatars
      onUnhandledRequest: (request, print) => {
        // Verificar se a URL contém ui-avatars.com
        if (request.url.includes('ui-avatars.com')) {
          // Silenciosamente ignorar (sem aviso no console)
          return;
        }

        // Log all unhandled requests for debugging
        console.log('⚠️ Unhandled request:', request.method, request.url);

        // Para todas as outras requisições não tratadas
        // Mostrar aviso no console (opcional)
        print.warning();
      },

      // Configuração do service worker
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          // Force update on every page load
          updateViaCache: 'none',
        },
      },
    });

    console.log('✅ Mock Service Worker inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar Mock Service Worker:', error);
    console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
  }
}
