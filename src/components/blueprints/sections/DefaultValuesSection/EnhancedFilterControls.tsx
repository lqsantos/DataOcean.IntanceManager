/**
 * EnhancedFilterControls Component
 * Filter controls for the table view with support for ValueConfiguration
 */

import { Filter, Search, Tag, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
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
import type { ValueConfiguration } from '@/types/blueprint';

import { filterValueConfigurationFields } from './ValueConfigurationConverter';

export interface FilterOptions {
  searchQuery: string;
  fieldType: string | null;
  onlyCustomized: boolean;
  onlyExposed: boolean;
}

interface EnhancedFilterControlsProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;

  // Optional ValueConfiguration for typed filtering
  valueConfiguration?: ValueConfiguration;
  useTypedValueConfiguration?: boolean;
  onFilteredValueConfigChange?: (filteredFields: Record<string, unknown>) => void;

  compact?: boolean;
  _isExpandedMode?: boolean;
}

export const EnhancedFilterControls: React.FC<EnhancedFilterControlsProps> = ({
  filters,
  onFilterChange,
  valueConfiguration,
  useTypedValueConfiguration = false,
  onFilteredValueConfigChange,
  compact = false,
  _isExpandedMode = false,
}) => {
  const { t } = useTranslation(['blueprints']);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFilters = {
        ...filters,
        searchQuery: e.target.value,
      };

      onFilterChange(newFilters);

      // If using typed configuration, also filter and notify about filtered fields
      if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
        const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

        onFilteredValueConfigChange(filteredFields);
      }
    },
    [
      filters,
      onFilterChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onFilteredValueConfigChange,
    ]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const newFilters = {
        ...filters,
        fieldType: value === 'all' ? null : value,
      };

      onFilterChange(newFilters);

      // If using typed configuration, also filter and notify about filtered fields
      if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
        const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

        onFilteredValueConfigChange(filteredFields);
      }
    },
    [
      filters,
      onFilterChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onFilteredValueConfigChange,
    ]
  );

  const handleCustomizedChange = useCallback(
    (checked: boolean) => {
      const newFilters = {
        ...filters,
        onlyCustomized: checked,
      };

      onFilterChange(newFilters);

      // If using typed configuration, also filter and notify about filtered fields
      if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
        const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

        onFilteredValueConfigChange(filteredFields);
      }
    },
    [
      filters,
      onFilterChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onFilteredValueConfigChange,
    ]
  );
  const handleExposedChange = useCallback(
    (checked: boolean) => {
      const newFilters = {
        ...filters,
        onlyExposed: checked,
      };

      onFilterChange(newFilters);

      // If using typed configuration, also filter and notify about filtered fields
      if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
        const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

        onFilteredValueConfigChange(filteredFields);
      }
    },
    [
      filters,
      onFilterChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onFilteredValueConfigChange,
    ]
  );

  // Método para limpar todos os filtros
  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      searchQuery: '',
      fieldType: null,
      onlyCustomized: false,
      onlyExposed: false,
    };

    onFilterChange(clearedFilters);

    // Se estiver usando a configuração tipada, notifica sobre a mudança
    if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
      const filteredFields = filterValueConfigurationFields(valueConfiguration, clearedFilters);

      onFilteredValueConfigChange(filteredFields);
    }
  }, [onFilterChange, useTypedValueConfiguration, valueConfiguration, onFilteredValueConfigChange]);

  // Método para filtrar rapidamente apenas campos customizados
  const handleQuickFilterCustomized = useCallback(() => {
    const newFilters = {
      ...filters,
      onlyCustomized: true,
      onlyExposed: false, // Resetamos esse filtro para não limitar demais
    };

    onFilterChange(newFilters);

    if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
      const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

      onFilteredValueConfigChange(filteredFields);
    }
  }, [
    filters,
    onFilterChange,
    useTypedValueConfiguration,
    valueConfiguration,
    onFilteredValueConfigChange,
  ]);

  // Método para filtrar rapidamente apenas campos complexos (objetos e arrays)
  const handleQuickFilterComplex = useCallback(() => {
    // Se já estiver filtrando por objetos, alterna para arrays
    // Se estiver filtrando por arrays, limpa o filtro de tipo
    // Se não estiver filtrando por tipo complexo, começa com objetos
    let newFieldType: string | null;

    if (filters.fieldType === 'object') {
      newFieldType = 'array';
    } else if (filters.fieldType === 'array') {
      newFieldType = null;
    } else {
      newFieldType = 'object';
    }

    const newFilters = {
      ...filters,
      fieldType: newFieldType,
    };

    onFilterChange(newFilters);

    if (useTypedValueConfiguration && valueConfiguration && onFilteredValueConfigChange) {
      const filteredFields = filterValueConfigurationFields(valueConfiguration, newFilters);

      onFilteredValueConfigChange(filteredFields);
    }
  }, [
    filters,
    onFilterChange,
    useTypedValueConfiguration,
    valueConfiguration,
    onFilteredValueConfigChange,
  ]);

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

      {/* Quick filters */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={`${compact ? 'h-8 text-xs' : ''} ${filters.onlyCustomized ? 'bg-primary/10 text-primary' : ''}`}
          onClick={handleQuickFilterCustomized}
          data-testid="quick-filter-customized"
        >
          <Tag className="mr-1 h-3.5 w-3.5" />
          {t('filters.quickFilters.customized')}
        </Button>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={`${compact ? 'h-8 text-xs' : ''} ${filters.fieldType === 'object' || filters.fieldType === 'array' ? 'bg-primary/10 text-primary' : ''}`}
          onClick={handleQuickFilterComplex}
          data-testid="quick-filter-complex"
        >
          <Filter className="mr-1 h-3.5 w-3.5" />
          {t('filters.quickFilters.complex')}
        </Button>
      </div>

      {/* Botão de limpar filtros - só aparece se algum filtro estiver ativo */}
      {(filters.searchQuery ||
        filters.fieldType ||
        filters.onlyCustomized ||
        filters.onlyExposed) && (
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={`${compact ? 'h-8 text-xs' : ''} text-muted-foreground hover:text-primary`}
          onClick={handleClearFilters}
          data-testid="clear-filters"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  );
};
