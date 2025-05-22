'use client';

import { createContext, useContext, useState } from 'react';

import type { Environment } from '@/types/environment';

interface CreateEnvironmentModalContextType {
  isOpen: boolean;
  environmentToEdit: Environment | null;
  openModal: () => void;
  openEditModal: (environment: Environment) => void;
  closeModal: () => void;
}

const CreateEnvironmentModalContext = createContext<CreateEnvironmentModalContextType | undefined>(
  undefined
);

export function CreateEnvironmentModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState<Environment | null>(null);

  const openModal = () => {
    setEnvironmentToEdit(null);
    setIsOpen(true);
  };

  const openEditModal = (environment: Environment) => {
    setEnvironmentToEdit(environment);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEnvironmentToEdit(null);
  };

  return (
    <CreateEnvironmentModalContext.Provider
      value={{ isOpen, environmentToEdit, openModal, openEditModal, closeModal }}
    >
      {children}
    </CreateEnvironmentModalContext.Provider>
  );
}

export function useCreateEnvironmentModal() {
  const context = useContext(CreateEnvironmentModalContext);

  if (context === undefined) {
    throw new Error(
      'useCreateEnvironmentModal must be used within a CreateEnvironmentModalProvider'
    );
  }

  return context;
}
