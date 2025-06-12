/**
 * ValidationDisplay component
 * Displays validation status and provides a modal for detailed validation feedback
 */

import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ValidationDisplayProps {
  validationState?: {
    isValid: boolean;
    errors: Array<{ message: string; path?: string[] }>;
    warnings: Array<{ message: string; path?: string[] }>;
    variableWarnings: Array<{ message: string; path?: string[]; variableName?: string }>;
  };
  showValidationFeedback: boolean;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validationState,
  showValidationFeedback,
}) => {
  const { t } = useTranslation(['blueprints']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Skip if no validation state or not showing feedback
  if (!validationState || !showValidationFeedback) {
    return null;
  }

  // Determine validation status for the indicator
  const hasErrors = validationState.errors.length > 0;
  const hasWarnings =
    validationState.warnings.length > 0 || validationState.variableWarnings.length > 0;

  // Count validation issues
  const errorCount = validationState.errors.length;
  const warningCount = validationState.warnings.length + validationState.variableWarnings.length;

  // Define style classes based on validation state
  let statusClass = '';
  let statusIcon = null;
  let statusMessage = '';
  let textColorClass = '';

  if (hasErrors) {
    statusClass = 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800';
    textColorClass = 'text-red-700 dark:text-red-400';
    statusIcon = <AlertCircle className="mr-2 h-5 w-5" />;
    statusMessage =
      errorCount === 1
        ? t('values.validationMessages.validationFailed')
        : t('values.validationMessages.validationFailedPlural', { count: errorCount });
  } else if (hasWarnings) {
    statusClass = 'bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800';
    textColorClass = 'text-amber-700 dark:text-amber-400';
    statusIcon = <AlertTriangle className="mr-2 h-5 w-5" />;
    statusMessage =
      warningCount === 1
        ? t('values.validationMessages.attention')
        : t('values.validationMessages.attentionPlural', { count: warningCount });
  } else {
    statusClass = 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800';
    textColorClass = 'text-green-700 dark:text-green-400';
    statusIcon = <CheckCircle className="mr-2 h-5 w-5" />;
    statusMessage = t('values.validationMessages.successMessage');
  }

  return (
    <>
      <div
        className={cn(
          'mb-2 flex items-center justify-between rounded-md px-3 py-2 text-sm',
          statusClass,
          textColorClass
        )}
      >
        <div className="flex items-center">
          {statusIcon}
          <span className="font-medium">{statusMessage}</span>
        </div>

        {(hasErrors || hasWarnings) && (
          <Button
            variant="link"
            className={cn('h-auto p-0', textColorClass)}
            onClick={() => setIsModalOpen(true)}
          >
            {t('values.validationMessages.viewDetails')}
          </Button>
        )}
      </div>

      {/* Validation details modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogHeader>
            {hasErrors ? (
              <DialogTitle className="flex items-center text-red-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                {t('values.validationMessages.errorDialogTitle')}
              </DialogTitle>
            ) : (
              <DialogTitle className="flex items-center text-amber-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {t('values.validationMessages.warningDialogTitle')}
              </DialogTitle>
            )}
            <DialogDescription>
              {t('values.validationMessages.dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Error section */}
            {hasErrors && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <h3 className="mb-3 font-medium text-red-800 dark:text-red-400">
                  {errorCount === 1
                    ? t('values.validationMessages.errorCount')
                    : t('values.validationMessages.errorCountPlural', { count: errorCount })}
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {validationState.errors.map((error, index) => (
                    <li key={`error-${index}`} className="text-red-700 dark:text-red-400">
                      {error.message}
                      {error.path && (
                        <span className="block text-xs text-red-600 opacity-75 dark:text-red-400">
                          {t('values.validationMessages.inPath', { path: error.path.join('.') })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning section */}
            {hasWarnings && validationState.warnings.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <h3 className="mb-3 font-medium text-amber-800 dark:text-amber-400">
                  {validationState.warnings.length === 1
                    ? t('values.validationMessages.warningCount')
                    : t('values.validationMessages.warningCountPlural', {
                        count: validationState.warnings.length,
                      })}
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {validationState.warnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-amber-700 dark:text-amber-400">
                      {warning.message}
                      {warning.path && (
                        <span className="block text-xs text-amber-600 opacity-75 dark:text-amber-400">
                          {t('values.validationMessages.inPath', { path: warning.path.join('.') })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variable warnings section */}
            {hasWarnings && validationState.variableWarnings.length > 0 && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <h3 className="mb-3 font-medium text-blue-800 dark:text-blue-400">
                  {validationState.variableWarnings.length === 1
                    ? t('values.validationMessages.variableWarningCount')
                    : t('values.validationMessages.variableWarningCountPlural', {
                        count: validationState.variableWarnings.length,
                      })}
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {validationState.variableWarnings.map((warning, index) => (
                    <li key={`var-warning-${index}`} className="text-blue-700 dark:text-blue-400">
                      {warning.message}
                      {warning.variableName && (
                        <span className="ml-2 inline-flex rounded-md border border-blue-300 bg-blue-100 px-1 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {warning.variableName}
                        </span>
                      )}
                      {warning.path && (
                        <span className="block text-xs text-blue-600 opacity-75 dark:text-blue-400">
                          {t('values.validationMessages.inPath', { path: warning.path.join('.') })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsModalOpen(false)}>
              {t('values.validationMessages.closeButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
