'use client';

import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { BlueprintChildTemplate } from '../../types';

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

  // Estado local para controlar o valor do input durante a edição
  const [editingIdentifiers, setEditingIdentifiers] = useState<Record<number, string>>({});

  // Manipular mudança no input
  const handleIdentifierChange = (index: number, value: string) => {
    setEditingIdentifiers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // Manipular quando o input perde o foco
  const handleIdentifierBlur = (index: number) => {
    const newIdentifier = editingIdentifiers[index];

    if (newIdentifier !== undefined) {
      onUpdateIdentifier(index, newIdentifier);
      // Limpar o estado de edição após atualizar
      setEditingIdentifiers((prev) => {
        const updated = { ...prev };

        delete updated[index];

        return updated;
      });
    }
  };

  // Manipular tecla Enter
  const handleIdentifierKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleIdentifierBlur(index);
    }
  };

  return (
    <div className="flex flex-col" data-testid="selected-templates">
      <div className="mb-3 flex h-8 items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{t('templatesStep.selection.title')}</h3>
          <Badge
            variant={selectedTemplates.length > 0 ? 'secondary' : 'outline'}
            className={`h-5 px-2 text-xs ${selectedTemplates.length === 0 ? 'border-primary text-primary' : ''}`}
          >
            {selectedTemplates.length > 0
              ? t('templatesStep.selection.count', { count: selectedTemplates.length })
              : t('templatesStep.selection.required')}
          </Badge>
        </div>
      </div>

      <Droppable droppableId="selected-templates">
        {(provided) => (
          <div
            className="flex-grow overflow-auto rounded-md border"
            style={{ height: '400px' }}
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid="selected-templates-list"
          >
            {selectedTemplates.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <div className="mb-4 h-16 w-16 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-primary">
                  {t('templatesStep.selection.requiredMessage')}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('templatesStep.selection.emptyHint')}
                </p>
                {/* The droppable needs placeholder even when empty */}
                {provided.placeholder}
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {selectedTemplates
                  .sort((a, b) => a.order - b.order)
                  .map((template, index) => (
                    <Draggable
                      key={`${template.identifier}-${index}`}
                      draggableId={`selected-${template.identifier}-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-md border p-3 ${
                            snapshot.isDragging ? 'border-primary bg-accent opacity-90' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                                {template.order}
                              </span>
                              <div>
                                <h4 className="text-sm font-medium">
                                  {getTemplateName(template.templateId)}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {t('templatesStep.selection.identifierLabel')}:{' '}
                                  <span className="font-medium">{template.identifier}</span>
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveTemplate(index)}
                              className="h-7 w-7"
                              data-testid={`remove-template-${index}`}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">
                                {t('templatesStep.selection.removeButton')}
                              </span>
                            </Button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div>
                              <label className="text-xs font-medium">
                                {t('templatesStep.selection.identifierLabel')}
                              </label>
                              <Input
                                value={
                                  editingIdentifiers[index] !== undefined
                                    ? editingIdentifiers[index]
                                    : template.identifier
                                }
                                onChange={(e) => handleIdentifierChange(index, e.target.value)}
                                onBlur={() => handleIdentifierBlur(index)}
                                onKeyDown={(e) => handleIdentifierKeyDown(index, e)}
                                className="mt-1 h-7 text-xs"
                                placeholder={t('templatesStep.selection.identifierPlaceholder')}
                                data-testid={`template-identifier-${index}`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
