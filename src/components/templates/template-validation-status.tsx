'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

import type { TemplateChartInfo } from '@/types/template';

import { Spinner } from '@/components/ui/spinner';

interface TemplateValidationStatusProps {
  chartInfo?: TemplateChartInfo | null;
  isValidating: boolean;
  error: string | null;
  'data-testid'?: string;
}

export function TemplateValidationStatus({
  chartInfo,
  isValidating,
  error,
  'data-testid': dataTestId = 'template-validation',
}: TemplateValidationStatusProps) {
  if (isValidating) {
    return (
      <div
        className="flex items-center gap-2 rounded-md bg-gray-50 p-3"
        data-testid={`${dataTestId}-loading`}
        data-status="validating"
      >
        <Spinner size="sm" />
        <span className="text-sm" data-testid={`${dataTestId}-loading-text`}>
          Validando template...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700"
        data-testid={`${dataTestId}-error`}
        data-status="error"
        data-error-message={error}
      >
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm" data-testid={`${dataTestId}-error-text`}>
          {error}
        </span>
      </div>
    );
  }

  if (!chartInfo) {
    return (
      <div
        className="flex items-center gap-2 rounded-md bg-gray-50 p-3"
        data-testid={`${dataTestId}-empty`}
        data-status="empty"
      >
        <AlertCircle className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600" data-testid={`${dataTestId}-empty-text`}>
          Selecione um caminho válido para validar o template
        </span>
      </div>
    );
  }

  if (chartInfo.isValid) {
    return (
      <div
        className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700"
        data-testid={`${dataTestId}-valid`}
        data-status="valid"
        data-chart-name={chartInfo.name}
        data-chart-version={chartInfo.version}
      >
        <CheckCircle2 className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium" data-testid={`${dataTestId}-valid-title`}>
            Template válido
          </p>
          <p className="text-xs" data-testid={`${dataTestId}-valid-details`}>
            Nome: {chartInfo.name} | Versão: {chartInfo.version}
            {chartInfo.description && ` | Descrição: ${chartInfo.description}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-700"
      data-testid={`${dataTestId}-invalid`}
      data-status="invalid"
      data-validation-message={chartInfo.validationMessage}
    >
      <AlertCircle className="h-5 w-5" />
      <div>
        <p className="text-sm font-medium" data-testid={`${dataTestId}-invalid-title`}>
          Template inválido
        </p>
        <p className="text-xs" data-testid={`${dataTestId}-invalid-message`}>
          {chartInfo.validationMessage || 'Erro de validação desconhecido'}
        </p>
      </div>
    </div>
  );
}
