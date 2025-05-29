'use client';

import { Copy, Edit, MoreHorizontal, PlayCircle, Trash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Blueprint } from '@/types/blueprint';

interface BlueprintCardProps {
  blueprint: Blueprint;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCreateInstance: () => void;
}

export function BlueprintCard({
  blueprint,
  viewMode,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateInstance,
}: BlueprintCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col space-y-2 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{blueprint.name}</h3>
            {blueprint.category && (
              <Badge variant="outline" className="px-1 text-xs">
                {blueprint.category}
              </Badge>
            )}
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {blueprint.description || 'Sem descrição'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-3 w-3" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onCreateInstance}>
            <PlayCircle className="mr-2 h-3 w-3" />
            Criar Instância
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{blueprint.name}</CardTitle>
            <CardDescription className="mt-1">
              {blueprint.templateName || 'Template não definido'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {blueprint.category && (
          <Badge variant="secondary" className="mt-1">
            {blueprint.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {blueprint.description || 'Sem descrição disponível para este blueprint'}
        </p>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="default" className="w-full" onClick={onCreateInstance}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Criar Instância
        </Button>
      </CardFooter>
    </Card>
  );
}
