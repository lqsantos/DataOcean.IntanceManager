'use client';

import { Edit2, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { BlueprintVariable } from './types';

interface VariablesTableProps {
  /** List of variables */
  variables: BlueprintVariable[];
  /** Callback when edit button is clicked */
  onEdit: (variable: BlueprintVariable) => void;
  /** Callback when delete button is clicked */
  onDelete: (variable: BlueprintVariable) => void;
}

/**
 * Table component to display blueprint variables
 */
export function VariablesTable({ variables, onEdit, onDelete }: VariablesTableProps) {
  // Search state
  const [search, setSearch] = useState('');

  // Handlers para prevenir submissão do formulário
  const handleEdit = (e: React.MouseEvent, variable: BlueprintVariable) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(variable);
  };

  const handleDelete = (e: React.MouseEvent, variable: BlueprintVariable) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(variable);
  };

  // Filter variables based on search
  const filteredVariables = useMemo(() => {
    if (!search) {
      return variables;
    }

    const searchLower = search.toLowerCase();

    return variables.filter((variable) => variable.name.toLowerCase().includes(searchLower));
  }, [variables, search]);

  // Helper to truncate text with tooltip
  const TruncatedText = ({ text, maxLength = 60 }: { text: string; maxLength?: number }) => {
    if (!text || text.length <= maxLength) {
      return <span>{text}</span>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{text.slice(0, maxLength)}...</span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[350px] whitespace-pre-wrap break-words">
            <p className="text-sm">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar variável por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Variables Table */}
      <div className="rounded-md border">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[200px]">Nome</TableHead>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor/Expressão</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {search ? 'Nenhuma variável encontrada' : 'Nenhuma variável definida'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVariables.map((variable) => (
                  <TableRow key={variable.name}>
                    <TableCell>
                      <TruncatedText text={variable.name} maxLength={30} />
                    </TableCell>
                    <TableCell>
                      {variable.type === 'fixed' ? 'Valor Fixo' : 'Expressão Go Template'}
                    </TableCell>
                    <TableCell>
                      {variable.description ? (
                        <TruncatedText text={variable.description} maxLength={60} />
                      ) : (
                        <span className="text-muted-foreground">Sem descrição</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <TruncatedText
                        text={variable.type === 'fixed' ? variable.value : variable.expression}
                        maxLength={40}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleEdit(e, variable)}
                                className="h-8 w-8"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar variável</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDelete(e, variable)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir variável</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
