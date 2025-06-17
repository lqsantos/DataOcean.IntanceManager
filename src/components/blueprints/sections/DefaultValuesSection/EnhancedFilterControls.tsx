/**
 * EnhancedFilterControls Component
 * Filter controls for the table view with support for ValueConfiguration
 * Simplified to focus on name search, exposed and overridable fields
 */

import { ChevronDown, ChevronUp, Code, Eye, Pencil, Search, X } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
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

  // Log de alterações nos filtros sem causar loops
  // Usar uma ref para reduzir o número de logs e evitar efeitos colaterais
  // Comentado para evitar loops de renderização
  // const prevFiltersRef = React.useRef(currentFilters);

  // Ref para rastrear o timer de debounce
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /* useEffect(() => {
    // Só logar se realmente mudou (comparação mais profunda)
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)) {
      console.warn('[EnhancedFilterControls] currentFilters atualizados:', currentFilters);
      prevFiltersRef.current = currentFilters;
    }
  }, [currentFilters]); */

  // Limpar timers quando o componente é desmontado
  useEffect(() => {
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
        // console.warn(`[EnhancedFilterControls] Filtro ${key} não mudou, ignorando`);

        return;
      }

      const newFilters = {
        ...currentFilters,
        [key]: value,
      };

      // console.warn(`[EnhancedFilterControls] Alterando filtro ${key} para:`, value);

      // Aplicar o filtro via callback
      onFilterChange(newFilters);
    },
    [currentFilters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    // console.warn('[EnhancedFilterControls] Limpando todos os filtros manualmente');
    // Limpar os filtros
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;

      // console.warn('[EnhancedFilterControls] Alterando texto de busca para:', searchValue);

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
      // console.warn(`[EnhancedFilterControls] Toggle 'exposed' to: ${value}`);
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        handleFilterChange('exposed', value);
      }, 0);
    },
    [handleFilterChange]
  );

  const handleOverridableToggle = useCallback(
    (value: boolean) => {
      // console.warn(`[EnhancedFilterControls] Toggle 'overridable' to: ${value}`);
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        handleFilterChange('overridable', value);
      }, 0);
    },
    [handleFilterChange]
  );

  const handleCustomizedToggle = useCallback(
    (value: boolean) => {
      // console.warn(`[EnhancedFilterControls] Toggle 'customized' to: ${value}`);
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        handleFilterChange('customized', value);
      }, 0);
    },
    [handleFilterChange]
  );

  // Button click handlers
  const handleClearButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // console.warn('[EnhancedFilterControls] Botão Limpar Filtros clicado');
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        handleClearFilters();
      }, 0);
    },
    [handleClearFilters]
  );

  const handleExpandAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // console.warn('[EnhancedFilterControls] Expandindo todos os campos');
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        if (onExpandAllFields) {
          onExpandAllFields();
        }
      }, 0);
    },
    [onExpandAllFields]
  );

  const handleCollapseAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // console.warn('[EnhancedFilterControls] Colapsando todos os campos');
      // Usa setTimeout para evitar loops de renderização
      setTimeout(() => {
        if (onCollapseAllFields) {
          onCollapseAllFields();
        }
      }, 0);
    },
    [onCollapseAllFields]
  );

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('filters.search.nestedFieldsPlaceholder')}
            value={currentFilters.fieldName}
            onChange={handleSearchChange}
            data-testid="field-name-search-input"
          />
        </div>

        <Toggle
          pressed={currentFilters.exposed}
          onPressedChange={handleExposedToggle}
          aria-label={t('values.table.exposed')}
          title={t('filters.onlyExposed')}
          data-testid="exposed-filter-toggle"
        >
          <Eye className="mr-2 h-4 w-4" />
          {t('values.table.exposed')}
        </Toggle>

        <Toggle
          pressed={currentFilters.overridable}
          onPressedChange={handleOverridableToggle}
          aria-label={t('values.table.overridable')}
          title={t('values.table.overridable')}
          data-testid="overridable-filter-toggle"
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('values.table.overridable')}
        </Toggle>

        <Toggle
          pressed={currentFilters.customized}
          onPressedChange={handleCustomizedToggle}
          aria-label={t('filters.onlyCustomized')}
          title={t('filters.onlyCustomized')}
          data-testid="customized-filter-toggle"
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
            onClick={handleClearButtonClick}
            title={t('filters.clear')}
            data-testid="clear-filters-button"
          >
            <X className="mr-2 h-4 w-4" />
            {t('filters.clear')}
          </Button>
        )}

        {/* Botões de Expandir/Colapsar todos os campos */}
        <div className="ml-auto flex gap-2">
          {onExpandAllFields && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAllClick}
              title={t('filters.expandAll')}
              data-testid="expand-all-button"
            >
              <ChevronDown className="mr-2 h-4 w-4" />
              {t('filters.expandAll')}
            </Button>
          )}

          {onCollapseAllFields && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAllClick}
              title={t('filters.collapseAll')}
              data-testid="collapse-all-button"
            >
              <ChevronUp className="mr-2 h-4 w-4" />
              {t('filters.collapseAll')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
