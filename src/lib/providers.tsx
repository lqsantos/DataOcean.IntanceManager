'use client';

import { useEffect } from 'react';

import { PATModal } from '@/components/pat/pat-modal';
import { ThemeProvider } from '@/components/theme-provider';
import { ModalManagerProvider } from '@/contexts/modal-manager-context';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar MSW apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks').then((module) => module.default());
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ModalManagerProvider>
        {/* Renderizar o PATModal aqui garante que ele está disponível em toda a aplicação */}
        <PATModal />
        {children}
      </ModalManagerProvider>
    </ThemeProvider>
  );
}
