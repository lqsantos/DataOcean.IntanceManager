'use client';

import { AlertCircle, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { BlueprintVariable } from '../../types';

interface VariableCardProps {
  /** Variable data */
  variable: BlueprintVariable;
  /** Variable index */
  index: number;
  /** Is expanded */
  isExpanded: boolean;
  /** Toggle expanded state */
  toggleExpanded: () => void;
  /** Remove variable */
  onRemove: () => void;
  /** Update variable */
  onUpdate: (field: keyof BlueprintVariable, value: string) => void;
  /** Check if name is duplicate */
  isNameDuplicate: (name: string) => boolean;
}

/**
 * Card component to display and edit a variable
 */
export function VariableCard({
  variable,
  index,
  isExpanded,
  toggleExpanded,
  onRemove,
  onUpdate,
  isNameDuplicate,
}: VariableCardProps) {
  const validateTemplate = () => {
    // Basic syntax validation
    const value = variable.value || '';
    const openBraces = (value.match(/{{/g) || []).length;
    const closeBraces = (value.match(/}}/g) || []).length;

    if (openBraces !== closeBraces) {
      toast.error('Erro de sintaxe', {
        description: 'Número de chaves de abertura e fechamento não coincide',
      });
    } else {
      toast.success('Sintaxe válida', {
        description: 'A expressão parece estar corretamente formatada',
      });
    }
  };

  return (
    <Card
      className={`overflow-hidden border-l-4 ${
        variable.type === 'advanced' ? 'border-l-blue-500' : 'border-l-primary'
      }`}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={variable.type === 'advanced' ? 'secondary' : 'outline'}>
              {variable.type === 'advanced' ? 'Expressão' : 'Valor Fixo'}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={toggleExpanded}
              data-testid={`toggle-expand-variable-${index}`}
            >
              {isExpanded ? 'Colapsar' : 'Expandir'}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 opacity-70 hover:opacity-100"
            data-testid={`remove-variable-${index}`}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Nome da Variável</label>
            <div className="relative mt-1">
              {isNameDuplicate(variable.name) && (
                <AlertCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
              )}
              <Input
                value={variable.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`h-7 text-xs ${
                  isNameDuplicate(variable.name) ? 'border-destructive pr-8' : ''
                }`}
                placeholder="helper.nome_variavel"
                data-testid={`variable-name-input-${index}`}
              />
            </div>
            {isNameDuplicate(variable.name) && (
              <p className="mt-1 text-xs text-destructive">
                Este nome já está em uso por outra variável
              </p>
            )}
          </div>

          {isExpanded && (
            <div>
              <label className="text-xs font-medium">Descrição (opcional)</label>
              <Input
                value={variable.description || ''}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="mt-1 h-7 text-xs"
                placeholder="Descreva o propósito desta variável"
                data-testid={`variable-description-input-${index}`}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">
                {variable.type === 'advanced' ? 'Expressão Go Template' : 'Valor'}
              </label>
              {variable.type === 'advanced' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 p-0 text-xs"
                  onClick={validateTemplate}
                  data-testid={`validate-template-${index}`}
                >
                  Verificar Sintaxe
                </Button>
              )}
            </div>
            <Textarea
              value={variable.value || ''}
              onChange={(e) => onUpdate('value', e.target.value)}
              className={`mt-1 text-xs ${variable.type === 'advanced' ? 'font-mono' : ''}`}
              rows={isExpanded ? (variable.type === 'advanced' ? 6 : 3) : 1}
              placeholder={
                variable.type === 'advanced'
                  ? '{{- if eq .Values.environment "production" -}}\nprod\n{{- else -}}\ndev\n{{- end -}}'
                  : 'Valor fixo que será substituído'
              }
              data-testid={`variable-value-input-${index}`}
            />

            {variable.type === 'advanced' && (
              <p className="mt-1 text-xs text-muted-foreground">
                Use a sintaxe Go Template para criar expressões dinâmicas que avaliam valores em
                tempo de execução.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
