/**
 * ValidationFeedback component
 * Displays validation errors and warnings for the YAML editor
 */

import { AlertCircle, AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import type { ValidationFeedbackProps } from './types';

export const ValidationFeedback = ({ errors, warnings = [] }: ValidationFeedbackProps) => {
  // Mock translation for now
  const t = (key: string, params?: { path: string }) => {
    const translations: Record<string, string> = {
      'defaultValues.validation.errorTitle': 'Validation Errors',
      'defaultValues.validation.warningTitle': 'Validation Warnings',
    };

    if (key === 'defaultValues.validation.atPath' && params) {
      return `at path: ${params.path}`;
    }

    return translations[key] || key;
  };

  // No errors or warnings to show
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="validation-feedback">
      {/* Error messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('defaultValues.validation.errorTitle')}</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pl-5">
              {errors.map((error, index) => (
                <li key={`error-${index}`} data-testid={`validation-error-${index}`}>
                  {error.message}
                  {error.path && (
                    <span className="block text-xs opacity-75">
                      {t('defaultValues.validation.atPath', { path: error.path.join('.') })}
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
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>{t('defaultValues.validation.warningTitle')}</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pl-5">
              {warnings.map((warning, index) => (
                <li key={`warning-${index}`} data-testid={`validation-warning-${index}`}>
                  {warning.message}
                  {warning.path && (
                    <span className="block text-xs opacity-75">
                      {t('defaultValues.validation.atPath', { path: warning.path.join('.') })}
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
