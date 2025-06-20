/**
 * EnhancedTableRows component
 * Version of TableRows that better supports the typed ValueConfiguration structure
 * with improved handling of nested fields and arrays
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';
import { valueConfigurationToLegacyFields } from '../ValueConfigurationConverter';

import { UNIFIED_COLUMN_WIDTHS } from './constants';
import { UnifiedValueColumn } from './UnifiedValueColumn';
import * as ValueConfigFieldService from './valueConfigFieldUpdateService';
import {
  ArrayEditor,
  BooleanEditor,
  NumberEditor,
  ObjectEditor,
  StringEditor,
} from './ValueEditors';

// Updated column widths for unified table layout
export const COLUMN_WIDTHS = UNIFIED_COLUMN_WIDTHS;

interface EnhancedTableRowsProps {
  // Accept both legacy fields and the new ValueConfiguration
  fields?: DefaultValueField[];
  valueConfig?: ValueConfiguration;
  useTypedValueConfiguration?: boolean;

  // Callbacks for both formats
  onSourceChange: (field: DefaultValueField, source: ValueSourceType) => void;
  onValueChange: (field: DefaultValueField, value: unknown) => void;
  onExposeChange: (field: DefaultValueField, exposed: boolean) => void;
  onOverrideChange: (field: DefaultValueField, overridable: boolean) => void;
  onValueConfigChange?: (valueConfig: ValueConfiguration) => void;

  // Reset functionality
  onResetRecursive?: (customizedPaths: string[]) => void;

  // Other props
  blueprintVariables: Array<{ name: string; value: string }>;
  showValidationFeedback: boolean;

  // Props para expansão automática de campos
  expandedPaths?: Set<string>;
  toggleFieldExpansion?: (path: string) => void;
}

export const EnhancedTableRows: React.FC<EnhancedTableRowsProps> = React.memo(
  ({
    fields,
    valueConfig,
    useTypedValueConfiguration,
    onSourceChange,
    onValueChange,
    onExposeChange,
    onOverrideChange,
    onValueConfigChange,
    onResetRecursive,
    blueprintVariables,
    showValidationFeedback,
    expandedPaths,
    toggleFieldExpansion: externalToggleFieldExpansion,
  }) => {
    // State for expanded fields - usado quando não recebemos props externos
    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

    // Convert value configuration to fields when using the typed structure
    const effectiveFields =
      useTypedValueConfiguration && valueConfig
        ? valueConfigurationToLegacyFields(valueConfig)
        : fields || [];

    // Toggle field expansion - sempre delegando para o externo quando disponível
    const toggleFieldExpansion = useCallback(
      (fieldPath: string) => {
        // Log para debug
        console.warn(`[EnhancedTableRows] Toggling field: ${fieldPath}`);

        // Usando handler externo se disponível
        if (externalToggleFieldExpansion) {
          // Delega totalmente ao handler externo que tem a lógica robusta
          externalToggleFieldExpansion(fieldPath);
        } else {
          // Caso contrário, use o estado interno mais simples
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

    // Handle direct update to value configuration (when using typed structure)
    const handleTypedValueChange = useCallback(
      (path: string, newValue: unknown) => {
        if (valueConfig && onValueConfigChange) {
          const updatedConfig = ValueConfigFieldService.updateFieldValue(
            valueConfig,
            path,
            newValue
          );

          onValueConfigChange(updatedConfig);
        }
      },
      [valueConfig, onValueConfigChange]
    );

    const handleTypedSourceChange = useCallback(
      (path: string, isCustomized: boolean) => {
        if (valueConfig && onValueConfigChange) {
          const updatedConfig = ValueConfigFieldService.updateFieldCustomized(
            valueConfig,
            path,
            isCustomized
          );

          // If not customized, reset to default value
          const finalConfig = isCustomized
            ? updatedConfig
            : ValueConfigFieldService.resetFieldToDefault(updatedConfig, path);

          onValueConfigChange(finalConfig);
        }
      },
      [valueConfig, onValueConfigChange]
    );

    const handleTypedExposeChange = useCallback(
      (path: string, isExposed: boolean) => {
        if (valueConfig && onValueConfigChange) {
          const updatedConfig = ValueConfigFieldService.updateFieldExposed(
            valueConfig,
            path,
            isExposed
          );

          onValueConfigChange(updatedConfig);
        }
      },
      [valueConfig, onValueConfigChange]
    );

    const handleTypedOverrideChange = useCallback(
      (path: string, isOverridable: boolean) => {
        if (valueConfig && onValueConfigChange) {
          const updatedConfig = ValueConfigFieldService.updateFieldOverridable(
            valueConfig,
            path,
            isOverridable
          );

          onValueConfigChange(updatedConfig);
        }
      },
      [valueConfig, onValueConfigChange]
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

                if (useTypedValueConfiguration) {
                  // Use typed handling directly
                  const path = field.path.join('.');

                  handleTypedValueChange(path, value);

                  handleTypedSourceChange(path, true);
                } else {
                  // Use legacy handling
                  onValueChange(field, value);
                  onSourceChange(field, ValueSourceType.BLUEPRINT);
                }
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
              onClick={() => {
                if (useTypedValueConfiguration) {
                  // Use typed handling directly
                  const path = field.path.join('.');

                  handleTypedSourceChange(path, false);
                } else {
                  // Use legacy handling
                  onSourceChange(field, ValueSourceType.TEMPLATE);
                }
              }}
              data-testid={`reset-${field.key}`}
            >
              Reset
            </Button>
          );
        }

        return null;
      },
      [
        onSourceChange,
        onValueChange,
        useTypedValueConfiguration,
        handleTypedSourceChange,
        handleTypedValueChange,
      ]
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

        const handleValueChangeWrapper = (value: unknown) => {
          if (useTypedValueConfiguration) {
            // Use typed handling directly
            const path = field.path.join('.');

            handleTypedValueChange(path, value);
          } else {
            // Use legacy handling
            onValueChange(field, value);
          }
        };

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
                    onChange={handleValueChangeWrapper}
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
                    onChange={handleValueChangeWrapper}
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
                    onChange={handleValueChangeWrapper}
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
      [onValueChange, blueprintVariables, useTypedValueConfiguration, handleTypedValueChange]
    );

    // Recursively render fields
    const renderFields = useCallback(
      (fieldsToRender: DefaultValueField[], depth = 0): React.ReactNode => {
        return fieldsToRender.map((field) => {
          const children = field.children ?? [];
          const hasChildren = field.type === 'object' && children.length > 0;
          const expanded = isFieldExpanded(field.path.join('.'));
          const isRequired = field.required;

          // Handle field toggling events with support for both formats
          const handleExposeChangeWrapper = (checked: boolean) => {
            if (useTypedValueConfiguration) {
              // Use typed handling directly
              const path = field.path.join('.');

              handleTypedExposeChange(path, checked);
            } else {
              // Use legacy handling
              onExposeChange(field, checked);
            }
          };

          const handleOverrideChangeWrapper = (checked: boolean) => {
            if (useTypedValueConfiguration) {
              // Use typed handling directly
              const path = field.path.join('.');

              handleTypedOverrideChange(path, checked);
            } else {
              // Use legacy handling
              onOverrideChange(field, checked);
            }
          };

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
                    onReset={() => {
                      // For object fields with children, handle recursive reset if callback is provided
                      if (field.type === 'object' && field.children && onResetRecursive) {
                        // This will be handled by the ObjectDisplayComponent internally
                        // The component will determine which children need to be reset
                        onSourceChange(field, ValueSourceType.TEMPLATE);
                      } else {
                        // For non-object fields, use normal reset
                        onSourceChange(field, ValueSourceType.TEMPLATE);
                      }
                    }}
                    onResetRecursive={
                      field.type === 'object' && onResetRecursive ? onResetRecursive : undefined
                    }
                  />
                </TableCell>

                <TableCell className="text-center" style={{ width: COLUMN_WIDTHS.exposed }}>
                  <Switch
                    checked={field.exposed}
                    onCheckedChange={handleExposeChangeWrapper}
                    data-testid={`expose-${field.key}`}
                  />
                </TableCell>

                <TableCell className="text-center" style={{ width: COLUMN_WIDTHS.overridable }}>
                  <Switch
                    checked={field.overridable}
                    onCheckedChange={handleOverrideChangeWrapper}
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
        onExposeChange,
        onOverrideChange,
        useTypedValueConfiguration,
        handleTypedExposeChange,
        handleTypedOverrideChange,
        showValidationFeedback,
      ]
    );

    return <>{renderFields(effectiveFields)}</>;
  }
);

EnhancedTableRows.displayName = 'EnhancedTableRows';
