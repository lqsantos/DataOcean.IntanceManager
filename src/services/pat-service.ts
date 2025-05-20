// src/services/pat-service.ts
import type { PATDto, PATResponse, PATStatus } from '@/types/pat';

/**
 * Serviço para gerenciar Personal Access Tokens (PATs)
 */
export class PATService {
  /**
   * Obter o status atual do token de acesso sem expor o token
   * @param id ID opcional do token para buscar um token específico
   */
  static async getStatus(id?: string): Promise<PATStatus> {
    try {
      // Se um ID for fornecido, buscar status de uma PAT específica
      const url = id ? `/api/pat/status?id=${id}` : '/api/pat/status';
      const response = await fetch(url);

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
   * Obter todos os tokens de acesso configurados (apenas status, sem expor os tokens)
   */
  static async getAllTokensStatus(): Promise<PATStatus[]> {
    try {
      const response = await fetch('/api/pat/status/all');

      if (!response.ok) {
        throw new Error(`Erro ao obter status dos tokens: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter status dos tokens:', error);

      return [];
    }
  }

  /**
   * Obter o token completo (use apenas quando necessário para operações que precisam do token)
   * @param id ID opcional do token para buscar um token específico
   */
  static async getToken(id?: string): Promise<PATResponse> {
    // Se um ID for fornecido, buscar um PAT específico
    const url = id ? `/api/pat?id=${id}` : '/api/pat';
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || 'Erro ao obter o token');
    }

    return await response.json();
  }

  /**
   * Configurar um novo token de acesso
   * @param data Dados do token a ser criado
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
   * @param id ID do token a ser atualizado
   * @param data Novos dados do token
   */
  static async updateToken(id: string, data: PATDto): Promise<PATResponse> {
    const response = await fetch(`/api/pat/${id}`, {
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

  /**
   * Excluir um token de acesso
   * @param id ID do token a ser excluído
   */
  static async deleteToken(id: string): Promise<void> {
    const response = await fetch(`/api/pat/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || 'Erro ao excluir o token');
    }
  }

  /**
   * Define um token de acesso como padrão para uso com serviços Git
   * @param id ID do token a ser definido como padrão
   */
  static async setDefaultToken(id: string): Promise<PATResponse> {
    const response = await fetch(`/api/pat/${id}/default`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || 'Erro ao definir o token como padrão');
    }

    return await response.json();
  }
}
