import { Environment } from '@/types/environment';

// Usar URL absoluta para corresponder ao que está sendo usado na chamada
const API_BASE_URL = '/api';
// process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

export const EnvironmentService = {
  async getAll(): Promise<Environment[]> {
    const response = await fetch(`${API_BASE_URL}/environments`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha ao buscar ambientes');
    }

    return response.json();
  },

  // ... outros métodos
};
