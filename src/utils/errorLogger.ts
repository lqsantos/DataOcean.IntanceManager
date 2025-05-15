/**
 * Interface for extended error types with additional properties
 */
interface ExtendedError {
  status?: number;
  statusCode?: number;
  response?: {
    data?: unknown;
  };
  details?: string;
}

/**
 * Type guard to check if an object is an ExtendedError
 */
function isExtendedError(error: unknown): error is ExtendedError {
  return typeof error === 'object' && error !== null;
}

/**
 * Utilitário para log de erros com detalhes adicionais
 */
export function logError(error: Error | unknown, context?: string): void {
  const extendedError = isExtendedError(error) ? error : {};

  console.error(`[${context || 'Erro'}]`, {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    stack: error instanceof Error ? error.stack : undefined,
    status: extendedError.status || extendedError.statusCode,
    response: extendedError.response?.data,
    details: extendedError.details || 'Sem detalhes adicionais',
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
