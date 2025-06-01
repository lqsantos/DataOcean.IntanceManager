'use client';

import { Code, Copy, Layers, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  const [showHelperTplDialog, setShowHelperTplDialog] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);

  // Calculate stats for display
  const childTemplatesCount = blueprint.childTemplates?.length || 0;
  const variablesCount = blueprint.variables?.length || 0;
  const hasHelperTpl = !!blueprint.helperTpl;

  return isGridView ? (
    <>
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
          <CardDescription
            className="cursor-pointer hover:underline"
            onClick={() => setShowDescriptionDialog(true)}
            data-testid={`blueprint-description-${blueprint.id}`}
          >
            {blueprint.description
              ? blueprint.description.length > 100
                ? `${blueprint.description.substring(0, 100)}...`
                : blueprint.description
              : t('blueprintCard.noDescription')}
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

            <div className="grid grid-cols-3 gap-1 text-sm">
              <div>
                <span className="font-medium">{t('blueprintCard.variables')}</span>{' '}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => hasHelperTpl && setShowHelperTplDialog(true)}
                        data-testid={`blueprint-variables-${blueprint.id}`}
                      >
                        {variablesCount || 0}
                        {hasHelperTpl && <Code className="ml-1 inline h-3 w-3" />}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>
                        {hasHelperTpl
                          ? 'Clique para visualizar o helper.tpl'
                          : 'Sem variáveis definidas'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div>
                <span className="font-medium">{t('blueprintCard.childTemplates')}</span>{' '}
                <span
                  className={childTemplatesCount > 0 ? 'text-primary' : ''}
                  data-testid={`blueprint-child-templates-${blueprint.id}`}
                >
                  {childTemplatesCount}
                  {childTemplatesCount > 0 && <Layers className="ml-1 inline h-3 w-3" />}
                </span>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                {new Date(blueprint.updatedAt).toLocaleDateString()}
              </div>
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

      {/* Helper.tpl Preview Dialog */}
      <Dialog open={showHelperTplDialog} onOpenChange={setShowHelperTplDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Helper.tpl - {blueprint.name}</DialogTitle>
            <DialogDescription>
              Variáveis reutilizáveis disponíveis para instâncias criadas a partir deste blueprint.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted p-4">
            <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm">
              <code>{blueprint.helperTpl || '# Nenhuma variável definida.'}</code>
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelperTplDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Preview Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{blueprint.name}</DialogTitle>
            <DialogDescription>Descrição completa do blueprint</DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted/20 p-4">
            <MarkdownPreview content={blueprint.description || '*Sem descrição disponível*'} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDescriptionDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <>
      <Card className="flex flex-row" data-testid={`blueprint-card-list-${blueprint.id}`}>
        <div className="flex-1 border-r p-4">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className="text-lg font-semibold"
              data-testid={`blueprint-name-list-${blueprint.id}`}
            >
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
            className="cursor-pointer text-sm text-muted-foreground hover:underline"
            data-testid={`blueprint-description-list-${blueprint.id}`}
            onClick={() => setShowDescriptionDialog(true)}
          >
            {blueprint.description
              ? blueprint.description.length > 80
                ? `${blueprint.description.substring(0, 80)}...`
                : blueprint.description
              : t('blueprintCard.noDescription')}
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
            <div className="font-medium">{t('blueprintCard.childTemplates')}</div>
            <div
              className={`${childTemplatesCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}
              data-testid={`blueprint-child-templates-list-${blueprint.id}`}
            >
              {childTemplatesCount}
              {childTemplatesCount > 0 && <Layers className="ml-1 inline h-3 w-3" />}
            </div>
          </div>
        </div>
        <div className="flex w-24 flex-col items-center justify-center border-r p-2">
          <div className="text-center text-sm">
            <div className="font-medium">{t('blueprintCard.variables')}</div>
            <div
              className="cursor-pointer text-muted-foreground hover:underline"
              onClick={() => hasHelperTpl && setShowHelperTplDialog(true)}
              data-testid={`blueprint-variables-list-${blueprint.id}`}
            >
              {variablesCount}
              {hasHelperTpl && <Code className="ml-1 inline h-3 w-3" />}
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

      {/* Helper.tpl Preview Dialog */}
      <Dialog open={showHelperTplDialog} onOpenChange={setShowHelperTplDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Helper.tpl - {blueprint.name}</DialogTitle>
            <DialogDescription>
              Variáveis reutilizáveis disponíveis para instâncias criadas a partir deste blueprint.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted p-4">
            <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm">
              <code>{blueprint.helperTpl || '# Nenhuma variável definida.'}</code>
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelperTplDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Preview Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{blueprint.name}</DialogTitle>
            <DialogDescription>Descrição completa do blueprint</DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted/20 p-4">
            <MarkdownPreview content={blueprint.description || '*Sem descrição disponível*'} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDescriptionDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
