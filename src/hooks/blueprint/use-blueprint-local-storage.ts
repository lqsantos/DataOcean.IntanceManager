import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { BlueprintFormData } from '@/contexts/blueprint-form-context';

const STORAGE_PREFIX = 'dataocean-blueprint-draft-';

/**
 * Hook para gerenciar rascunhos de blueprints no armazenamento local
 * Fornece funções para salvar, carregar e listar rascunhos
 */
export function useBlueprintLocalStorage() {
  /**
   * Salva o rascunho no localStorage e retorna o ID para referência futura
   */
  const saveDraftToStorage = useCallback(async (formData: BlueprintFormData): Promise<string> => {
    try {
      // Gerar ID único se não existir
      const draftId = uuidv4();
      const draftKey = `${STORAGE_PREFIX}${draftId}`;

      // Adicionar metadados do rascunho
      const draftItem = {
        data: formData,
        timestamp: new Date().toISOString(),
        name: formData.metadata?.name || 'Rascunho sem nome',
      };

      // Salvar no localStorage
      localStorage.setItem(draftKey, JSON.stringify(draftItem));

      // Atualizar o índice de rascunhos
      const indexKey = `${STORAGE_PREFIX}index`;
      const indexString = localStorage.getItem(indexKey);
      const index = indexString ? JSON.parse(indexString) : [];

      // Adicionar ao índice se não existir
      if (!index.includes(draftId)) {
        index.push(draftId);
        localStorage.setItem(indexKey, JSON.stringify(index));
      }

      return draftId;
    } catch (error) {
      console.error('Erro ao salvar rascunho no localStorage:', error);
      throw new Error('Falha ao salvar rascunho localmente');
    }
  }, []);

  /**
   * Carrega um rascunho do localStorage pelo ID
   */
  const loadDraftFromStorage = useCallback(
    async (draftId: string): Promise<BlueprintFormData | null> => {
      try {
        const draftKey = `${STORAGE_PREFIX}${draftId}`;
        const draftString = localStorage.getItem(draftKey);

        if (!draftString) {
          return null;
        }

        const draftItem = JSON.parse(draftString);

        return draftItem.data;
      } catch (error) {
        console.error('Erro ao carregar rascunho do localStorage:', error);

        return null;
      }
    },
    []
  );

  /**
   * Remove um rascunho do localStorage pelo ID
   */
  const removeDraft = useCallback((draftId: string): boolean => {
    try {
      const draftKey = `${STORAGE_PREFIX}${draftId}`;

      localStorage.removeItem(draftKey);

      // Atualizar o índice de rascunhos
      const indexKey = `${STORAGE_PREFIX}index`;
      const indexString = localStorage.getItem(indexKey);

      if (indexString) {
        const index = JSON.parse(indexString);
        const newIndex = index.filter((id: string) => id !== draftId);

        localStorage.setItem(indexKey, JSON.stringify(newIndex));
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover rascunho do localStorage:', error);

      return false;
    }
  }, []);

  /**
   * Lista todos os rascunhos disponíveis
   * @returns Array de objetos com {id, name, timestamp}
   */
  const listDrafts = useCallback(async (): Promise<
    Array<{
      id: string;
      name: string;
      timestamp: string;
    }>
  > => {
    try {
      const indexKey = `${STORAGE_PREFIX}index`;
      const indexString = localStorage.getItem(indexKey);

      if (!indexString) {
        return [];
      }

      const index = JSON.parse(indexString);
      const drafts = [];

      for (const draftId of index) {
        const draftKey = `${STORAGE_PREFIX}${draftId}`;
        const draftString = localStorage.getItem(draftKey);

        if (draftString) {
          const draftItem = JSON.parse(draftString);

          drafts.push({
            id: draftId,
            name: draftItem.name,
            timestamp: draftItem.timestamp,
          });
        }
      }

      // Ordenar do mais recente para o mais antigo
      return drafts.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Erro ao listar rascunhos do localStorage:', error);

      return [];
    }
  }, []);

  return {
    saveDraftToStorage,
    loadDraftFromStorage,
    removeDraft,
    listDrafts,
  };
}
