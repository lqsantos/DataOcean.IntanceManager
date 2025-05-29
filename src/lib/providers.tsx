'use client';

import { useEffect } from 'react';

import { I18nProvider } from '@/components/i18n-provider';
import { PATModal } from '@/components/pat/pat-modal';
import { ThemeProvider } from '@/components/theme-provider';
import { CreateBlueprintProvider } from '@/contexts/create-blueprint-context';
import { ModalManagerProvider } from '@/contexts/modal-manager-context';
import { TemplateValidationProvider } from '@/contexts/template-validation-context';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar MSW apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks').then((module) => module.default());
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <ModalManagerProvider>
          <TemplateValidationProvider>
            <CreateBlueprintProvider>
              {/* Renderizar o PATModal aqui garante que ele está disponível em toda a aplicação */}
              <PATModal />
              {children}
            </CreateBlueprintProvider>
          </TemplateValidationProvider>
        </ModalManagerProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
