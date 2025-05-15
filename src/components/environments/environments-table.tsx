// components/environments/environments-table.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

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
import type { Environment } from '@/types/environment';

import { DeleteEnvironmentDialog } from './delete-environment-dialog';

interface EnvironmentsTableProps {
  environments: Environment[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (environment: Environment) => void;
  onDelete: (id: string) => Promise<void>;
}

type SortField = 'name' | 'slug' | 'order' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function EnvironmentsTable({
  environments,
  isLoading,
  _isRefreshing,
  onEdit,
  onDelete,
}: EnvironmentsTableProps) {
  const [environmentToDelete, setEnvironmentToDelete] = useState<Environment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async () => {
    if (!environmentToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(environmentToDelete.id);
    } finally {
      setIsDeleting(false);
      setEnvironmentToDelete(null);
    }
  };

  // Filtrar ambientes com base no termo de pesquisa
  const filteredEnvironments = environments.filter(
    (env) =>
      env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar ambientes
  const sortedEnvironments = [...filteredEnvironments].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'slug':
        comparison = a.slug.localeCompare(b.slug);
        break;
      case 'order':
        comparison = a.order - b.order;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Renderizar ícone de ordenação
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ambientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Nome
                    {renderSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('slug')}>
                  <div className="flex items-center">
                    Slug
                    {renderSortIcon('slug')}
                  </div>
                </TableHead>
                <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('order')}>
                  <div className="flex items-center">
                    Ordem
                    {renderSortIcon('order')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[150px] cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Criado em
                    {renderSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[40px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {sortedEnvironments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm ? (
                          <>
                            Nenhum ambiente encontrado para <strong>"{searchTerm}"</strong>.
                            <br />
                            Tente outro termo de busca.
                          </>
                        ) : (
                          <>
                            Nenhum ambiente encontrado.
                            <br />
                            Crie seu primeiro ambiente para começar.
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedEnvironments.map((environment) => (
                      <TableRow key={environment.id} className="group">
                        <TableCell className="font-medium">{environment.name}</TableCell>
                        <TableCell>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {environment.slug}
                          </code>
                        </TableCell>
                        <TableCell>{environment.order}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(environment.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(environment)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEnvironmentToDelete(environment)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
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

      <DeleteEnvironmentDialog
        environment={environmentToDelete}
        isOpen={!!environmentToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setEnvironmentToDelete(null)}
      />

      {/* Replace the nested ternary */}
      {(() => {
        if (row.getIsExpanded()) {
          return <ChevronDown className="h-4 w-4" />;
        }

        if (isLoading) {
          return <Loader2 className="h-4 w-4 animate-spin" />;
        }

        return <ChevronRight className="h-4 w-4" />;
      })()}
    </>
  );
}
