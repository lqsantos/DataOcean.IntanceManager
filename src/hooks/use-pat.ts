// src/hooks/use-pat.ts
import { useEffect, useState } from 'react';

import { PATService } from '@/services/pat-service';
import type { PATDto, PATStatus } from '@/types/pat';

interface UsePATOptions {
  /**
   * Indica se o status do token deve ser carregado automaticamente ao inicializar o hook
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Hook para gerenciar operações relacionadas ao Personal Access Token (PAT)
 */
export function usePAT(options: UsePATOptions = {}) {
  const { autoFetch = true } = options;

  const [status, setStatus] = useState<PATStatus>({
    configured: false,
    lastUpdated: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtém o status atual do token
   */
  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const patStatus = await PATService.getStatus();

      setStatus(patStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter status do token');
      console.error('Erro ao obter status do token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Configura um novo token
   */
  const createToken = async (data: PATDto) => {
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
      setError(err instanceof Error ? err.message : 'Erro ao configurar o token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza um token existente
   */
  const updateToken = async (data: PATDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await PATService.updateToken(data);

      setStatus({
        configured: true,
        lastUpdated: response.lastUpdated,
      });

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar o token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar o status do token automaticamente se autoFetch=true
  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }
  }, [autoFetch]);

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
