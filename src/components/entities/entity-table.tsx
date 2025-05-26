'use client';

import { formatDistanceToNow } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  // Dados e estado
  entities: T[];
  isLoading: boolean;
  isRefreshing?: boolean;

  // Funções de callback
  onEdit: (entity: T) => void;
  onDelete: (id: string) => Promise<void>;

  // Configuração da tabela
  columns: Column<T>[];

  // Componente de diálogo de exclusão
  DeleteDialog: React.ComponentType<{
    entity: T | null;
    isOpen: boolean;
    isDeleting: boolean;
    onDelete: () => Promise<void>;
    onCancel: () => void;
    'data-testid'?: string;
  }>;

  // Textos e tradução
  searchPlaceholder?: string;
  emptySearchMessage?: string;
  emptyMessage?: string;

  // IDs para testes
  testIdPrefix: string;
}

export function EntityTable<
  T extends { id: string; name: string; slug: string; createdAt: string },
>({
  // Dados e estado
  entities,
  isLoading,
  isRefreshing,

  // Funções de callback
  onEdit,
  onDelete,

  // Configuração da tabela
  columns,

  // Componente de diálogo de exclusão
  DeleteDialog,

  // Textos e tradução
  searchPlaceholder,
  emptySearchMessage,
  emptyMessage,

  // IDs para testes
  testIdPrefix,
}: EntityTableProps<T>) {
  const { t, i18n } = useTranslation(['entityTable']);

  // Define default values from translations
  const defaultSearchPlaceholder = t('searchPlaceholder');
  const defaultEmptySearchMessage = t('emptySearchMessage');
  const defaultEmptyMessage = t('emptyMessage');

  const [entityToDelete, setEntityToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use the appropriate date-fns locale based on the current i18n language
  const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

  // Função para ordenar as entidades
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para excluir uma entidade
  const handleDelete = async () => {
    if (!entityToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(entityToDelete.id);
    } finally {
      setIsDeleting(false);
      setEntityToDelete(null);
    }
  };

  // Filtrar entidades com base no termo de pesquisa
  const filteredEntities = entities.filter((entity) => {
    if (!searchTerm) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();

    // Buscar em campos comuns
    if (
      entity.name.toLowerCase().includes(searchLower) ||
      entity.slug.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    // Buscar em campos personalizados como descrição se existir
    if ('description' in entity && typeof entity.description === 'string') {
      if (entity.description.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    return false;
  });

  // Ordenar entidades
  const sortedEntities = [...filteredEntities].sort((a, b) => {
    let comparison = 0;

    // Ordenar por campo específico
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'slug') {
      comparison = a.slug.localeCompare(b.slug);
    } else if (sortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField in a && sortField in b) {
      // Para campos personalizados
      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || defaultSearchPlaceholder}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid={`${testIdPrefix}-search`}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort(column.key)}
                        data-testid={`sort-by-${column.key}`}
                      >
                        {column.title}
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      column.title
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} data-testid={`${testIdPrefix}-skeleton-row`}>
                      {columns.map((column, index) => (
                        <TableCell key={index}>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                      ))}
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {sortedEntities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        {searchTerm
                          ? emptySearchMessage || defaultEmptySearchMessage
                          : emptyMessage || defaultEmptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedEntities.map((entity) => (
                      <TableRow
                        key={entity.id}
                        className="group"
                        data-testid={`${testIdPrefix}-row-${entity.id}`}
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            data-testid={`${testIdPrefix}-${column.key}-${entity.id}`}
                            className={
                              column.key === 'name'
                                ? 'font-medium'
                                : column.key === 'createdAt'
                                  ? 'text-sm text-muted-foreground'
                                  : ''
                            }
                          >
                            {column.render ? (
                              column.render(entity)
                            ) : column.key === 'slug' ? (
                              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                {(entity as any)[column.key]}
                              </code>
                            ) : column.key === 'createdAt' ? (
                              formatDistanceToNow(new Date((entity as any)[column.key]), {
                                addSuffix: true,
                                locale: dateLocale,
                              })
                            ) : (
                              (entity as any)[column.key]
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100"
                                  data-testid={`${testIdPrefix}-actions-${entity.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('actions.view')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  data-testid={`edit-button-${entity.id}`}
                                  onClick={() => onEdit(entity)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>{t('actions.edit')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-testid={`delete-button-${entity.id}`}
                                  onClick={() => setEntityToDelete(entity)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>{t('actions.delete')}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteDialog
        entity={entityToDelete}
        isOpen={!!entityToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setEntityToDelete(null)}
        data-testid={`${testIdPrefix}-delete-dialog`}
      />
    </>
  );
}
