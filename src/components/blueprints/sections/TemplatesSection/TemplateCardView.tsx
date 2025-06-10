'use client';

import { Pencil, PlusCircle, Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BlueprintChildTemplate, CatalogTemplate } from '@/types/blueprint';

interface TemplateCardViewProps {
  /** All available templates */
  templates: CatalogTemplate[];
  /** Loading state */
  isLoading: boolean;
  /** Selected templates */
  selectedTemplates: BlueprintChildTemplate[];
  /** Add template */
  onAddTemplate: (template: CatalogTemplate) => void;
  /** Remove template */
  onRemoveTemplate: (index: number) => void;
  /** Update identifier */
  onUpdateIdentifier: (index: number, identifier: string) => boolean;
}

/**
 * Card-based view for templates with categorized tabs
 */
export function TemplateCardView({
  templates,
  isLoading,
  selectedTemplates,
  onAddTemplate,
  onRemoveTemplate,
  onUpdateIdentifier,
}: TemplateCardViewProps) {
  const { t } = useTranslation(['blueprints']);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    index: number;
    identifier: string;
  } | null>(null);
  const [identifierError, setIdentifierError] = useState('');

  // Get all categories
  const allCategories = Array.from(
    new Set(templates.filter((t) => t.category).map((t) => t.category as string))
  ).sort();

  // Map of templateId -> template objects
  const templateMap = templates.reduce(
    (acc, template) => {
      acc[template.id] = template;

      return acc;
    },
    {} as Record<string, CatalogTemplate>
  );

  // Filter templates by search query and create map by category
  const categorizedTemplates: Record<string, CatalogTemplate[]> = {};
  const selectedTemplateIds = selectedTemplates.map((t) => t.templateId);

  // Create "All" category
  categorizedTemplates['all'] = templates.filter((template) => {
    if (!template.isActive) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const searchLower = searchQuery.toLowerCase();

    return (
      template.name.toLowerCase().includes(searchLower) ||
      (template.description || '').toLowerCase().includes(searchLower)
    );
  });

  // Create category groups
  allCategories.forEach((category) => {
    categorizedTemplates[category] = categorizedTemplates['all'].filter(
      (t) => t.category === category
    );
  });

  // Add "Uncategorized" group for templates without category
  categorizedTemplates['uncategorized'] = categorizedTemplates['all'].filter((t) => !t.category);

  // Handle identifier update
  const handleUpdateIdentifier = () => {
    if (!editingTemplate) {
      return;
    }

    const { index, identifier } = editingTemplate;
    const success = onUpdateIdentifier(index, identifier);

    if (success) {
      setDialogOpen(false);
      setEditingTemplate(null);
      setIdentifierError('');
    } else {
      setIdentifierError(t('templatesStep.selection.identifierError'));
    }
  };

  // Open edit dialog
  const openEditDialog = (index: number, currentIdentifier: string) => {
    setEditingTemplate({ index, identifier: currentIdentifier });
    setDialogOpen(true);
    setIdentifierError('');
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Input
          placeholder={t('templatesStep.catalog.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
          data-testid="template-card-search"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-10 px-3"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">
              {t('templatesStep.selection.title')} ({selectedTemplates.length})
            </h3>
          </CardHeader>
          <CardContent className="p-2">
            {selectedTemplates.length === 0 ? (
              <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                {t('templatesStep.selection.emptyHint')}
              </div>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedTemplates.map((template, index) => {
                    const originalTemplate = templateMap[template.templateId];

                    return (
                      <Card key={index} className="border shadow-sm">
                        <div className="space-y-1 p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium">
                                {originalTemplate?.name || 'Unknown Template'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {template.identifier}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => openEditDialog(index, template.identifier)}
                                data-testid={`edit-template-${index}`}
                              >
                                <Pencil className="h-3 w-3" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => onRemoveTemplate(index)}
                                data-testid={`remove-card-template-${index}`}
                              >
                                <Trash className="h-3 w-3" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="all">
            {t('templatesStep.catalog.allTemplates')} ({categorizedTemplates['all']?.length || 0})
          </TabsTrigger>
          {allCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category} ({categorizedTemplates[category]?.length || 0})
            </TabsTrigger>
          ))}
          {categorizedTemplates['uncategorized']?.length > 0 && (
            <TabsTrigger value="uncategorized">
              {t('templatesStep.catalog.uncategorized')} (
              {categorizedTemplates['uncategorized']?.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {categorizedTemplates['all']?.map((template) => {
              const isAlreadySelected = selectedTemplateIds.includes(template.id);

              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={isAlreadySelected}
                  onAdd={onAddTemplate}
                />
              );
            })}
          </div>
        </TabsContent>

        {allCategories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categorizedTemplates[category]?.map((template) => {
                const isAlreadySelected = selectedTemplateIds.includes(template.id);

                return (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={isAlreadySelected}
                    onAdd={onAddTemplate}
                  />
                );
              })}
            </div>
          </TabsContent>
        ))}

        {categorizedTemplates['uncategorized']?.length > 0 && (
          <TabsContent value="uncategorized" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categorizedTemplates['uncategorized']?.map((template) => {
                const isAlreadySelected = selectedTemplateIds.includes(template.id);

                return (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={isAlreadySelected}
                    onAdd={onAddTemplate}
                  />
                );
              })}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templatesStep.selection.editIdentifier')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="identifier-input">{t('templatesStep.selection.identifierLabel')}</Label>
            <Input
              id="identifier-input"
              value={editingTemplate?.identifier || ''}
              onChange={(e) =>
                setEditingTemplate((prev) =>
                  prev ? { ...prev, identifier: e.target.value } : null
                )
              }
              className={identifierError ? 'border-destructive' : ''}
              autoFocus
            />
            {identifierError && <p className="mt-1 text-xs text-destructive">{identifierError}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              {t('templatesStep.selection.identifierDescription')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateIdentifier}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for individual template cards
interface TemplateCardProps {
  template: CatalogTemplate;
  isSelected: boolean;
  onAdd: (template: CatalogTemplate) => void;
}

function TemplateCard({ template, isSelected, onAdd }: TemplateCardProps) {
  const { t } = useTranslation(['blueprints']);

  return (
    <Card
      className={`border transition-colors ${
        isSelected ? 'border-muted opacity-60' : 'hover:border-primary/50'
      }`}
      data-testid={`template-card-${template.id}`}
    >
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{template.name}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-1">
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
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            disabled={isSelected}
            onClick={() => onAdd(template)}
            data-testid={`add-card-template-${template.id}`}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">{t('templatesStep.catalog.add')}</span>
          </Button>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.description || t('templatesStep.catalog.noDescription')}
        </p>
      </div>
    </Card>
  );
}
