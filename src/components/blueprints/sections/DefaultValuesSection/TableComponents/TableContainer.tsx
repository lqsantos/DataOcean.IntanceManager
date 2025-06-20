/**
 * TableContainer component
 * Responsável pela renderização da estrutura da tabela com suporte a redimensionamento de colunas
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { DefaultValueField } from '../types';

import { ColumnControls } from './ColumnControls';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import { useColumnSizing } from './hooks/useColumnSizing';

interface TableContainerProps {
  fields: DefaultValueField[];
  tableContent: React.ReactNode;
  noDataMessage?: string;
  enableColumnResizing?: boolean;
  enableAutoSizing?: boolean;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  fields,
  tableContent,
  noDataMessage,
  enableColumnResizing = true,
  enableAutoSizing = true,
}) => {
  const { t } = useTranslation(['blueprints']);

  const {
    columnStyles,
    isResizing,
    resizingColumn,
    tableRef,
    startResize,
    autoSizeColumns,
    resetColumns,
  } = useColumnSizing({
    enableAutoSizing,
    enableResizing: enableColumnResizing,
  });

  // Auto-size columns when fields change
  useEffect(() => {
    if (enableAutoSizing && fields.length > 0) {
      // Delay auto-sizing to allow DOM to render
      setTimeout(() => {
        autoSizeColumns(fields);
      }, 100);
    }
  }, [fields, enableAutoSizing, autoSizeColumns]);

  const handleColumnResize = (column: keyof typeof columnStyles) => (clientX: number) => {
    startResize(column, clientX);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-11rem)] min-h-0 flex-1 flex-col overflow-hidden">
      {/* Column Controls */}
      {(enableColumnResizing || enableAutoSizing) && (
        <div className="border-b bg-gray-50 px-3 py-2 dark:bg-gray-900/20">
          <ColumnControls
            onAutoSize={() => autoSizeColumns(fields)}
            onReset={resetColumns}
            isResizing={isResizing}
          />
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-md border">
        <ScrollArea className="synchronized-scroll h-full flex-1">
          <div className="relative w-full overflow-x-auto">
            <table ref={tableRef} className="w-full min-w-full table-fixed caption-bottom text-sm">
              <TableHeader className="sticky-table-header">
                <TableRow>
                  <TableHead style={columnStyles.field} className="group relative">
                    {t('values.table.field')}
                    {enableColumnResizing && (
                      <ColumnResizeHandle
                        column="field"
                        isResizing={resizingColumn === 'field'}
                        onStartResize={handleColumnResize('field')}
                      />
                    )}
                  </TableHead>
                  <TableHead style={columnStyles.type} className="group relative">
                    {t('values.table.type')}
                    {enableColumnResizing && (
                      <ColumnResizeHandle
                        column="type"
                        isResizing={resizingColumn === 'type'}
                        onStartResize={handleColumnResize('type')}
                      />
                    )}
                  </TableHead>
                  <TableHead style={columnStyles.value} className="group relative">
                    {t('values.table.value')}
                    {enableColumnResizing && (
                      <ColumnResizeHandle
                        column="value"
                        isResizing={resizingColumn === 'value'}
                        onStartResize={handleColumnResize('value')}
                      />
                    )}
                  </TableHead>
                  <TableHead className="group relative text-center" style={columnStyles.exposed}>
                    {t('values.table.exposed')}
                    {enableColumnResizing && (
                      <ColumnResizeHandle
                        column="exposed"
                        isResizing={resizingColumn === 'exposed'}
                        onStartResize={handleColumnResize('exposed')}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="group relative text-center"
                    style={columnStyles.overridable}
                  >
                    {t('values.table.overridable')}
                    {/* No resize handle on last column */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="pb-8">
                {fields.length > 0 ? (
                  tableContent
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <Alert>
                        <AlertDescription>
                          {noDataMessage || t('values.table.noFields')}
                        </AlertDescription>
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
