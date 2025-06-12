/**
 * TemplateTabsNavigation component
 * Provides navigation between templates in the DefaultValuesSection
 */

import { AlertCircle, AlertTriangle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TemplateTabsNavigationProps {
  templates: Array<{ id: string; name: string; version: string }>;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  validationState?: Record<
    string,
    {
      hasErrors: boolean;
      hasWarnings: boolean;
    }
  >;
}

export const TemplateTabsNavigation: React.FC<TemplateTabsNavigationProps> = React.memo(
  ({ templates, selectedTemplateId, onSelectTemplate, validationState = {} }) => {
    const { t } = useTranslation(['blueprints']);

    if (!templates || templates.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground" data-testid="template-tabs-empty">
          {t('values.noTemplates')}
        </div>
      );
    }

    return (
      <Tabs
        value={selectedTemplateId}
        onValueChange={onSelectTemplate}
        className="w-full"
        data-testid="template-tabs-navigation"
      >
        <TabsList className="w-full overflow-x-auto">
          {templates.map((template) => {
            const validationInfo = validationState[template.id];
            const hasErrors = validationInfo?.hasErrors;
            const hasWarnings = validationInfo?.hasWarnings;

            return (
              <TabsTrigger
                key={template.id}
                value={template.id}
                data-testid={`template-tab-${template.id}`}
                className={cn(
                  'flex min-w-[120px] flex-shrink-0 items-center gap-1',
                  hasErrors && 'text-red-600 dark:text-red-400'
                )}
              >
                {hasErrors && (
                  <span title={t('values.validationMessages.templateHasErrors')}>
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </span>
                )}
                {!hasErrors && hasWarnings && (
                  <span title={t('values.validationMessages.templateHasWarnings')}>
                    <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </span>
                )}
                <span
                  className={cn(
                    'inline-block max-w-[150px] truncate',
                    hasErrors && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {template.name}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">{template.version}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  }
);

// Add display name to the memoized component
TemplateTabsNavigation.displayName = 'TemplateTabsNavigation';
