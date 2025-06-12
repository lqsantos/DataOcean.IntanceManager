/**
 * TableView component
 * Provides a hierarchical table interface for editing blueprint values
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { type ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { DefaultValueField, TemplateDefaultValues } from './types';
import { ValueSourceType } from './types';

interface TableViewProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables: Array<{ name: string; value: string }>;
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  templateValues,
  blueprintVariables,
  onChange,
}) => {
  const { t } = useTranslation(['blueprints']);

  // State for expanded fields (for nested objects)
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

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

  // Safety check for fields array
  const fields = templateValues?.fields || [];

  // Handle value source change (template vs blueprint)
  const _handleSourceChange = useCallback(
    (field: DefaultValueField, source: ValueSourceType) => {
      // Create a deep copy of fields to update
      const updatedFields = [...templateValues.fields];

      // Find and update the field
      const updateField = (
        fields: DefaultValueField[],
        path: string[],
        updateFn: (field: DefaultValueField) => void
      ): DefaultValueField[] => {
        return fields.map((f) => {
          // Check if paths match
          const isMatch =
            f.path.length === path.length && f.path.every((segment, i) => segment === path[i]);

          if (isMatch) {
            const updatedField = { ...f };

            updateFn(updatedField);

            return updatedField;
          }

          // Recursively check children
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: updateField(f.children, path, updateFn),
            };
          }

          return f;
        });
      };

      // Update the field with the new source
      const result = updateField(updatedFields, field.path, (f) => {
        f.source = source;
      });

      // Update template values
      onChange({
        ...templateValues,
        fields: result,
      });
    },
    [templateValues, onChange]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (field: DefaultValueField, newValue: unknown) => {
      // Create a deep copy of fields to update
      const updatedFields = [...templateValues.fields];

      // Find and update the field
      const updateField = (
        fields: DefaultValueField[],
        path: string[],
        updateFn: (field: DefaultValueField) => void
      ): DefaultValueField[] => {
        return fields.map((f) => {
          // Check if paths match
          const isMatch =
            f.path.length === path.length && f.path.every((segment, i) => segment === path[i]);

          if (isMatch) {
            const updatedField = { ...f };

            updateFn(updatedField);

            return updatedField;
          }

          // Recursively check children
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: updateField(f.children, path, updateFn),
            };
          }

          return f;
        });
      };

      // Update the field with the new value
      const result = updateField(updatedFields, field.path, (f) => {
        // Cast the value to the expected type
        f.value = newValue as typeof f.value;

        // If we're setting a value, ensure the source is blueprint
        if (newValue !== undefined && newValue !== null) {
          f.source = ValueSourceType.BLUEPRINT;
        }
      });

      // Update template values
      onChange({
        ...templateValues,
        fields: result,
      });
    },
    [templateValues, onChange]
  );

  // Handle expose toggle
  const handleExposeChange = useCallback(
    (field: DefaultValueField, exposed: boolean) => {
      // Create a deep copy of fields to update
      const updatedFields = [...templateValues.fields];

      // Find and update the field
      const updateField = (
        fields: DefaultValueField[],
        path: string[],
        updateFn: (field: DefaultValueField) => void
      ): DefaultValueField[] => {
        return fields.map((f) => {
          // Check if paths match
          const isMatch =
            f.path.length === path.length && f.path.every((segment, i) => segment === path[i]);

          if (isMatch) {
            const updatedField = { ...f };

            updateFn(updatedField);

            return updatedField;
          }

          // Recursively check children
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: updateField(f.children, path, updateFn),
            };
          }

          return f;
        });
      };

      // Update the field with the new exposed value
      const result = updateField(updatedFields, field.path, (f) => {
        f.exposed = exposed;

        // If not exposed, ensure not overridable
        if (!exposed) {
          f.overridable = false;
        }
      });

      // Update template values
      onChange({
        ...templateValues,
        fields: result,
      });
    },
    [templateValues, onChange]
  );

  // Handle override toggle
  const handleOverrideChange = useCallback(
    (field: DefaultValueField, overridable: boolean) => {
      // Create a deep copy of fields to update
      const updatedFields = [...templateValues.fields];

      // Find and update the field
      const updateField = (
        fields: DefaultValueField[],
        path: string[],
        updateFn: (field: DefaultValueField) => void
      ): DefaultValueField[] => {
        return fields.map((f) => {
          // Check if paths match
          const isMatch =
            f.path.length === path.length && f.path.every((segment, i) => segment === path[i]);

          if (isMatch) {
            const updatedField = { ...f };

            updateFn(updatedField);

            return updatedField;
          }

          // Recursively check children
          if (f.children && f.children.length > 0) {
            return {
              ...f,
              children: updateField(f.children, path, updateFn),
            };
          }

          return f;
        });
      };

      // Update the field with the new overridable value
      const result = updateField(updatedFields, field.path, (f) => {
        f.overridable = overridable;

        // If overridable, ensure exposed
        if (overridable) {
          f.exposed = true;
        }
      });

      // Update template values
      onChange({
        ...templateValues,
        fields: result,
      });
    },
    [templateValues, onChange]
  );

  // Temporary editor components
  const StringEditor = ({
    value,
    onChange,
    disabled,
    variables: _,
  }: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    variables?: Array<{ name: string; value: string }>;
  }) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded border p-1"
    />
  );

  const NumberEditor = ({
    value,
    onChange,
    disabled,
  }: {
    value: number;
    onChange: (val: number) => void;
    disabled?: boolean;
  }) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-24 rounded border p-1"
    />
  );

  const BooleanEditor = ({
    value,
    onChange,
    disabled,
  }: {
    value: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
  );

  const ObjectEditor = ({ disabled }: { disabled?: boolean }) => (
    <div className="text-sm text-muted-foreground">
      {disabled ? 'Object (from template)' : 'Object (configure individual fields)'}
    </div>
  );

  const ArrayEditor = ({ disabled }: { disabled?: boolean }) => (
    <div className="text-sm text-muted-foreground">
      {disabled ? 'Array (from template)' : 'Array (edit in YAML view)'}
    </div>
  );

  // Render value editor based on field type
  const renderValueEditor = useCallback(
    (field: DefaultValueField) => {
      // Only allow editing if source is blueprint
      const disabled = field.source !== ValueSourceType.BLUEPRINT;

      switch (field.type) {
        case 'string':
          return (
            <StringEditor
              value={String(field.value ?? '')}
              onChange={(value: string) => handleValueChange(field, value)}
              disabled={disabled}
              variables={blueprintVariables}
            />
          );
        case 'number':
          return (
            <NumberEditor
              value={Number(field.value ?? 0)}
              onChange={(value: number) => handleValueChange(field, value)}
              disabled={disabled}
            />
          );
        case 'boolean':
          return (
            <BooleanEditor
              value={Boolean(field.value)}
              onChange={(value: boolean) => handleValueChange(field, value)}
              disabled={disabled}
            />
          );
        case 'object':
          return <ObjectEditor disabled={disabled} />;
        case 'array':
          return <ArrayEditor disabled={disabled} />;
        default:
          return <span className="text-muted-foreground">-</span>;
      }
    },
    [handleValueChange, blueprintVariables]
  );

  // Recursively render fields
  const renderFields = useCallback(
    (fields: DefaultValueField[], depth = 0): ReactNode => {
      return fields.map((field) => {
        const children = field.children ?? [];
        const hasChildren = field.type === 'object' && children.length > 0;
        const expanded = isFieldExpanded(field.path.join('.'));

        return (
          <React.Fragment key={field.path.join('.')}>
            <TableRow className={cn('group/row', depth > 0 && 'bg-muted/50')}>
              <TableCell className="w-1/3" style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
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
                ) : (
                  <span className="ml-6"></span>
                )}
                {field.key}
              </TableCell>
              <TableCell className="w-1/12">{field.type}</TableCell>
              <TableCell className="w-1/6">
                <div className="max-w-[150px] truncate">
                  {field.originalValue !== undefined ? (
                    String(field.originalValue)
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="w-1/6">
                {field.type !== 'object' ? renderValueEditor(field) : null}
              </TableCell>
              <TableCell className="w-1/12 text-center">
                <Switch
                  checked={field.exposed}
                  onCheckedChange={(checked) => handleExposeChange(field, checked)}
                  data-testid={`expose-${field.key}`}
                  disabled={field.type === 'object'}
                />
              </TableCell>
              <TableCell className="w-1/12 text-center">
                <Switch
                  checked={field.overridable}
                  onCheckedChange={(checked) => handleOverrideChange(field, checked)}
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
      handleExposeChange,
      handleOverrideChange,
    ]
  );

  return (
    <div className="mt-4" data-testid="table-view">
      <div className="rounded-md border">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-1/3">{t('values.table.field')}</TableHead>
                <TableHead className="w-1/12">{t('values.table.type')}</TableHead>
                <TableHead className="w-1/6">{t('values.table.defaultValue')}</TableHead>
                <TableHead className="w-1/6">{t('values.table.value')}</TableHead>
                <TableHead className="w-1/12 text-center">{t('values.table.exposed')}</TableHead>
                <TableHead className="w-1/12 text-center">
                  {t('values.table.overridable')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length > 0 ? (
                renderFields(fields)
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Alert>
                      <AlertDescription>{t('values.table.noFields')}</AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
