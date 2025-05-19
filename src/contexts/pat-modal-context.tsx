'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { PATService } from '@/services/pat-service';
import type { PATStatus } from '@/types/pat';

interface PATModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setCallback: (callback: () => void) => void;
  onConfigured: (() => void) | null;
  status: PATStatus;
}

// Valores padrão para o contexto
const defaultContext: PATModalContextType = {
  isOpen: false,
  open: () => {},
  close: () => {},
  setCallback: () => {},
  onConfigured: null,
  status: {
    configured: false,
    lastUpdated: null,
  },
};

// Criação do contexto
const PATModalContext = createContext<PATModalContextType>(defaultContext);

// Hook para usar o contexto
export const usePATModal = () => useContext(PATModalContext);

export function PATModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfigured, setOnConfigured] = useState<(() => void) | null>(null);
  const [status, setStatus] = useState<PATStatus>({
    configured: false,
    lastUpdated: null,
  });

  // Carregar status do token ao montar o componente
  useEffect(() => {
    const fetchTokenStatus = async () => {
      try {
        const tokenStatus = await PATService.getStatus();

        setStatus(tokenStatus);
      } catch (error) {
        console.error('Erro ao verificar status do token:', error);
      }
    };

    fetchTokenStatus();
  }, []);

  // Função para abrir o modal
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Função para fechar o modal
  const close = useCallback(() => {
    setIsOpen(false);
    setOnConfigured(null);
  }, []);

  // Função para definir o callback que será executado após configuração do token
  const setCallback = useCallback((callback: () => void) => {
    setOnConfigured(() => callback);
  }, []);

  // Atualizar o status após configuração bem-sucedida
  useEffect(() => {
    if (!isOpen && onConfigured) {
      // Atualizar status do token quando o modal for fechado com sucesso
      const updateStatus = async () => {
        try {
          const tokenStatus = await PATService.getStatus();

          setStatus(tokenStatus);
        } catch (error) {
          console.error('Erro ao atualizar status do token:', error);
        }
      };

      updateStatus();
    }
  }, [isOpen, onConfigured]);

  const value = {
    isOpen,
    open,
    close,
    setCallback,
    onConfigured,
    status,
  };

  return <PATModalContext.Provider value={value}>{children}</PATModalContext.Provider>;
}
