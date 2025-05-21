'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  'data-testid'?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function Spinner({
  size = 'md',
  className,
  'data-testid': dataTestId = 'spinner',
}: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeMap[size], className)}
      data-testid={dataTestId}
      data-spinner-size={size}
      aria-label="Carregando"
    />
  );
}
