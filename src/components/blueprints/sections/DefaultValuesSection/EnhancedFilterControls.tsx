/**
 * EnhancedFilterControls Component
 * Filter controls for the table view with support for ValueConfiguration
 * Simplified to focus on name search, exposed and overridable fields
 */

import { Code, Eye, Pencil, Search, X } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

export interface FilterState {
  fieldName: string;
  exposed: boolean;
  overridable: boolean;
  customized: boolean;
}

interface EnhancedFilterControlsProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

const initialFilters: FilterState = {
  fieldName: '',
  exposed: false,
  overridable: false,
  customized: false,
};

export const EnhancedFilterControls = React.memo(function EnhancedFilterControls({
  onFilterChange,
  currentFilters,
}: EnhancedFilterControlsProps) {
  const { t } = useTranslation('blueprints');

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string | boolean) => {
      // Não atualizar se o valor não mudou
      if (currentFilters[key] === value) {
        return;
      }

      const newFilters = {
        ...currentFilters,
        [key]: value,
      };

      onFilterChange(newFilters);
    },
    [currentFilters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange('fieldName', e.target.value);
    },
    [handleFilterChange]
  );

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('filters.search.placeholder')}
            value={currentFilters.fieldName}
            onChange={handleSearchChange}
          />
        </div>

        <Toggle
          pressed={currentFilters.exposed}
          onPressedChange={(value) => handleFilterChange('exposed', value)}
          aria-label={t('values.table.exposed')}
          title={t('filters.onlyExposed')}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t('values.table.exposed')}
        </Toggle>

        <Toggle
          pressed={currentFilters.overridable}
          onPressedChange={(value) => handleFilterChange('overridable', value)}
          aria-label={t('values.table.overridable')}
          title={t('values.table.overridable')}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('values.table.overridable')}
        </Toggle>

        <Toggle
          pressed={currentFilters.customized}
          onPressedChange={(value) => handleFilterChange('customized', value)}
          aria-label={t('filters.onlyCustomized')}
          title={t('filters.onlyCustomized')}
        >
          <Code className="mr-2 h-4 w-4" />
          {t('filters.onlyCustomized')}
        </Toggle>

        {(currentFilters.fieldName ||
          currentFilters.exposed ||
          currentFilters.overridable ||
          currentFilters.customized) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            title={t('filters.clear')}
          >
            <X className="mr-2 h-4 w-4" />
            {t('filters.clear')}
          </Button>
        )}
      </div>
    </div>
  );
});
