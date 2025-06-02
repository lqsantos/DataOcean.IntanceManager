'use client';

import { Code, FileText, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VariableFormProps {
  /** Add variable callback */
  onAddVariable: (type: 'simple' | 'advanced') => void;
}

/**
 * Form for adding new variables
 */
export function VariableForm({ onAddVariable }: VariableFormProps) {
  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="sm" className="gap-1" data-testid="add-variable-button">
            <PlusCircle className="h-4 w-4" />
            Adicionar Variável
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onAddVariable('simple')}
            data-testid="add-simple-variable"
          >
            <FileText className="mr-2 h-4 w-4" />
            Valor Fixo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAddVariable('advanced')}
            data-testid="add-advanced-variable"
          >
            <Code className="mr-2 h-4 w-4" />
            Expressão Go Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
