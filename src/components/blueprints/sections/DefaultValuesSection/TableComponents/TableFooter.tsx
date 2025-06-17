/**
 * TableFooter component
 * Exibe informações e legendas abaixo da tabela
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TableFooterProps {
  showRequiredLegend?: boolean;
}

export const TableFooter: React.FC<TableFooterProps> = ({ showRequiredLegend = true }) => {
  const { t } = useTranslation(['blueprints']);

  if (!showRequiredLegend) {
    return null;
  }

  return (
    <div className="mb-2 text-right text-sm">
      <span className="mr-1 font-bold text-red-500">*</span>
      {t('values.validationMessages.required')}
    </div>
  );
};
