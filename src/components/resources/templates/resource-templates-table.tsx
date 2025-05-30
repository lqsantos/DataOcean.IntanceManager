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
import { useTranslation } from 'react-i18next';
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

// As categorias disponíveis para exibir quando a categoria estiver vazia
const templateCategories = [
  'Application',
  'Infrastructure',
  'Database',
  'Monitoring',
  'Security',
  'Storage',
  'Other',
];

interface ResourceTemplatesTableProps {
  templates: Template[];
  selectedTemplate?: string;
  onSelect?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDelete?: (template: Template) => void;
  validateTemplate?: (templateId: string) => Promise<boolean>;
  DeleteDialog?: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    template: Template | null;
  }>;
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
  // Use i18n namespace correto
  const { t } = useTranslation();
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
    toast.success('URL Copiada', {
      description: 'URL do repositório copiada para a área de transferência',
    });
  };

  return (
    <div className="w-full" data-testid="resource-templates-table-container">
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
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                  data-testid="resource-templates-empty-message"
                >
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
                        data-testid={`template-name-${template.id}`}
                      >
                        {template.name}
                      </Button>
                    ) : (
                      template.name
                    )}
                  </TableCell>
                  <TableCell data-testid={`template-category-${template.id}`}>
                    {template.category || 'Other'}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center space-x-2"
                      data-testid={`template-repository-${template.id}`}
                    >
                      <span className="max-w-[200px] truncate">{template.repositoryUrl}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleCopyRepositoryUrl(template)}
                              data-testid={`template-copy-url-${template.id}`}
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copiar URL</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar URL</p>
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
                              data-testid={`template-open-url-${template.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="sr-only">Abrir repositório</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Abrir repositório</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell data-testid={`template-path-${template.id}`}>
                    {template.chartPath}
                  </TableCell>
                  <TableCell>
                    {template.isActive ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600"
                        data-testid={`template-status-active-${template.id}`}
                      >
                        <Check className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                        data-testid={`template-status-inactive-${template.id}`}
                      >
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`template-actions-${template.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(template.id)}
                            data-testid={`template-edit-${template.id}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {validateTemplate && (
                          <DropdownMenuItem
                            onClick={() => handleValidateClick(template.id)}
                            disabled={isValidating === template.id}
                            data-testid={`template-validate-${template.id}`}
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
                            data-testid={`template-delete-${template.id}`}
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
