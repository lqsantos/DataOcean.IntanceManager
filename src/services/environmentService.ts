import { logError, safeAsync } from '@/utils/errorLogger';

interface Environment {
  id: string;
  name: string;
  status: string;
  // outros campos conforme necessário
}

export class EnvironmentService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  async getEnvironments(): Promise<Environment[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/environments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Considerar adicionar cabeçalhos de autenticação se necessário
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`, {
          cause: { status: response.status, data: errorData },
        });
      }

      return await response.json();
    } catch (error) {
      logError(error, 'Falha ao buscar ambientes');
      throw new Error('Falha ao buscar ambientes', { cause: error });
    }
  }

  async getEnvironmentDetails(id: string): Promise<Environment> {
    const [data, error] = await safeAsync(
      fetch(`${this.apiBaseUrl}/environments/${id}`).then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      }),
      `Falha ao buscar detalhes do ambiente ${id}`
    );

    if (error) throw error;
    return data as Environment;
  }
}

export const environmentService = new EnvironmentService();
