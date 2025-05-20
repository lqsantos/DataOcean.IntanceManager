// src/hooks/use-pat.ts
import { useCallback, useEffect, useState } from 'react';

import { PATService } from '@/services/pat-service';
import type { PATDto, PATStatus } from '@/types/pat';

interface UsePATOptions {
  /**
   * Indica se o status do token deve ser carregado automaticamente ao inicializar o hook
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Intervalo em segundos para verificar automaticamente o status do token
   * @default 0 (desativado)
   */
  pollingInterval?: number;
}

/**
 * Hook para gerenciar operações relacionadas ao Personal Access Token (PAT)
 */
export function usePAT(options: UsePATOptions = {}) {
  const { 
    autoFetch = true, 
    pollingInterval = 0 
  } = options;
  
  const [status, setStatus] = useState<PATStatus>({
    configured: false,
    lastUpdated: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtém o status atual do token
   */
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const patStatus = await PATService.getStatus();

      setStatus(patStatus);

      return patStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter status do token';

      setError(errorMessage);
      console.error('Erro ao obter status do token:', err);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Configura um novo token
   */
  const createToken = useCallback(async (data: PATDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await PATService.createToken(data);

      setStatus({
        configured: true,
        lastUpdated: response.lastUpdated,
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao configurar o token';

      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Atualiza um token existente
   */
  const updateToken = useCallback(async (data: PATDto) => {
    setIsLoading(true);
    setError(null);

    try {
      // Para MVP, atualizamos o token padrão
      // No futuro, quando tivermos múltiplos tokens, precisaremos do ID
      const statusResponse = await fetchStatus();
      const tokenId = statusResponse?.id || '1'; // Fallback para o ID 1 no MVP
      
      const response = await PATService.updateToken(tokenId, data);

      setStatus({
        configured: true,
        lastUpdated: response.lastUpdated,
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar o token';

      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Carregar o status do token automaticamente se autoFetch=true
  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }
  }, [autoFetch, fetchStatus]);

  // Configurar polling para verificar atualizações no status do token
  useEffect(() => {
    if (pollingInterval <= 0) {return;}

    const intervalId = setInterval(() => {
      fetchStatus();
    }, pollingInterval * 1000);

    return () => clearInterval(intervalId);
  }, [fetchStatus, pollingInterval]);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    createToken,
    updateToken,
    isConfigured: status.configured,
    lastUpdated: status.lastUpdated,
  };
}
