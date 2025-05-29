'use client';

import {
  Check,
  Copy,
  Edit,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Template } from '@/types/template';

interface ResourceTemplatesTableProps {
  templates: Template[];
  selectedTemplate?: string;
  onSelect?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDelete?: (template: Template) => void;
  validateTemplate?: (templateId: string) => Promise<boolean>;
  DeleteDialog?: React.ComponentType<any>;
}

export function ResourceTemplatesTable({
  templates,
  selectedTemplate,
  onSelect,
  onEdit,
  onDelete,
  validateTemplate,
  DeleteDialog,
}: ResourceTemplatesTableProps) {
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState<string | null>(null);

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete && onDelete) {
      onDelete(templateToDelete);
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleValidateClick = async (templateId: string) => {
    if (!validateTemplate) {
      return;
    }

    setIsValidating(templateId);

    try {
      await validateTemplate(templateId);
    } catch (error) {
      // O erro já é tratado no hook useTemplates, que exibe o toast
      console.error('Error validating template:', error);
    } finally {
      setIsValidating(null);
    }
  };

  const handleCopyRepositoryUrl = (template: Template) => {
    navigator.clipboard.writeText(template.repositoryUrl);
    toast.success('URL copiada', {
      description: 'URL do repositório copiada para a área de transferência',
    });
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Repositório</TableHead>
              <TableHead>Caminho do Chart</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum template encontrado.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow
                  key={template.id}
                  data-testid={`template-row-${template.id}`}
                  data-state={selectedTemplate === template.id ? 'selected' : undefined}
                  className={
                    selectedTemplate === template.id
                      ? 'bg-primary/10 dark:bg-primary/10'
                      : undefined
                  }
                >
                  <TableCell className="font-medium">
                    {onSelect ? (
                      <Button
                        variant="link"
                        onClick={() => onSelect(template.id)}
                        className="h-auto p-0 text-left"
                      >
                        {template.name}
                      </Button>
                    ) : (
                      template.name
                    )}
                  </TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="max-w-[200px] truncate">{template.repositoryUrl}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleCopyRepositoryUrl(template)}
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copiar URL do repositório</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar URL do repositório</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => window.open(template.repositoryUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="sr-only">Abrir repositório</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Abrir repositório em nova aba</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{template.chartPath}</TableCell>
                  <TableCell>
                    {template.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                        <Check className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(template.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {validateTemplate && (
                          <DropdownMenuItem
                            onClick={() => handleValidateClick(template.id)}
                            disabled={isValidating === template.id}
                          >
                            {isValidating === template.id ? (
                              <>
                                <span className="mr-2 flex h-4 w-4 items-center justify-center">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </span>
                                Validando...
                              </>
                            ) : (
                              <>
                                <Edit className="mr-2 h-4 w-4" />
                                Validar
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(template)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {DeleteDialog && templateToDelete && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleDeleteConfirm}
          template={templateToDelete}
        />
      )}
    </div>
  );
}
