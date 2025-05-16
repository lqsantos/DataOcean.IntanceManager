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
import type { Location } from '@/types/location';

import { DeleteLocationDialog } from './delete-location-dialog';

interface LocationsTableProps {
  locations: Location[];
  isLoading: boolean;
  _isRefreshing: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => Promise<void>;
}

type SortField = 'name' | 'slug' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function LocationsTable({
  locations,
  isLoading,
  _isRefreshing,
  onEdit,
  onDelete,
}: LocationsTableProps) {
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
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
    if (!locationToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(locationToDelete.id);
    } finally {
      setIsDeleting(false);
      setLocationToDelete(null);
    }
  };

  // Filtrar localidades com base no termo de pesquisa
  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar localidades
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'slug':
        comparison = a.slug.localeCompare(b.slug);
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
      <div className="flex flex-col space-y-4" data-testid="locations-table-container">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar localidades..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="locations-table-search"
          />
        </div>

        <div className="rounded-md border">
          <Table data-testid="locations-table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-bold"
                    data-testid="locations-table-sort-name"
                  >
                    Nome
                    {renderSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('slug')}
                    className="flex items-center gap-1 font-bold"
                    data-testid="locations-table-sort-slug"
                  >
                    Slug
                    {renderSortIcon('slug')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 font-bold"
                    data-testid="locations-table-sort-created-at"
                  >
                    Criado em
                    {renderSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} data-testid="locations-table-loading-row">
                    <TableCell>
                      <Skeleton className="h-5 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px]" />
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
                  {sortedLocations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center"
                        data-testid="locations-table-empty-message"
                      >
                        {searchTerm ? (
                          <>
                            Nenhuma localidade encontrada para <strong>"{searchTerm}"</strong>.
                            <br />
                            Tente outro termo de busca.
                          </>
                        ) : (
                          <>
                            Nenhuma localidade encontrada.
                            <br />
                            Crie sua primeira localidade para começar.
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedLocations.map((location) => (
                      <TableRow
                        key={location.id}
                        className="group"
                        data-testid={`locations-table-row-${location.id}`}
                      >
                        <TableCell
                          className="font-medium"
                          data-testid={`locations-table-name-${location.id}`}
                        >
                          {location.name}
                        </TableCell>
                        <TableCell data-testid={`locations-table-slug-${location.id}`}>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {location.slug}
                          </code>
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground"
                          data-testid={`locations-table-created-at-${location.id}`}
                        >
                          {formatDistanceToNow(new Date(location.createdAt), {
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
                                  data-testid={`locations-table-actions-${location.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEdit(location)}
                                  data-testid={`locations-table-edit-${location.id}`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setLocationToDelete(location)}
                                  className="text-destructive focus:text-destructive"
                                  data-testid={`locations-table-delete-${location.id}`}
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

      <DeleteLocationDialog
        location={locationToDelete}
        isOpen={!!locationToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setLocationToDelete(null)}
        data-testid="locations-table-delete-dialog"
      />
    </>
  );
}
