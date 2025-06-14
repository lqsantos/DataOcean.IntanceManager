/**
 * FilterControls Component
 * Filter controls for the table view
 */

import { Search } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface FilterOptions {
  searchQuery: string;
  fieldType: string | null;
  onlyCustomized: boolean;
  onlyExposed: boolean;
}

interface FilterControlsProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  compact?: boolean; // Propriedade para usar layout compacto
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  compact = false,
}) => {
  const { t } = useTranslation(['blueprints']);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        ...filters,
        searchQuery: e.target.value,
      });
    },
    [filters, onFilterChange]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        fieldType: value === 'all' ? null : value,
      });
    },
    [filters, onFilterChange]
  );

  const handleCustomizedChange = useCallback(
    (checked: boolean) => {
      onFilterChange({
        ...filters,
        onlyCustomized: checked,
      });
    },
    [filters, onFilterChange]
  );

  const handleExposedChange = useCallback(
    (checked: boolean) => {
      onFilterChange({
        ...filters,
        onlyExposed: checked,
      });
    },
    [filters, onFilterChange]
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}
      data-testid="filter-controls"
    >
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={t('filters.search.placeholder')}
          className={`pl-7 ${compact ? 'h-8 py-1 text-sm' : ''}`}
          value={filters.searchQuery}
          onChange={handleSearchChange}
          data-testid="search-input"
        />
      </div>

      <Select value={filters.fieldType || 'all'} onValueChange={handleTypeChange}>
        <SelectTrigger
          className={`${compact ? 'h-8 w-[120px] text-sm' : 'w-[140px]'}`}
          data-testid="type-filter"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="filter-type-all">
            {t('filters.type.all')}
          </SelectItem>
          <SelectItem value="string" data-testid="filter-type-string">
            {t('filters.type.string')}
          </SelectItem>
          <SelectItem value="number" data-testid="filter-type-number">
            {t('filters.type.number')}
          </SelectItem>
          <SelectItem value="boolean" data-testid="filter-type-boolean">
            {t('filters.type.boolean')}
          </SelectItem>
          <SelectItem value="object" data-testid="filter-type-object">
            {t('filters.type.object')}
          </SelectItem>
          <SelectItem value="array" data-testid="filter-type-array">
            {t('filters.type.array')}
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-1">
        <Switch
          checked={filters.onlyCustomized}
          onCheckedChange={handleCustomizedChange}
          id="customized-filter"
          data-testid="customized-filter"
          className={compact ? 'h-4 w-8' : ''}
        />
        <Label htmlFor="customized-filter" className={compact ? 'text-xs' : ''}>
          {t('filters.onlyCustomized')}
        </Label>
      </div>

      <div className="flex items-center space-x-1">
        <Switch
          checked={filters.onlyExposed}
          onCheckedChange={handleExposedChange}
          id="exposed-filter"
          data-testid="exposed-filter"
          className={compact ? 'h-4 w-8' : ''}
        />
        <Label htmlFor="exposed-filter" className={compact ? 'text-xs' : ''}>
          {t('filters.onlyExposed')}
        </Label>
      </div>
    </div>
  );
};
