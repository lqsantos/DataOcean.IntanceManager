'use client';

import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Loader2, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Template } from '@/types/template';

// Tipo utilizado para representar um template no catálogo
type CatalogTemplate = Template & {
  version?: string;
};

interface TemplateCatalogProps {
  /** Templates to display */
  templates: CatalogTemplate[];
  /** Loading state */
  isLoading: boolean;
  /** Add template to selection */
  onAddTemplate: (template: CatalogTemplate) => void;
  /** List of template IDs that are already selected */
  selectedTemplateIds: string[];
}

/**
 * Component to display available templates with search and filtering
 */
export function TemplateCatalog({
  templates,
  isLoading,
  onAddTemplate,
  selectedTemplateIds,
}: TemplateCatalogProps) {
  const { t } = useTranslation(['blueprints']);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from templates
  const categories = Array.from(
    new Set(templates.filter((t) => t.category).map((t) => t.category as string))
  ).sort();

  // Filter templates based on search and category
  const filteredTemplates = templates
    .filter((template) => template.isActive)
    .filter((template) => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = template.name.toLowerCase().includes(searchLower);
        const descMatch = (template.description || '').toLowerCase().includes(searchLower);

        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      // Filter by category
      if (selectedCategory && template.category !== selectedCategory) {
        return false;
      }

      return true;
    });

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('templatesStep.catalog.title')}</h3>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('templatesStep.catalog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
              data-testid="template-search-input"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Button
                variant={!selectedCategory ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                {t('templatesStep.catalog.allCategories', 'All Categories')}
              </Button>

              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <Droppable droppableId="template-catalog" isDropDisabled={true}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full min-h-0 flex-col"
            >
              <ScrollArea className="h-full flex-1 overflow-visible" type="always">
                <div className="w-full space-y-1 p-4">
                  {isLoading && (
                    <div className="flex h-20 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">{t('templatesStep.catalog.loading')}</span>
                    </div>
                  )}
                  {!isLoading && filteredTemplates.length === 0 && (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? t('templatesStep.catalog.noResults')
                          : t('templatesStep.catalog.empty', 'No templates available')}
                      </p>
                    </div>
                  )}
                  {!isLoading &&
                    filteredTemplates.length > 0 &&
                    filteredTemplates.map((template, index) => {
                      const isAlreadySelected = selectedTemplateIds.includes(template.id);

                      return (
                        <Draggable
                          key={template.id}
                          draggableId={template.id}
                          index={index}
                          isDragDisabled={isAlreadySelected}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-lg border p-3 ${
                                snapshot.isDragging
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              } ${isAlreadySelected ? 'opacity-60' : 'hover:border-primary/50'} mb-2 w-full max-w-full break-inside-avoid overflow-hidden`}
                              data-testid={`catalog-template-${template.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{template.name}</h4>
                                    {template.version && (
                                      <Badge variant="outline" className="text-xs">
                                        v{template.version}
                                      </Badge>
                                    )}
                                    {template.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {template.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {template.description ||
                                      t('templatesStep.catalog.noDescription')}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  disabled={isAlreadySelected}
                                  onClick={() => onAddTemplate(template)}
                                  data-testid={`add-template-${template.id}`}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t('templatesStep.catalog.add', 'Add template')}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  <div className="min-h-4">{provided.placeholder}</div>
                </div>
              </ScrollArea>
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
}
