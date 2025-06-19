import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListChildComponentProps } from 'react-window';
import { FixedSizeList } from 'react-window';

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

import type { BlueprintVariable } from './types';

interface VariablesListProps {
  variables: BlueprintVariable[];
  onEdit: (variable: BlueprintVariable) => void;
  onDelete: (variable: BlueprintVariable) => void;
}

export function VariablesList({ variables, onEdit, onDelete }: VariablesListProps) {
  const { t } = useTranslation(['blueprints', 'common']);
  const [search, setSearch] = useState('');

  // Filtrar variáveis com base na pesquisa
  const filteredVariables = variables.filter(
    (v) =>
      search === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Para tabelas pequenas, usamos renderização normal
  if (filteredVariables.length < 100) {
    return (
      <div className="space-y-4" data-testid="variables-list-container">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t('variables.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            data-testid="variables-search-input"
          />
        </div>

        <ScrollArea className="h-[400px] rounded-md border">
          <Table data-testid="variables-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('blueprints:variables.variableEditor.name')}</TableHead>
                <TableHead>{t('blueprints:variables.variableEditor.description')}</TableHead>
                <TableHead className="w-[100px]">{t('common:table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariables.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center"
                    data-testid="no-variables-message"
                  >
                    {t('variables.noVariablesFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVariables.map((variable) => (
                  <TableRow key={variable.id} data-testid={`variable-row-${variable.name}`}>
                    <TableCell>{variable.name}</TableCell>
                    <TableCell>{variable.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(variable)}
                          data-testid={`edit-variable-${variable.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(variable)}
                          data-testid={`delete-variable-${variable.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  }

  // Para tabelas grandes, usamos virtualização
  return (
    <div className="space-y-4" data-testid="variables-list-container">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={t('variables.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-testid="variables-search-input"
        />
      </div>

      <div className="rounded-md border" data-testid="variables-virtualized-list">
        <div className="grid grid-cols-[1fr_2fr_100px] border-b">
          <div className="p-2 font-medium">{t('blueprints:variables.variableEditor.name')}</div>
          <div className="p-2 font-medium">
            {t('blueprints:variables.variableEditor.description')}
          </div>
          <div className="p-2 font-medium">{t('common:table.actions')}</div>
        </div>

        <FixedSizeList
          height={400}
          width="100%"
          itemCount={filteredVariables.length}
          itemSize={40}
          className="overflow-auto"
          data-testid="variables-fixed-size-list"
        >
          {({ index, style }: ListChildComponentProps) => {
            const variable = filteredVariables[index];

            return (
              <div
                style={style}
                className="grid grid-cols-[1fr_2fr_100px] items-center border-b"
                data-testid={`variable-row-${variable.name}`}
              >
                <div className="truncate p-2" title={variable.name}>
                  {variable.name}
                </div>
                <div className="truncate p-2" title={variable.description}>
                  {variable.description || '-'}
                </div>
                <div className="flex space-x-1 p-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(variable)}
                    data-testid={`edit-variable-${variable.name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(variable)}
                    data-testid={`delete-variable-${variable.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          }}
        </FixedSizeList>
      </div>
    </div>
  );
}
