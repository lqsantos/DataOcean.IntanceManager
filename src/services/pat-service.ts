// src/services/pat-service.ts
import type { PATDto, PATResponse, PATStatus } from '@/types/pat';

/**
 * Serviço para gerenciar Personal Access Tokens (PATs)
 */
export class PATService {
  /**
   * Obter o status atual do token de acesso
   */
  static async getStatus(): Promise<PATStatus> {
    try {
      const response = await fetch('/api/pat');

      if (!response.ok) {
        throw new Error(`Erro ao obter status do token: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter status do token:', error);

      // Retornar um status padrão em caso de erro
      return {
        configured: false,
        lastUpdated: null,
      };
    }
  }

  /**
   * Configurar um novo token de acesso
   */
  static async createToken(data: PATDto): Promise<PATResponse> {
    const response = await fetch('/api/pat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Erro ao configurar o token');
    }

    return await response.json();
  }

  /**
   * Atualizar um token de acesso existente
   */
  static async updateToken(data: PATDto): Promise<PATResponse> {
    const response = await fetch('/api/pat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Erro ao atualizar o token');
    }

    return await response.json();
  }
}
