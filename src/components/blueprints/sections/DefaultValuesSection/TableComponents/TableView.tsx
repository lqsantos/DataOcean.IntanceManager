/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { DefaultValueField, TemplateDefaultValues, ValueSourceType } from '../types';

import * as FieldService from './fieldUpdateService';
import { TableRows } from './TableRows';
import { ValidationDisplay } from './ValidationDisplay';

export interface TableViewProps {
  templateValues: TemplateDefaultValues;
  blueprintVariables: Array<{ name: string; value: string }>;
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;
  validationState?: {
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>;
  };
  showValidationFeedback?: boolean;
}

export const TableView: React.FC<TableViewProps> = React.memo(
  ({
    templateValues,
    blueprintVariables,
    onChange,
    validationState,
    showValidationFeedback = false,
  }) => {
    const { t } = useTranslation(['blueprints']);

    // Safety check for fields array
    const fields = templateValues?.fields || [];

    // Handle value source change (template vs blueprint)
    const handleSourceChange = useCallback(
      (field: DefaultValueField, source: ValueSourceType) => {
        const updatedFields = FieldService.updateFieldSource(templateValues.fields, field, source);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      },
      [templateValues, onChange]
    );

    // Handle value change
    const handleValueChange = useCallback(
      (field: DefaultValueField, newValue: unknown) => {
        const updatedFields = FieldService.updateFieldValue(templateValues.fields, field, newValue);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      },
      [templateValues, onChange]
    );

    // Handle expose toggle
    const handleExposeChange = useCallback(
      (field: DefaultValueField, exposed: boolean) => {
        const updatedFields = FieldService.updateFieldExposed(
          templateValues.fields,
          field,
          exposed
        );

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      },
      [templateValues, onChange]
    );

    // Handle override toggle
    const handleOverrideChange = useCallback(
      (field: DefaultValueField, overridable: boolean) => {
        const updatedFields = FieldService.updateFieldOverridable(
          templateValues.fields,
          field,
          overridable
        );

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      },
      [templateValues, onChange]
    );

    return (
      <div className="mt-4" data-testid="table-view">
        {/* Validation Display Component */}
        <ValidationDisplay
          validationState={validationState}
          showValidationFeedback={showValidationFeedback}
        />

        {/* Table Container with fixed height and scrollable content */}
        <div className="rounded-md border">
          {/* Use a container with fixed height for vertical scrolling */}
          <div style={{ height: '500px', overflow: 'auto' }}>
            {/* Standard table layout */}
            <Table className="min-w-full table-fixed border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="sticky top-0 z-10 w-1/3 bg-background"
                    style={{ width: '33%' }}
                  >
                    {t('values.table.field')}
                  </TableHead>
                  <TableHead
                    className="sticky top-0 z-10 w-24 bg-background"
                    style={{ width: '8%' }}
                  >
                    {t('values.table.type')}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background" style={{ width: '17%' }}>
                    {t('values.table.defaultValue')}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background" style={{ width: '25%' }}>
                    {t('values.table.value')}
                  </TableHead>
                  <TableHead
                    className="sticky top-0 z-10 bg-background text-center"
                    style={{ width: '8.5%' }}
                  >
                    {t('values.table.exposed')}
                  </TableHead>
                  <TableHead
                    className="sticky top-0 z-10 bg-background text-center"
                    style={{ width: '8.5%' }}
                  >
                    {t('values.table.overridable')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length > 0 ? (
                  <TableRows
                    fields={fields}
                    onSourceChange={handleSourceChange}
                    onValueChange={handleValueChange}
                    onExposeChange={handleExposeChange}
                    onOverrideChange={handleOverrideChange}
                    blueprintVariables={blueprintVariables}
                    showValidationFeedback={showValidationFeedback}
                  />
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

        {/* Required Fields Legend */}
        <div className="mt-2 text-right text-sm text-muted-foreground">
          <span className="mr-1 font-bold text-red-500">*</span>
          {t('values.validationMessages.required')}
        </div>
      </div>
    );
  }
);

TableView.displayName = 'TableView';
