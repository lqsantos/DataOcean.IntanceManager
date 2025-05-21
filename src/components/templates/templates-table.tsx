'use client';

import { format } from 'date-fns';
import { ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Template } from '@/types/template';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TemplatesTableProps {
  templates: Template[];
  isLoading?: boolean;
  onEdit?: (template: Template) => void;
  onDelete?: (id: string) => Promise<void>;
  'data-testid'?: string;
}

export function TemplatesTable({
  templates,
  isLoading = false,
  onEdit,
  onDelete,
  'data-testid': dataTestId = 'templates-table',
}: TemplatesTableProps) {
  // Sort templates by creation date (newest first)
  const sortedTemplates = useMemo(() => {
    return [...templates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [templates]);

  if (isLoading) {
    return <TemplatesTableSkeleton data-testid={`${dataTestId}-skeleton`} />;
  }

  // Função auxiliar para lidar com a exclusão
  const handleDelete = async (template: Template) => {
    if (onDelete && !template.hasBlueprints) {
      await onDelete(template.id);
    }
  };

  return (
    <div
      className="rounded-md border"
      data-testid={dataTestId}
      data-table-state={sortedTemplates.length === 0 ? 'empty' : 'has-data'}
      data-templates-count={sortedTemplates.length}
    >
      <Table data-testid={`${dataTestId}-table`}>
        <TableHeader data-testid={`${dataTestId}-header`}>
          <TableRow data-testid={`${dataTestId}-header-row`}>
            <TableHead data-testid={`${dataTestId}-head-name`}>Nome</TableHead>
            <TableHead data-testid={`${dataTestId}-head-version`}>Versão</TableHead>
            <TableHead data-testid={`${dataTestId}-head-repo`}>Repositório Git</TableHead>
            <TableHead data-testid={`${dataTestId}-head-date`}>Data de Cadastro</TableHead>
            <TableHead className="text-right" data-testid={`${dataTestId}-head-actions`}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid={`${dataTestId}-body`}>
          {sortedTemplates.length === 0 ? (
            <TableRow data-testid={`${dataTestId}-empty-row`}>
              <TableCell
                colSpan={5}
                className="h-24 text-center"
                data-testid={`${dataTestId}-empty-message`}
              >
                Nenhum template encontrado.
              </TableCell>
            </TableRow>
          ) : (
            sortedTemplates.map((template) => (
              <TableRow
                key={template.id}
                data-testid={`template-row-${template.id}`}
                data-template-id={template.id}
                data-template-name={template.name}
                data-template-version={template.version}
                data-has-blueprints={template.hasBlueprints ? 'true' : 'false'}
              >
                <TableCell className="font-medium" data-testid={`template-name-${template.id}`}>
                  <div className="flex items-center gap-2">
                    {template.name}
                    {template.hasBlueprints && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger data-testid={`template-lock-icon-${template.id}`}>
                            <Lock className="h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent data-testid={`template-lock-tooltip-${template.id}`}>
                            <p>Este template está vinculado a blueprints e não pode ser excluído</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell data-testid={`template-version-${template.id}`}>
                  {template.version}
                </TableCell>
                <TableCell data-testid={`template-repo-${template.id}`}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={template.gitRepositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                          data-testid={`repo-link-${template.id}`}
                          aria-label={`Abrir repositório ${template.gitRepositoryUrl}`}
                        >
                          {template.gitRepositoryUrl.split('/').pop()}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent data-testid={`repo-tooltip-${template.id}`}>
                        <p>{template.gitRepositoryUrl}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell data-testid={`template-date-${template.id}`}>
                  {format(new Date(template.createdAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right" data-testid={`template-actions-${template.id}`}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit?.(template)}
                      className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      data-testid={`edit-template-${template.id}`}
                      aria-label={`Editar template ${template.name}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className={`px-2 py-1 text-sm font-medium ${
                        template.hasBlueprints
                          ? 'cursor-not-allowed text-gray-400'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      disabled={template.hasBlueprints}
                      data-testid={`delete-template-${template.id}`}
                      aria-label={
                        template.hasBlueprints
                          ? `Template ${template.name} não pode ser excluído`
                          : `Excluir template ${template.name}`
                      }
                      data-disabled={template.hasBlueprints ? 'true' : 'false'}
                    >
                      Excluir
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TemplatesTableSkeleton({ 'data-testid': dataTestId }: { 'data-testid'?: string }) {
  return (
    <div className="rounded-md border" data-testid={dataTestId}>
      <Table data-testid={`${dataTestId}-table`}>
        <TableHeader data-testid={`${dataTestId}-header`}>
          <TableRow data-testid={`${dataTestId}-header-row`}>
            <TableHead data-testid={`${dataTestId}-head-name`}>Nome</TableHead>
            <TableHead data-testid={`${dataTestId}-head-version`}>Versão</TableHead>
            <TableHead data-testid={`${dataTestId}-head-repo`}>Repositório Git</TableHead>
            <TableHead data-testid={`${dataTestId}-head-date`}>Data de Cadastro</TableHead>
            <TableHead className="text-right" data-testid={`${dataTestId}-head-actions`}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid={`${dataTestId}-body`}>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index} data-testid={`${dataTestId}-skeleton-row-${index}`}>
              <TableCell data-testid={`${dataTestId}-skeleton-name-${index}`}>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell data-testid={`${dataTestId}-skeleton-version-${index}`}>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell data-testid={`${dataTestId}-skeleton-repo-${index}`}>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell data-testid={`${dataTestId}-skeleton-date-${index}`}>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell
                className="text-right"
                data-testid={`${dataTestId}-skeleton-actions-${index}`}
              >
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
