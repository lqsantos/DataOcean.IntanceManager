'use client';

import { useEffect } from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { CreateTemplateModalProvider } from '@/contexts/create-template-modal-context';
import { PATModalProvider } from '@/contexts/pat-modal-context';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar MSW apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks').then((module) => module.default());
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <PATModalProvider>
        <CreateTemplateModalProvider>{children}</CreateTemplateModalProvider>
      </PATModalProvider>
    </ThemeProvider>
  );
}
