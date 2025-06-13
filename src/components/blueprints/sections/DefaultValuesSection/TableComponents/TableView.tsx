/**
 * TableView component (Refactored)
 * Provides a hierarchical table interface for editing blueprint values
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
// Importando componentes e constantes
import { COLUMN_WIDTHS, TableRows } from './TableRows';
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
      <div className="mt-4 flex h-full min-h-0 flex-col" data-testid="table-view">
        {/* Validation Display Component */}
        <ValidationDisplay
          validationState={validationState}
          showValidationFeedback={showValidationFeedback}
        />

        {/* Table Container com uma única área de scroll para sincronizar cabeçalho e corpo */}
        <div className="flex h-full max-h-[calc(100vh-11rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
          {/* ScrollArea englobando toda a tabela para scroll horizontal sincronizado - altura fixa */}
          <ScrollArea className="synchronized-scroll h-full flex-1">
            <Table className="w-full min-w-full table-fixed">
              {/* Cabeçalho com position sticky */}
              <TableHeader className="sticky-table-header">
                <TableRow>
                  <TableHead style={{ width: COLUMN_WIDTHS.field }}>
                    {t('values.table.field')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.type }}>
                    {t('values.table.type')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.defaultValue }}>
                    {t('values.table.defaultValue')}
                  </TableHead>
                  <TableHead style={{ width: COLUMN_WIDTHS.value }}>
                    {t('values.table.value')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: COLUMN_WIDTHS.exposed }}>
                    {t('values.table.exposed')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: COLUMN_WIDTHS.overridable }}>
                    {t('values.table.overridable')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Corpo da tabela */}
              <TableBody className="pb-8">
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
          </ScrollArea>
        </div>
        {/* Required Fields Legend - movida para dentro da área de scroll, mas fixada visualmente */}
        <div className="mb-2 text-right text-sm">
          <span className="mr-1 font-bold text-red-500">*</span>
          {t('values.validationMessages.required')}
        </div>
      </div>
    );
  }
);

TableView.displayName = 'TableView';
