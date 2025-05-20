// src/types/pat.ts

/**
 * Representa o status de um Token de Acesso Pessoal (PAT)
 */
export interface PATStatus {
  /**
   * Indica se um token está configurado
   */
  configured: boolean;

  /**
   * Data da última atualização do token no formato ISO string
   * Será null se não houver token configurado
   */
  lastUpdated: string | null;
}

/**
 * DTO para criar ou atualizar um token
 */
export interface PATDto {
  /**
   * O valor do token
   */
  token: string;
}

/**
 * Resposta da API após criar ou atualizar um token
 */
export interface PATResponse {
  /**
   * Indica se o token está configurado
   */
  configured: boolean;

  /**
   * Data da última atualização do token
   */
  lastUpdated: string;

  /**
   * Mensagem de sucesso opcional
   */
  message?: string;

  /**
   * O valor do token (retornado apenas em operações específicas)
   */
  token?: string;
}
