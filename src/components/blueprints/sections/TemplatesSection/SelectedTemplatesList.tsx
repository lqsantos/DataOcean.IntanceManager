'use client';

import { Draggable, Droppable } from '@hello-pangea/dnd';
import { GripVertical, Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BlueprintChildTemplate } from '@/types/blueprint';

interface SelectedTemplatesListProps {
  /** Selected templates */
  selectedTemplates: BlueprintChildTemplate[];
  /** Remove template from selection */
  onRemoveTemplate: (index: number) => void;
  /** Update template identifier */
  onUpdateIdentifier: (index: number, identifier: string) => boolean;
  /** Get template name from ID */
  getTemplateName: (id: string) => string;
}

/**
 * Component to display and manage selected templates
 */
export function SelectedTemplatesList({
  selectedTemplates,
  onRemoveTemplate,
  onUpdateIdentifier,
  getTemplateName,
}: SelectedTemplatesListProps) {
  const { t } = useTranslation(['blueprints']);

  // Local state for editing identifiers
  const [editingIdentifiers, setEditingIdentifiers] = useState<Record<number, string>>({});
  const [identifierErrors, setIdentifierErrors] = useState<Record<number, string>>({});

  // Handle identifier change
  const handleIdentifierChange = (index: number, value: string) => {
    setEditingIdentifiers((prev) => ({
      ...prev,
      [index]: value,
    }));

    // Clear error when user types
    if (identifierErrors[index]) {
      setIdentifierErrors((prev) => ({
        ...prev,
        [index]: '',
      }));
    }
  };

  // Handle identifier blur (update on lose focus)
  const handleIdentifierBlur = (index: number) => {
    const newIdentifier = editingIdentifiers[index];

    if (newIdentifier) {
      const success = onUpdateIdentifier(index, newIdentifier);

      if (!success) {
        setIdentifierErrors((prev) => ({
          ...prev,
          [index]: t('templatesStep.selection.identifierLabel', 'Identifier is already in use'),
        }));
      } else {
        setIdentifierErrors((prev) => ({
          ...prev,
          [index]: '',
        }));
      }
    }
  };

  // Handle identifier focus (store current value)
  const handleIdentifierFocus = (index: number, currentIdentifier: string) => {
    setEditingIdentifiers((prev) => ({
      ...prev,
      [index]: currentIdentifier,
    }));
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('templatesStep.selection.title')}</h3>
          <div className="text-sm text-muted-foreground">
            {selectedTemplates.length > 0
              ? t('templatesStep.selection.count', { count: selectedTemplates.length })
              : t('templatesStep.selection.required')}
          </div>
        </div>
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <Droppable droppableId="selected-templates">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full min-h-0 flex-col"
            >
              <ScrollArea className="h-full flex-1 overflow-visible" type="always">
                <div className="w-full space-y-1 p-4">
                  {selectedTemplates.length === 0 ? (
                    <div className="flex h-20 flex-col items-center justify-center space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {t('templatesStep.selection.requiredMessage')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('templatesStep.selection.emptyHint')}
                      </p>
                    </div>
                  ) : (
                    selectedTemplates.map((template, index) => (
                      <Draggable
                        key={`selected-${template.templateId}-${index}`}
                        draggableId={`selected-${template.templateId}-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-2 rounded-lg border p-3 ${
                              snapshot.isDragging ? 'border-primary bg-primary/5' : 'border-border'
                            } relative w-full max-w-full break-inside-avoid space-y-2 overflow-hidden`}
                            data-testid={`selected-template-${index}`}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex items-center gap-2"
                                {...provided.dragHandleProps}
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {getTemplateName(template.templateId)}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>{t('templatesStep.selection.identifierLabel')}: </span>
                                    <Badge variant="outline">{template.identifier}</Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => onRemoveTemplate(index)}
                                data-testid={`remove-template-${index}`}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                                <span className="sr-only">
                                  {t('templatesStep.selection.removeButton')}
                                </span>
                              </Button>
                            </div>

                            <div>
                              <label
                                htmlFor={`template-identifier-${index}`}
                                className="mb-1 block text-xs font-medium"
                              >
                                {t('templatesStep.selection.identifierLabel')}
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={`template-identifier-${index}`}
                                  className={`h-8 flex-1 text-sm ${
                                    identifierErrors[index] ? 'border-destructive' : ''
                                  }`}
                                  value={
                                    editingIdentifiers[index] !== undefined
                                      ? editingIdentifiers[index]
                                      : template.identifier
                                  }
                                  placeholder={t('templatesStep.selection.identifierPlaceholder')}
                                  onChange={(e) => handleIdentifierChange(index, e.target.value)}
                                  onBlur={() => handleIdentifierBlur(index)}
                                  onFocus={() => handleIdentifierFocus(index, template.identifier)}
                                  data-testid={`template-identifier-${index}`}
                                />
                              </div>
                              {identifierErrors[index] && (
                                <p className="mt-1 text-xs text-destructive">
                                  {identifierErrors[index]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
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
