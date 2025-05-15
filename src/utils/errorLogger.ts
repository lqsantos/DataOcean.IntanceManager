/**
 * Utilitário para log de erros com detalhes adicionais
 */
export function logError(error: any, context?: string): void {
  console.error(`[${context || 'Erro'}]`, {
    message: error.message,
    stack: error.stack,
    status: error.status || error.statusCode,
    response: error.response?.data,
    details: error.details || 'Sem detalhes adicionais',
  });
}

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  errorMessage: string = 'Operação falhou'
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;

    return [data, null];
  } catch (error) {
    logError(error, errorMessage);

    return [null, error instanceof Error ? error : new Error(errorMessage)];
  }
}
