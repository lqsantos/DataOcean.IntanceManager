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
      <div className="mt-4 flex h-full min-h-0 flex-col" data-testid="table-view">
        {/* Validation Display Component */}
        <ValidationDisplay
          validationState={validationState}
          showValidationFeedback={showValidationFeedback}
        />

        {/* Table Container with flex layout for proper scrolling */}
        <div className="flex h-full max-h-[calc(100vh-13rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
          {/* Table header fixo */}
          <div className="flex-shrink-0 bg-background">
            <Table className="min-w-full table-fixed border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3" style={{ width: '33%' }}>
                    {t('values.table.field')}
                  </TableHead>
                  <TableHead className="w-24" style={{ width: '8%' }}>
                    {t('values.table.type')}
                  </TableHead>
                  <TableHead className="" style={{ width: '17%' }}>
                    {t('values.table.defaultValue')}
                  </TableHead>
                  <TableHead className="" style={{ width: '25%' }}>
                    {t('values.table.value')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: '8.5%' }}>
                    {t('values.table.exposed')}
                  </TableHead>
                  <TableHead className="text-center" style={{ width: '8.5%' }}>
                    {t('values.table.overridable')}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* Conteúdo da tabela com scroll usando o componente ScrollArea */}
          <ScrollArea className="h-full flex-1 pb-4" type="auto">
            <Table className="min-w-full table-fixed border-collapse">
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
            {/* Espaçador para garantir que a última linha seja totalmente visível */}
            <div className="h-10" aria-hidden="true"></div>
          </ScrollArea>
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
