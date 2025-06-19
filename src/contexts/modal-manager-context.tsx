'use client';

import { createContext, useContext, useState } from 'react';

import type { Application } from '@/types/application';
import type { Cluster } from '@/types/cluster';
import type { Environment } from '@/types/environment';
import type { GitSource } from '@/types/git-source';
import type { Location } from '@/types/location';

// Tipos para os estados de cada modal
interface ModalStates {
  environment: {
    isOpen: boolean;
    editItem: Environment | null;
  };
  template: {
    isOpen: boolean;
  };
  application: {
    isOpen: boolean;
    editItem: Application | null;
  };
  cluster: {
    isOpen: boolean;
    editItem: Cluster | null;
  };
  location: {
    isOpen: boolean;
    editItem: Location | null;
  };
  gitSource: {
    isOpen: boolean;
    editItem: GitSource | null;
  };
  pat: {
    isOpen: boolean;
    lastUpdated: string | null;
    configured: boolean;
    callback: (() => void) | null;
  };
}

// Interface para o contexto do gerenciador de modais
interface ModalManagerContextType {
  // Estado dos modais
  modals: ModalStates;

  // Métodos genéricos para abrir/fechar modais
  openModal: <T extends keyof ModalStates>(modalType: T) => void;
  openEditModal: <T extends keyof ModalStates>(modalType: T, item: unknown) => void;
  closeModal: <T extends keyof ModalStates>(modalType: T) => void;

  // Método específico para o token PAT
  setPatCallback: (callback: () => void) => void;
}

// Valores iniciais para os estados dos modais
const initialModalStates: ModalStates = {
  environment: { isOpen: false, editItem: null },
  template: { isOpen: false },
  application: { isOpen: false, editItem: null },
  cluster: { isOpen: false, editItem: null },
  location: { isOpen: false, editItem: null },
  gitSource: { isOpen: false, editItem: null },
  pat: {
    isOpen: false,
    lastUpdated: null,
    configured: false,
    callback: null,
  },
};

// Criação do contexto
const ModalManagerContext = createContext<ModalManagerContextType | undefined>(undefined);

/**
 * Provider que centraliza o gerenciamento de todos os modais da aplicação
 * Substitui os vários providers aninhados individuais
 */
export function ModalManagerProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalStates>(initialModalStates);

  // Função para abrir um modal de criação
  const openModal = <T extends keyof ModalStates>(modalType: T) => {
    setModals((prev) => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        isOpen: true,
        editItem: null,
      },
    }));
  };

  // Função para abrir um modal de edição
  const openEditModal = <T extends keyof ModalStates>(modalType: T, item: unknown) => {
    setModals((prev) => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        isOpen: true,
        editItem: item,
      },
    }));
  };

  // Função para fechar um modal
  const closeModal = <T extends keyof ModalStates>(modalType: T) => {
    setModals((prev) => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        isOpen: false,
        editItem: null,
      },
    }));
  };

  // Função específica para configurar callback do PAT
  const setPatCallback = (callback: () => void) => {
    setModals((prev) => ({
      ...prev,
      pat: {
        ...prev.pat,
        callback,
      },
    }));
  };

  return (
    <ModalManagerContext.Provider
      value={{
        modals,
        openModal,
        openEditModal,
        closeModal,
        setPatCallback,
      }}
    >
      {children}
    </ModalManagerContext.Provider>
  );
}

// Hook para acessar o contexto do gerenciador de modais
export function useModalManager() {
  const context = useContext(ModalManagerContext);

  if (!context) {
    throw new Error('useModalManager must be used within a ModalManagerProvider');
  }

  return context;
}

// Hooks especializados para facilitar o uso em cada tipo de componente
// Esses hooks fornecem uma API mais específica e limpa para cada tipo de modal

export function useEnvironmentModal() {
  const { modals, openModal, openEditModal, closeModal } = useModalManager();

  // Log para debug
  console.warn('[useEnvironmentModal] Estado atual:', {
    isOpen: modals.environment.isOpen,
    editItem: modals.environment.editItem,
  });

  return {
    isOpen: modals.environment.isOpen,
    entityToEdit: modals.environment.editItem, // Padronizar o nome da propriedade
    environmentToEdit: modals.environment.editItem, // Manter compatibilidade
    openModal: () => openModal('environment'),
    openEditModal: (environment: Environment) => openEditModal('environment', environment),
    closeModal: () => closeModal('environment'),
  };
}

export function useTemplateModal() {
  const { modals, openModal, closeModal } = useModalManager();

  return {
    isOpen: modals.template.isOpen,
    openModal: () => openModal('template'),
    closeModal: () => closeModal('template'),
  };
}

export function useApplicationModal() {
  const { modals, openModal, openEditModal, closeModal } = useModalManager();

  return {
    isOpen: modals.application.isOpen,
    entityToEdit: modals.application.editItem, // Padronizar o nome da propriedade
    applicationToEdit: modals.application.editItem, // Manter compatibilidade
    openModal: () => openModal('application'),
    openEditModal: (application: Application) => openEditModal('application', application),
    closeModal: () => closeModal('application'),
  };
}

export function useClusterModal() {
  const { modals, openModal, openEditModal, closeModal } = useModalManager();

  return {
    isOpen: modals.cluster.isOpen,
    clusterToEdit: modals.cluster.editItem,
    openModal: () => openModal('cluster'),
    openEditModal: (cluster: Cluster) => openEditModal('cluster', cluster),
    closeModal: () => closeModal('cluster'),
  };
}

export function useLocationModal() {
  const { modals, openModal, openEditModal, closeModal } = useModalManager();

  return {
    isOpen: modals.location.isOpen,
    entityToEdit: modals.location.editItem, // Padronizar o nome da propriedade
    locationToEdit: modals.location.editItem, // Manter compatibilidade
    openModal: () => openModal('location'),
    openEditModal: (location: Location) => openEditModal('location', location),
    closeModal: () => closeModal('location'),
  };
}

export function useGitSourceModal() {
  const { modals, openModal, openEditModal, closeModal } = useModalManager();

  return {
    isOpen: modals.gitSource.isOpen,
    gitSourceToEdit: modals.gitSource.editItem,
    openModal: () => openModal('gitSource'),
    openEditModal: (gitSource: GitSource) => openEditModal('gitSource', gitSource),
    closeModal: () => closeModal('gitSource'),
  };
}

export function usePATModal() {
  const { modals, openModal, closeModal, setPatCallback } = useModalManager();

  return {
    isOpen: modals.pat.isOpen,
    status: {
      configured: modals.pat.configured,
      lastUpdated: modals.pat.lastUpdated,
      id: '1', // Adicionando um ID padrão para compatibilidade
    },
    onConfigured: modals.pat.callback,
    openModal: () => openModal('pat'), // Renomeando de 'open' para 'openModal' para manter consistência
    closeModal: () => closeModal('pat'), // Renomeando de 'close' para 'closeModal' para manter consistência
    setCallback: setPatCallback,
    // Mantendo os métodos anteriores para compatibilidade com código existente
    open: () => openModal('pat'),
    close: () => closeModal('pat'),
  };
}
