/**
 * TableContainer component
 * Responsável pela renderização da estrutura da tabela
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { DefaultValueField } from '../types';

import { UNIFIED_COLUMN_WIDTHS } from './constants';

interface TableContainerProps {
  fields: DefaultValueField[];
  tableContent: React.ReactNode;
  noDataMessage?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  fields,
  tableContent,
  noDataMessage,
}) => {
  const { t } = useTranslation(['blueprints']);

  return (
    <div className="flex h-full max-h-[calc(100vh-11rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
      <ScrollArea className="synchronized-scroll h-full flex-1">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full min-w-full table-fixed caption-bottom text-sm">
            <TableHeader className="sticky-table-header">
              <TableRow>
                <TableHead style={{ width: UNIFIED_COLUMN_WIDTHS.field }}>
                  {t('values.table.field')}
                </TableHead>
                <TableHead style={{ width: UNIFIED_COLUMN_WIDTHS.type }}>
                  {t('values.table.type')}
                </TableHead>
                <TableHead style={{ width: UNIFIED_COLUMN_WIDTHS.value }}>
                  {t('values.table.value')}
                </TableHead>
                <TableHead className="text-center" style={{ width: UNIFIED_COLUMN_WIDTHS.exposed }}>
                  {t('values.table.exposed')}
                </TableHead>
                <TableHead
                  className="text-center"
                  style={{ width: UNIFIED_COLUMN_WIDTHS.overridable }}
                >
                  {t('values.table.overridable')}
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
  );
};
