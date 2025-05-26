'use client';

import { useEffect } from 'react';

import { usePAT } from '@/hooks/use-pat';

interface PATCheckerProps {
  children?: React.ReactNode;
  onStatusChange?: (isConfigured: boolean) => void;
  'data-testid'?: string;
}

export function PATChecker({
  children,
  onStatusChange,
  'data-testid': dataTestId = 'pat-checker',
}: PATCheckerProps) {
  const { isConfigured, isLoading } = usePAT({
    autoFetch: true,
    pollingInterval: 30,
  });

  useEffect(() => {
    if (!isLoading) {
      onStatusChange?.(isConfigured);
    }
  }, [isConfigured, isLoading, onStatusChange]);

  let patStatus = 'not-configured';

  if (isLoading) {
    patStatus = 'loading';
  } else if (isConfigured) {
    patStatus = 'configured';
  }

  return (
    <div data-testid={dataTestId} data-pat-status={patStatus} className="sr-only">
      {children}
    </div>
  );
}
