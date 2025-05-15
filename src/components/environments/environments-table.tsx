'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Environment } from '@/types/environment';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteEnvironmentDialog } from './delete-environment-dialog';

interface EnvironmentsTableProps {
  environments: Environment[];
  isLoading: boolean;
  onEdit: (environment: Environment) => void;
  onDelete: (id: string) => Promise<void>;
}

export function EnvironmentsTable({
  environments,
  isLoading,
  onEdit,
  onDelete,
}: EnvironmentsTableProps) {
  const [environmentToDelete, setEnvironmentToDelete] = useState<Environment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!environmentToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(environmentToDelete.id);
    } finally {
      setIsDeleting(false);
      setEnvironmentToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Slug</TableHead>
              <TableHead className="w-[100px]">Order</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                    <Skeleton className="h-5 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : environments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No environments found. Create your first environment to get started.
                </TableCell>
              </TableRow>
            ) : (
              environments.map((environment) => (
                <TableRow key={environment.id} className="group">
                  <TableCell className="font-medium">{environment.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {environment.slug}
                    </code>
                  </TableCell>
                  <TableCell>{environment.order}</TableCell>
                  <TableCell>
                    <Badge
                      variant={environment.name === 'Production' ? 'default' : 'secondary'}
                      className={environment.name === 'Production' ? 'bg-green-600' : ''}
                    >
                      {environment.name === 'Production' ? 'Active' : 'Ready'}
                    </Badge>
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
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(environment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEnvironmentToDelete(environment)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteEnvironmentDialog
        environment={environmentToDelete}
        isOpen={!!environmentToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setEnvironmentToDelete(null)}
      />
    </>
  );
}
