'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  columns: Column<T>[];
  entities: T[];
  isLoading: boolean;
  isRefreshing?: boolean;
  onEdit: (entity: T) => void;
  onDelete: (id: string) => Promise<void>;
  'data-testid'?: string;
}

export function EntityTable({
  columns,
  entities,
  isLoading,
  isRefreshing,
  onEdit,
  onDelete,
  'data-testid': dataTestId,
}: EntityTableProps) {
  return (
    <div className="w-full" data-testid={`${dataTestId}-container`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn('whitespace-nowrap', column.className)}
                data-testid={`${dataTestId}-head-${column.key}`}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index} data-testid={`${dataTestId}-skeleton-row-${index}`}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={column.className}
                    data-testid={`${dataTestId}-skeleton-${column.key}-${index}`}
                  >
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : entities.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
                data-testid={`${dataTestId}-empty-message`}
              >
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            entities.map((entity) => (
              <TableRow key={entity.id} data-testid={`${dataTestId}-row-${entity.id}`}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn('whitespace-nowrap', column.className)}
                    data-testid={`${dataTestId}-cell-${column.key}-${entity.id}`}
                  >
                    {column.render ? column.render(entity) : entity[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
