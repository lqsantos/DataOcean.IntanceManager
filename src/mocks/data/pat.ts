// src/mocks/data/pat.ts
// Define a interface para os dados do token
export interface PATData {
  configured: boolean;
  lastUpdated: string | null;
  token: string | null; // Token armazenado de forma segura (apenas para mock)
}

// Dados iniciais para o PAT
export const patData: PATData = {
  configured: false,
  lastUpdated: null,
  token: null,
};
