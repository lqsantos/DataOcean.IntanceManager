'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { usePATModal } from '@/contexts/modal-manager-context';
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
  const { open: openPATModal } = usePATModal();
  const { isConfigured, fetchStatus, isLoading } = usePAT({
    autoFetch: true,
    pollingInterval: 30, // Check every 30 seconds
  });

  useEffect(() => {
    if (!isLoading) {
      onStatusChange?.(isConfigured);
    }
  }, [isConfigured, isLoading, onStatusChange]);

  useEffect(() => {
    if (!isLoading && !isConfigured) {
      toast.warning(
        'Personal Access Token (PAT) não configurado. Configure para acessar repositórios privados.',
        {
          id: 'pat-missing-toast',
          duration: 6000,
          action: {
            label: 'Configurar',
            onClick: openPATModal,
          },
        }
      );
    }
  }, [isConfigured, isLoading, openPATModal]);

  return (
    <div
      data-testid={dataTestId}
      data-pat-status={isLoading ? 'loading' : isConfigured ? 'configured' : 'not-configured'}
      className="sr-only"
    >
      {children}
    </div>
  );
}
