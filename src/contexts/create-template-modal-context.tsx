'use client';

import React, { createContext, useContext, useState } from 'react';

interface CreateTemplateModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CreateTemplateModalContext = createContext<CreateTemplateModalContextType | undefined>(
  undefined
);

export function CreateTemplateModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <CreateTemplateModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </CreateTemplateModalContext.Provider>
  );
}

export function useCreateTemplateModal() {
  const context = useContext(CreateTemplateModalContext);

  if (context === undefined) {
    throw new Error('useCreateTemplateModal must be used within a CreateTemplateModalProvider');
  }

  return context;
}
