/**
 * EnhancedFilterControls Component
 * Filter controls for the table view with support for ValueConfiguration
 * Simplified to focus on name search, exposed and overridable fields
 */

import { ChevronDown, ChevronUp, Code, Eye, Pencil, Search, X } from 'lucide-react';
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
  onExpandAllFields?: () => void;
  onCollapseAllFields?: () => void;
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
  onExpandAllFields,
  onCollapseAllFields,
}: EnhancedFilterControlsProps) {
  const { t } = useTranslation('blueprints');

  // Local search input state for immediate feedback
  const [searchInputValue, setSearchInputValue] = React.useState(currentFilters.fieldName);

  // Ref para rastrear o timer de debounce
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync local search state with external filter state
  React.useEffect(() => {
    setSearchInputValue(currentFilters.fieldName);
  }, [currentFilters.fieldName]);

  // Limpar timers quando o componente é desmontado
  React.useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

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

      // Aplicar o filtro via callback
      onFilterChange(newFilters);
    },
    [currentFilters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    // Clear local search state
    setSearchInputValue('');

    // Limpar os filtros
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;

      // Update local state immediately for UI feedback
      setSearchInputValue(searchValue);

      // Limpa o timer anterior se existir
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      // Define um novo timer para debounce (espera curta para melhorar a experiência)
      searchTimerRef.current = setTimeout(() => {
        handleFilterChange('fieldName', searchValue);
      }, 150); // 150ms é um bom compromisso entre responsividade e performance
    },
    [handleFilterChange]
  );

  // Event handlers for toggle buttons
  const handleExposedToggle = useCallback(
    (value: boolean) => {
      handleFilterChange('exposed', value);
    },
    [handleFilterChange]
  );

  const handleOverridableToggle = useCallback(
    (value: boolean) => {
      handleFilterChange('overridable', value);
    },
    [handleFilterChange]
  );

  const handleCustomizedToggle = useCallback(
    (value: boolean) => {
      handleFilterChange('customized', value);
    },
    [handleFilterChange]
  );

  // Button click handlers
  const handleClearButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleClearFilters();
    },
    [handleClearFilters]
  );

  const handleExpandAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (onExpandAllFields) {
        onExpandAllFields();
      }
    },
    [onExpandAllFields]
  );

  const handleCollapseAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (onCollapseAllFields) {
        onCollapseAllFields();
      }
    },
    [onCollapseAllFields]
  );

  return (
    <div className="mb-4 space-y-3">
      {/* Linha principal de filtros */}
      <div className="flex items-center gap-3">
        {/* Campo de busca */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-4"
            placeholder={t('filters.search.nestedFieldsPlaceholder')}
            value={searchInputValue}
            onChange={handleSearchChange}
            data-testid="field-name-search-input"
          />
        </div>

        {/* Separador visual */}
        <div className="h-6 w-px bg-border" />

        {/* Filtros de toggle */}
        <div className="flex items-center gap-2 rounded-md border bg-background p-1">
          <span className="text-xs font-medium text-muted-foreground">
            {t('filters.filterBy')}:
          </span>

          <Toggle
            pressed={currentFilters.exposed}
            onPressedChange={handleExposedToggle}
            aria-label={t('filters.labels.exposed')}
            title={t('filters.tooltips.exposed')}
            data-testid="exposed-filter-toggle"
            className="h-8 px-2 text-xs"
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            {t('filters.labels.exposed')}
          </Toggle>

          <Toggle
            pressed={currentFilters.overridable}
            onPressedChange={handleOverridableToggle}
            aria-label={t('filters.labels.overridable')}
            title={t('filters.tooltips.overridable')}
            data-testid="overridable-filter-toggle"
            className="h-8 px-2 text-xs"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            {t('filters.labels.overridable')}
          </Toggle>

          <Toggle
            pressed={currentFilters.customized}
            onPressedChange={handleCustomizedToggle}
            aria-label={t('filters.labels.customized')}
            title={t('filters.tooltips.customized')}
            data-testid="customized-filter-toggle"
            className="h-8 px-2 text-xs"
          >
            <Code className="mr-1 h-3.5 w-3.5" />
            {t('filters.labels.customized')}
          </Toggle>
        </div>

        {/* Botão de limpar filtros */}
        {(currentFilters.fieldName ||
          currentFilters.exposed ||
          currentFilters.overridable ||
          currentFilters.customized) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearButtonClick}
            title={t('filters.clear')}
            data-testid="clear-filters-button"
            className="gap-1 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            {t('filters.clear')}
          </Button>
        )}

        {/* Controles da árvore */}
        <div className="ml-auto flex items-center gap-1 rounded-md border bg-background p-1">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            {t('filters.treeActions.label')}
          </span>

          {onExpandAllFields && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandAllClick}
              title={t('filters.treeActions.expandAllTooltip')}
              data-testid="expand-all-button"
              className="h-8 gap-1 px-2 text-xs hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              {t('filters.treeActions.expandAll')}
            </Button>
          )}

          {onCollapseAllFields && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseAllClick}
              title={t('filters.treeActions.collapseAllTooltip')}
              data-testid="collapse-all-button"
              className="h-8 gap-1 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              {t('filters.treeActions.collapseAll')}
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {(currentFilters.exposed || currentFilters.overridable || currentFilters.customized) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t('filters.activeFilters')}:</span>
          {currentFilters.exposed && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
              {t('filters.labels.exposed')}
            </span>
          )}
          {currentFilters.overridable && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
              {t('filters.labels.overridable')}
            </span>
          )}
          {currentFilters.customized && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
              {t('filters.labels.customized')}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
