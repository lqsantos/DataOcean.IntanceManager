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

import * as ValueConfigFieldService from './valueConfigFieldUpdateService';
import {
  ArrayEditor,
  BooleanEditor,
  NumberEditor,
  ObjectEditor,
  StringEditor,
} from './ValueEditors';

// From TableRows component
export const COLUMN_WIDTHS = {
  field: '33%',
  type: '8%',
  defaultValue: '17%',
  value: '25%',
  exposed: '8.5%',
  overridable: '8.5%',
};

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

  // Other props
  blueprintVariables: Array<{ name: string; value: string }>;
  showValidationFeedback: boolean;
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
    blueprintVariables,
    showValidationFeedback,
  }) => {
    // State for expanded fields
    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

    // Convert value configuration to fields when using the typed structure
    const effectiveFields =
      useTypedValueConfiguration && valueConfig
        ? valueConfigurationToLegacyFields(valueConfig)
        : fields || [];

    // Toggle field expansion
    const toggleFieldExpansion = useCallback((fieldPath: string) => {
      setExpandedFields((prev) => ({
        ...prev,
        [fieldPath]: !prev[fieldPath],
      }));
    }, []);

    // Check if a field is expanded
    const isFieldExpanded = useCallback(
      (fieldPath: string) => Boolean(expandedFields[fieldPath]),
      [expandedFields]
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

                <TableCell
                  className="text-xs text-muted-foreground"
                  style={{ width: COLUMN_WIDTHS.defaultValue }}
                >
                  {field.originalValue !== undefined ? String(field.originalValue) : '-'}
                </TableCell>

                <TableCell style={{ width: COLUMN_WIDTHS.value }}>
                  <div className="flex items-center justify-between">
                    <div className="w-full">{renderValueEditor(field)}</div>
                    <div className="ml-2 flex">{renderActionButton(field)}</div>
                  </div>
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
