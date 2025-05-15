'use client';

import { useEffect, useState } from 'react';

interface MockProviderProps {
  children: React.ReactNode;
}

export function MockProvider({ children }: MockProviderProps) {
  const [isMockInitialized, setIsMockInitialized] = useState(false);

  useEffect(() => {
    async function initMocks() {
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
        const { default: initMock } = await import('@/mocks');
        await initMock();
        setIsMockInitialized(true);
      } else {
        setIsMockInitialized(true);
      }
    }

    initMocks();
  }, []);

  if (!isMockInitialized) {
    // You can show a loading indicator here if needed
    return null;
  }

  return <>{children}</>;
}
