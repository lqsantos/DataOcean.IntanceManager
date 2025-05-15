'use client';

import { useEffect, useState } from 'react';

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [isMswInitialized, setIsMswInitialized] = useState(false);

  useEffect(() => {
    // Inicializar MSW apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing MSW...');
      import('@/mocks').then((module) => {
        module
          .default()
          .then(() => {
            console.log('MSW initialized successfully');
            setIsMswInitialized(true);
          })
          .catch((error) => {
            console.error('Failed to initialize MSW:', error);
          });
      });
    }
  }, []);

  return <>{children}</>;
}
