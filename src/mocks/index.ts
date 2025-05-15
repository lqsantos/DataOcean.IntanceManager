// Este arquivo é o ponto de entrada para o mock API

/**
 * Inicializa o mock API baseado no ambiente atual
 */
export async function initMocks() {
  // Verifica se estamos no ambiente de navegador
  if (typeof window === 'undefined') {
    return; // No modo server, não precisamos fazer nada
  }

  // No modo cliente, carregamos o MSW
  try {
    const { startWorker } = await import('./browser');
    await startWorker();
  } catch (error) {
    console.error('❌ Erro ao carregar o mock service worker:', error);
  }
}

export default initMocks;
