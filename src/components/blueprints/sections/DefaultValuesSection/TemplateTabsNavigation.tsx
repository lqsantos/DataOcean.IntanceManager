/**
 * TemplateTabsNavigation component
 * Provides navigation between templates in the DefaultValuesSection
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateTabsNavigationProps {
  templates: Array<{ id: string; name: string; version: string }>;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateTabsNavigation: React.FC<TemplateTabsNavigationProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}) => {
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
        {templates.map((template) => (
          <TabsTrigger
            key={template.id}
            value={template.id}
            data-testid={`template-tab-${template.id}`}
            className="min-w-[120px] flex-shrink-0"
          >
            <span className="inline-block max-w-[150px] truncate">{template.name}</span>
            <span className="ml-1 text-xs text-muted-foreground">{template.version}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
