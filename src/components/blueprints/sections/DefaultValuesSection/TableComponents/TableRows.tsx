/**
 * TableRows component
 * Renders the rows of the table with nested structure support
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import { UNIFIED_COLUMN_WIDTHS } from './constants';
import { UnifiedValueColumn } from './UnifiedValueColumn';
import {
  ArrayEditor,
  BooleanEditor,
  NumberEditor,
  ObjectEditor,
  StringEditor,
} from './ValueEditors';

interface TableRowsProps {
  fields: DefaultValueField[];
  onSourceChange: (field: DefaultValueField, source: ValueSourceType) => void;
  onValueChange: (field: DefaultValueField, value: unknown) => void;
  onExposeChange: (field: DefaultValueField, exposed: boolean) => void;
  onOverrideChange: (field: DefaultValueField, overridable: boolean) => void;
  blueprintVariables: Array<{ name: string; value: string }>;
  showValidationFeedback: boolean;
  // Props para expansão automática de campos
  expandedPaths?: Set<string>;
  toggleFieldExpansion?: (path: string) => void;
}

// Constantes para larguras de coluna - garante consistência com o cabeçalho
// Updated column widths for unified table layout
export const COLUMN_WIDTHS = UNIFIED_COLUMN_WIDTHS;

export const TableRows: React.FC<TableRowsProps> = React.memo(
  ({
    fields,
    onSourceChange,
    onValueChange,
    onExposeChange,
    onOverrideChange,
    blueprintVariables,
    showValidationFeedback,
    expandedPaths,
    toggleFieldExpansion: externalToggleFieldExpansion,
  }) => {
    // const { t } = useTranslation(['blueprints']);

    // State for expanded fields - usado quando não recebemos props externos
    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

    // Toggle field expansion - usa o callback externo se disponível
    const toggleFieldExpansion = useCallback(
      (fieldPath: string) => {
        if (externalToggleFieldExpansion) {
          externalToggleFieldExpansion(fieldPath);
        } else {
          setExpandedFields((prev) => ({
            ...prev,
            [fieldPath]: !prev[fieldPath],
          }));
        }
      },
      [externalToggleFieldExpansion]
    );

    // Check if a field is expanded - usa o Set externo se disponível
    const isFieldExpanded = useCallback(
      (fieldPath: string) => {
        if (expandedPaths) {
          return expandedPaths.has(fieldPath);
        }

        return Boolean(expandedFields[fieldPath]);
      },
      [expandedFields, expandedPaths]
    );

    // Render action button based on field state
    const renderActionButton = useCallback(
      (field: DefaultValueField) => {
        // For template values that aren't objects, show Customize button
        if (field.source === ValueSourceType.TEMPLATE && field.type !== 'object') {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px] text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => {
                // Copy template value to blueprint value and change source
                const value = field.originalValue !== undefined ? field.originalValue : field.value;

                onValueChange(field, value);
                onSourceChange(field, ValueSourceType.BLUEPRINT);
              }}
              data-testid={`customize-${field.key}`}
            >
              Customize
            </Button>
          );
        }

        // For blueprint values, show Reset button
        if (field.source === ValueSourceType.BLUEPRINT) {
          return (
            <Button
              variant="outline"
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={() => onSourceChange(field, ValueSourceType.TEMPLATE)}
              data-testid={`reset-${field.key}`}
            >
              Reset
            </Button>
          );
        }

        return null;
      },
      [onSourceChange, onValueChange]
    );

    // Render the appropriate editor for each value type
    const renderValueEditor = useCallback(
      (field: DefaultValueField) => {
        // Check if value is from template or customized in blueprint
        const isFromTemplate = field.source === ValueSourceType.TEMPLATE;

        // For object fields, we always show customized UI
        const isObjectType = field.type === 'object';

        // Cell background classes based on source
        const cellClasses =
          isFromTemplate && !isObjectType
            ? 'bg-slate-50 dark:bg-slate-900/30 rounded border border-dashed border-slate-200 dark:border-slate-700 px-2 py-1'
            : '';

        switch (field.type) {
          case 'string':
            return (
              <div className={cellClasses}>
                {isFromTemplate ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {field.originalValue !== undefined ? String(field.originalValue) : ''}
                    </span>
                  </div>
                ) : (
                  <StringEditor
                    value={String(field.value || '')}
                    onChange={(value) => onValueChange(field, value)}
                    disabled={false}
                    variables={blueprintVariables}
                  />
                )}
              </div>
            );

          case 'number':
            return (
              <div className={cellClasses}>
                {isFromTemplate ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{Number(field.originalValue)}</span>
                  </div>
                ) : (
                  <NumberEditor
                    value={Number(field.value || 0)}
                    onChange={(value) => onValueChange(field, value)}
                    disabled={false}
                  />
                )}
              </div>
            );

          case 'boolean':
            return (
              <div className={cellClasses}>
                {isFromTemplate ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {field.originalValue !== undefined ? String(field.originalValue) : ''}
                    </span>
                  </div>
                ) : (
                  <BooleanEditor
                    value={Boolean(field.value)}
                    onChange={(value) => onValueChange(field, value)}
                    disabled={false}
                  />
                )}
              </div>
            );

          case 'object':
            return <ObjectEditor disabled={isFromTemplate} />;

          case 'array':
            return (
              <div className={cellClasses}>
                {isFromTemplate ? (
                  <div className="flex items-center justify-between">
                    <ArrayEditor disabled={true} />
                  </div>
                ) : (
                  <ArrayEditor disabled={false} />
                )}
              </div>
            );

          default:
            return <span className="text-muted-foreground">-</span>;
        }
      },
      [onValueChange, blueprintVariables]
    );

    // Recursively render fields
    const renderFields = useCallback(
      (fieldsToRender: DefaultValueField[], depth = 0): React.ReactNode => {
        return fieldsToRender.map((field) => {
          const children = field.children ?? [];
          const hasChildren = field.type === 'object' && children.length > 0;
          const expanded = isFieldExpanded(field.path.join('.'));
          const isRequired = field.required;

          return (
            <React.Fragment key={field.path.join('.')}>
              <TableRow className={cn(depth > 0 && 'bg-muted/50', 'table-row-adjustable')}>
                <TableCell
                  style={{ paddingLeft: `${depth * 2 + 1}rem`, width: COLUMN_WIDTHS.field }}
                >
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-1 h-6 w-6 p-0"
                      onClick={() => toggleFieldExpansion(field.path.join('.'))}
                      data-testid={`expand-${field.key}`}
                    >
                      {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                  <span className={cn('text-sm', isRequired ? 'font-semibold' : '')}>
                    {field.key}
                    {isRequired && <span className="ml-1 text-red-500">*</span>}
                  </span>

                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </TableCell>

                <TableCell
                  className="text-xs text-muted-foreground"
                  style={{ width: COLUMN_WIDTHS.type }}
                >
                  {field.type}
                </TableCell>

                <TableCell style={{ width: COLUMN_WIDTHS.value }}>
                  <UnifiedValueColumn
                    field={field}
                    onApplyChanges={(newValue) => onValueChange(field, newValue)}
                    onCustomize={() => onSourceChange(field, ValueSourceType.BLUEPRINT)}
                    onReset={() => onSourceChange(field, ValueSourceType.TEMPLATE)}
                  />
                </TableCell>

                <TableCell className="text-center" style={{ width: COLUMN_WIDTHS.exposed }}>
                  <Switch
                    checked={field.exposed}
                    onCheckedChange={(checked) => onExposeChange(field, checked)}
                    data-testid={`expose-${field.key}`}
                  />
                </TableCell>

                <TableCell className="text-center" style={{ width: COLUMN_WIDTHS.overridable }}>
                  <Switch
                    checked={field.overridable}
                    onCheckedChange={(checked) => onOverrideChange(field, checked)}
                    data-testid={`override-${field.key}`}
                    disabled={!field.exposed || field.type === 'object'}
                  />
                </TableCell>
              </TableRow>
              {hasChildren && expanded && renderFields(children, depth + 1)}
            </React.Fragment>
          );
        });
      },
      [
        isFieldExpanded,
        toggleFieldExpansion,
        renderValueEditor,
        renderActionButton,
        onSourceChange,
        onExposeChange,
        onOverrideChange,
        showValidationFeedback,
      ]
    );

    return <>{renderFields(fields)}</>;
  }
);

TableRows.displayName = 'TableRows';
