'use client';

import { useEffect, useState } from 'react';

interface MockProviderProps {
  children: React.ReactNode;
}

export function MockProvider({ children }: MockProviderProps) {
  const [isMockInitialized, setIsMockInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 MockProvider: Iniciando...');
    
    async function initMocks() {
      console.log('🔍 Variáveis de ambiente:', {
        NODE_ENV: process.env.NODE_ENV,
        API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING
      });
      
      // Verificar tanto a variável de ambiente quanto se estamos em desenvolvimento
      if (
        process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' &&
        process.env.NODE_ENV === 'development'
      ) {
        try {
          console.log('🔍 Tentando importar módulo de mocks...');
          const importedModule = await import('@/mocks');
          console.log('🔍 Módulo importado:', importedModule);
          
          if (!importedModule.default) {
            throw new Error('Função initMock não encontrada no módulo importado');
          }
          
          console.log('🔍 Executando initMock...');
          await importedModule.default();
          console.log('✅ MSW inicializado com sucesso');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('❌ Erro ao inicializar MSW:', errorMsg);
          setErrorMessage(errorMsg);
        } finally {
          console.log('🔍 Finalizando inicialização de mocks...');
          setIsMockInitialized(true);
        }
      } else {
        console.log('🔄 Mocks não habilitados ou não em ambiente de desenvolvimento');
        setIsMockInitialized(true);
      }
    }

    initMocks();
  }, []);

  // Mostrar informações de erro caso ocorra
  if (!isMockInitialized) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <p>Carregando mocks...</p>
        {errorMessage && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <p>Erro na inicialização:</p>
            <pre>{errorMessage}</pre>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
