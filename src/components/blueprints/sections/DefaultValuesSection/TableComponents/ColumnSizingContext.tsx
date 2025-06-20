/**
 * Column Sizing Context
 * Provides column sizing state and functions to all table components
 */

import React, { createContext, useContext, type ReactNode } from 'react';

import { useColumnSizing } from './hooks/useColumnSizing';

interface ColumnSizingContextType {
  columnStyles: {
    field: React.CSSProperties;
    type: React.CSSProperties;
    value: React.CSSProperties;
    exposed: React.CSSProperties;
    overridable: React.CSSProperties;
  };
  isResizing: boolean;
  resizingColumn: string | null;
  startResize: (
    column: 'field' | 'type' | 'value' | 'exposed' | 'overridable',
    clientX: number
  ) => void;
  autoSizeColumns: (data: unknown[]) => void;
  resetColumns: () => void;
}

const ColumnSizingContext = createContext<ColumnSizingContextType | null>(null);

interface ColumnSizingProviderProps {
  children: ReactNode;
  enableAutoSizing?: boolean;
  enableResizing?: boolean;
}

export const ColumnSizingProvider: React.FC<ColumnSizingProviderProps> = ({
  children,
  enableAutoSizing = true,
  enableResizing = true,
}) => {
  const columnSizing = useColumnSizing({
    enableAutoSizing,
    enableResizing,
  });

  return (
    <ColumnSizingContext.Provider value={columnSizing}>{children}</ColumnSizingContext.Provider>
  );
};

export const useColumnSizingContext = (): ColumnSizingContextType => {
  const context = useContext(ColumnSizingContext);

  if (!context) {
    throw new Error('useColumnSizingContext must be used within a ColumnSizingProvider');
  }

  return context;
};
