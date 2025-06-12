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

        {/* Required Fields Legend */}
        <div className="mb-2 text-sm text-muted-foreground">
          <span className="mr-1 font-bold text-red-500">*</span>
          {t('values.validationMessages.required')}
        </div>

        {/* Table */}
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
      </div>
    );
  }
);

TableView.displayName = 'TableView';
