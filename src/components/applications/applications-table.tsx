// components/applications/applications-table.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
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
import type { Application } from '@/types/application';

import { DeleteApplicationDialog } from './delete-application-dialog';

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => Promise<void>;
}

type SortField = 'name' | 'slug' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function ApplicationsTable({
  applications,
  isLoading,
  _isRefreshing,
  onEdit,
  onDelete,
}: ApplicationsTableProps) {
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
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
    if (!applicationToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(applicationToDelete.id);
    } finally {
      setIsDeleting(false);
      setApplicationToDelete(null);
    }
  };

  // Filtrar aplicações com base no termo de pesquisa
  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar aplicações
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'slug') {
      comparison = a.slug.localeCompare(b.slug);
    } else if (sortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
              placeholder="Buscar aplicações..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="applications-search"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('name')}
                    data-testid="sort-by-name"
                  >
                    Nome
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('slug')}
                    data-testid="sort-by-slug"
                  >
                    Slug
                    {sortField === 'slug' ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[300px]">Descrição</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('createdAt')}
                    data-testid="sort-by-created-at"
                  >
                    Criado em
                    {sortField === 'createdAt' ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} data-testid="application-skeleton-row">
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-64" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {sortedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm
                          ? 'Nenhuma aplicação encontrada para a pesquisa atual.'
                          : 'Nenhuma aplicação cadastrada.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedApplications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="group"
                        data-testid={`application-row-${application.id}`}
                      >
                        <TableCell
                          className="font-medium"
                          data-testid={`application-name-${application.id}`}
                        >
                          {application.name}
                        </TableCell>
                        <TableCell data-testid={`application-slug-${application.id}`}>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {application.slug}
                          </code>
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          data-testid={`application-description-${application.id}`}
                        >
                          {application.description}
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground"
                          data-testid={`application-created-at-${application.id}`}
                        >
                          {formatDistanceToNow(new Date(application.createdAt), {
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
                                  data-testid={`application-actions-${application.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  data-testid={`edit-button-${application.id}`}
                                  onClick={() => onEdit(application)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-testid={`delete-button-${application.id}`}
                                  onClick={() => setApplicationToDelete(application)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
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

      <DeleteApplicationDialog
        application={applicationToDelete}
        isOpen={!!applicationToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setApplicationToDelete(null)}
        data-testid="delete-application-dialog"
      />
    </>
  );
}
