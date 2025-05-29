'use client';

import { Copy, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Blueprint } from '@/types/blueprint';

interface BlueprintCardProps {
  blueprint: Blueprint;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateInstance: () => void;
}

export function BlueprintCard({
  blueprint,
  viewMode,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateInstance,
}: BlueprintCardProps) {
  const { t } = useTranslation('blueprints');
  const isGridView = viewMode === 'grid';

  return isGridView ? (
    <Card data-testid={`blueprint-card-${blueprint.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {blueprint.category && (
              <Badge
                variant="secondary"
                className="mb-2"
                data-testid={`blueprint-category-badge-${blueprint.id}`}
              >
                {blueprint.category}
              </Badge>
            )}
            <CardTitle data-testid={`blueprint-name-${blueprint.id}`}>{blueprint.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid={`blueprint-menu-${blueprint.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t('blueprintCard.actions.edit')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} data-testid={`blueprint-edit-${blueprint.id}`}>
                {t('blueprintCard.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDuplicate}
                data-testid={`blueprint-duplicate-${blueprint.id}`}
              >
                {t('blueprintCard.actions.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
                data-testid={`blueprint-delete-${blueprint.id}`}
              >
                {t('blueprintCard.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription data-testid={`blueprint-description-${blueprint.id}`}>
          {blueprint.description || t('blueprintCard.noDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">{t('blueprintCard.template')}</span>{' '}
            <span data-testid={`blueprint-template-${blueprint.id}`}>
              {blueprint.templateName || 'Template não encontrado'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{t('blueprintCard.variables')}</span>{' '}
            <span data-testid={`blueprint-variables-${blueprint.id}`}>
              {blueprint.variables?.length || 0}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onCreateInstance}
          className="w-full"
          data-testid={`blueprint-create-instance-${blueprint.id}`}
        >
          {t('blueprintCard.createInstance')}
        </Button>
      </CardFooter>
    </Card>
  ) : (
    <Card className="flex flex-row" data-testid={`blueprint-card-list-${blueprint.id}`}>
      <div className="flex-1 border-r p-4">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-lg font-semibold" data-testid={`blueprint-name-list-${blueprint.id}`}>
            {blueprint.name}
          </h3>
          {blueprint.category && (
            <Badge
              variant="secondary"
              data-testid={`blueprint-category-badge-list-${blueprint.id}`}
            >
              {blueprint.category}
            </Badge>
          )}
        </div>
        <p
          className="text-sm text-muted-foreground"
          data-testid={`blueprint-description-list-${blueprint.id}`}
        >
          {blueprint.description || t('blueprintCard.noDescription')}
        </p>
      </div>
      <div className="flex w-32 flex-col items-center justify-center border-r p-2">
        <div className="text-center text-sm">
          <div className="font-medium">{t('blueprintCard.template')}</div>
          <div
            className="text-muted-foreground"
            data-testid={`blueprint-template-list-${blueprint.id}`}
          >
            {blueprint.templateName || 'Não encontrado'}
          </div>
        </div>
      </div>
      <div className="flex w-24 flex-col items-center justify-center border-r p-2">
        <div className="text-center text-sm">
          <div className="font-medium">{t('blueprintCard.variables')}</div>
          <div
            className="text-muted-foreground"
            data-testid={`blueprint-variables-list-${blueprint.id}`}
          >
            {blueprint.variables?.length || 0}
          </div>
        </div>
      </div>
      <div className="flex gap-1 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8"
          data-testid={`blueprint-edit-list-${blueprint.id}`}
        >
          {t('blueprintCard.actions.edit')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="h-8"
          data-testid={`blueprint-duplicate-list-${blueprint.id}`}
        >
          <Copy className="mr-1 h-3 w-3" />
          {t('blueprintCard.actions.duplicate')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onCreateInstance}
          data-testid={`blueprint-create-instance-list-${blueprint.id}`}
        >
          {t('blueprintCard.createInstance')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              data-testid={`blueprint-menu-list-${blueprint.id}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
              data-testid={`blueprint-delete-list-${blueprint.id}`}
            >
              {t('blueprintCard.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
