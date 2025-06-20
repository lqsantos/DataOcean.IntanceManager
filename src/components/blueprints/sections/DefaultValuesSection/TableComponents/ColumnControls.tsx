/**
 * Column Controls Component
 * Provides UI controls for column auto-sizing and manual adjustments
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColumnControlsProps {
  onAutoSize: () => void;
  onReset: () => void;
  isResizing: boolean;
  className?: string;
}

export const ColumnControls: React.FC<ColumnControlsProps> = ({
  onAutoSize,
  onReset,
  isResizing,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <span className="text-gray-600 dark:text-gray-400">
        {t('blueprints.table.columnControls.label', 'Column sizing:')}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={onAutoSize}
        disabled={isResizing}
        className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
        title={t(
          'blueprints.table.columnControls.autoSize.tooltip',
          'Auto-size columns based on content'
        )}
      >
        {t('blueprints.table.columnControls.autoSize.label', 'Auto-size')}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={isResizing}
        className="h-6 px-2 text-xs hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        title={t(
          'blueprints.table.columnControls.reset.tooltip',
          'Reset columns to default widths'
        )}
      >
        {t('blueprints.table.columnControls.reset.label', 'Reset')}
      </Button>

      {isResizing && (
        <span className="animate-pulse text-blue-600 dark:text-blue-400">
          {t('blueprints.table.columnControls.resizing', 'Resizing...')}
        </span>
      )}

      <div className="ml-2 text-[10px] text-gray-500 dark:text-gray-500">
        {t('blueprints.table.columnControls.hint', 'Drag column borders to resize')}
      </div>
    </div>
  );
};
