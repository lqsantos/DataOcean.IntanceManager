// components/clusters/clusters-table.tsx
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

import { Badge } from '@/components/ui/badge';
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
import { useLocations } from '@/hooks/use-locations';
import type { Cluster } from '@/types/cluster';

import { DeleteClusterDialog } from './delete-cluster-dialog';

interface ClustersTableProps {
  clusters: Cluster[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (cluster: Cluster) => void;
  onDelete: (id: string) => Promise<void>;
}

type SortField = 'name' | 'slug' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function ClustersTable({
  clusters,
  isLoading,
  _isRefreshing,
  onEdit,
  onDelete,
}: ClustersTableProps) {
  const { locations } = useLocations();
  const [clusterToDelete, setClusterToDelete] = useState<Cluster | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Função para ordenar os clusters
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para excluir um cluster
  const handleDelete = async () => {
    if (!clusterToDelete) {
      return;
    }
    setIsDeleting(true);

    try {
      await onDelete(clusterToDelete.id);
    } finally {
      setIsDeleting(false);
      setClusterToDelete(null);
    }
  };

  // Get location names by ids
  const getLocationNames = (locationIds: string[]) => {
    return locationIds
      .map((id) => locations.find((loc) => loc.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Filtrar clusters com base no termo de pesquisa
  const filteredClusters = clusters.filter(
    (cluster) =>
      cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationNames(cluster.locationIds).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar clusters
  const sortedClusters = [...filteredClusters].sort((a, b) => {
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
              placeholder="Buscar clusters..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="clusters-search"
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
                <TableHead className="w-[300px]">Localidades</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableRow key={i} data-testid="cluster-skeleton-row">
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
                        <Skeleton className="h-5 w-20" />
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
                  {sortedClusters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm
                          ? 'Nenhum cluster encontrado para a pesquisa atual.'
                          : 'Nenhum cluster cadastrado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedClusters.map((cluster) => (
                      <TableRow
                        key={cluster.id}
                        className="group"
                        data-testid={`cluster-row-${cluster.id}`}
                      >
                        <TableCell
                          className="font-medium"
                          data-testid={`cluster-name-${cluster.id}`}
                        >
                          {cluster.name}
                        </TableCell>
                        <TableCell data-testid={`cluster-slug-${cluster.id}`}>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {cluster.slug}
                          </code>
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          data-testid={`cluster-locations-${cluster.id}`}
                        >
                          {getLocationNames(cluster.locationIds) || (
                            <span className="italic text-muted-foreground">Nenhuma</span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`cluster-status-${cluster.id}`}>
                          <Badge variant={cluster.inUse ? 'default' : 'outline'}>
                            {cluster.inUse ? 'Em uso' : 'Disponível'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground"
                          data-testid={`cluster-created-at-${cluster.id}`}
                        >
                          {formatDistanceToNow(new Date(cluster.createdAt), {
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
                                  data-testid={`cluster-actions-${cluster.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  data-testid={`edit-button-${cluster.id}`}
                                  onClick={() => onEdit(cluster)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-testid={`delete-button-${cluster.id}`}
                                  onClick={() => setClusterToDelete(cluster)}
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
      <DeleteClusterDialog
        cluster={clusterToDelete}
        isOpen={!!clusterToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setClusterToDelete(null)}
        data-testid="delete-cluster-dialog"
      />
    </>
  );
}
