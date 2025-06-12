/**
 * ValidationFeedback component
 * Displays validation errors and warnings for the YAML editor,
 * schema validation and variable validation.
 */

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import type { ValidationFeedbackProps } from './types';

export const ValidationFeedback = ({
  errors,
  warnings = [],
  variableWarnings = [],
}: ValidationFeedbackProps) => {
  const { t } = useTranslation('blueprints', { keyPrefix: 'values.validation' });

  if (errors.length === 0 && warnings.length === 0 && variableWarnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="validation-feedback">
      {/* Error messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <div className="mb-2 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <AlertTitle>{t('errorTitle')}</AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pl-5">
              {errors.map((error, index) => (
                <li key={`error-${index}`} data-testid={`validation-error-${index}`}>
                  {error.message}
                  {error.path && (
                    <span className="block text-xs opacity-75">
                      {t('atPath', { path: error.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle>{t('warningTitle')}</AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pl-5">
              {warnings.map((warning, index) => (
                <li key={`warning-${index}`} data-testid={`validation-warning-${index}`}>
                  {warning.message}
                  {warning.path && (
                    <span className="block text-xs opacity-75">
                      {t('atPath', { path: warning.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Variable warnings */}
      {variableWarnings.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle>{t('warningTitle')}</AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pl-5">
              {variableWarnings.map((warning, index) => (
                <li key={`var-warning-${index}`} data-testid={`variable-warning-${index}`}>
                  {warning.message}
                  {warning.variableName && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {warning.variableName}
                    </Badge>
                  )}
                  {warning.path && (
                    <span className="block text-xs opacity-75">
                      {t('atPath', { path: warning.path.join('.') })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
