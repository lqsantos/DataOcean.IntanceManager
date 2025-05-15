import { environmentService } from '@/services/environmentService';
import { logError } from '@/utils/errorLogger';
import { useEffect, useState } from 'react';

export function useEnvironments() {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnvironments = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await environmentService.getEnvironments();
      setEnvironments(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Falha ao buscar ambientes');
      logError(error, 'useEnvironments');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  return {
    environments,
    loading,
    error,
    refetch: fetchEnvironments,
  };
}
