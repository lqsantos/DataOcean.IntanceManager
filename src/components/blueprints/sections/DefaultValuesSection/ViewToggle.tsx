/**
 * ViewToggle Component
 * Toggle between table view and YAML editor view
 */

import { Code, Table } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export enum ViewMode {
  TABLE = 'table',
  YAML = 'yaml',
}

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  const { t } = useTranslation(['blueprints']);

  const handleChangeView = useCallback(
    (value: string) => {
      if (value === ViewMode.TABLE || value === ViewMode.YAML) {
        onViewModeChange(value as ViewMode);
      }
    },
    [onViewModeChange]
  );

  return (
    <div className="mb-4 flex justify-end" data-testid="view-toggle">
      <ToggleGroup type="single" value={viewMode} onValueChange={handleChangeView}>
        <ToggleGroupItem
          value={ViewMode.TABLE}
          aria-label={t('viewToggle.table')}
          data-testid="table-view-toggle"
        >
          <Table className="mr-2 h-4 w-4" />
          {t('viewToggle.table')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value={ViewMode.YAML}
          aria-label={t('viewToggle.yaml')}
          data-testid="yaml-view-toggle"
        >
          <Code className="mr-2 h-4 w-4" />
          {t('viewToggle.yaml')}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
