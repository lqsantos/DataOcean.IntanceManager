'use client';

import { useEffect } from 'react';

import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar MSW apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks').then((module) => module.default());
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
