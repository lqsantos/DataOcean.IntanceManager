'use client';

import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Trash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { BlueprintChildTemplate } from '../../types';

interface SelectedTemplatesListProps {
  /** Selected templates */
  selectedTemplates: BlueprintChildTemplate[];
  /** Remove template from selection */
  onRemoveTemplate: (index: number) => void;
  /** Update template identifier */
  onUpdateIdentifier: (index: number, identifier: string) => boolean;
  /** Update template overrides */
  onUpdateOverrides: (index: number, overrides: string) => void;
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
  onUpdateOverrides,
  getTemplateName,
}: SelectedTemplatesListProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex h-8 items-center justify-end">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Templates no Blueprint</h3>
          {selectedTemplates.length > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {selectedTemplates.length}
            </Badge>
          )}
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
                <div className="mb-4 h-16 w-16 text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">Nenhum template selecionado</p>
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
                                  Identificador:{' '}
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
                              <span className="sr-only">Remover</span>
                            </Button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div>
                              <label className="text-xs font-medium">Identificador</label>
                              <Input
                                value={template.identifier}
                                onChange={(e) => {
                                  onUpdateIdentifier(index, e.target.value);
                                }}
                                className="mt-1 h-7 text-xs"
                                placeholder="identificador-do-template"
                                data-testid={`template-identifier-${index}`}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium">
                                Valores de Substituição (opcional)
                              </label>
                              <Textarea
                                value={template.overrideValues || ''}
                                onChange={(e) => onUpdateOverrides(index, e.target.value)}
                                className="mt-1 font-mono text-xs"
                                placeholder='{ "key": "value" }'
                                rows={3}
                                data-testid={`template-overrides-${index}`}
                              />
                              <p className="mt-1 text-xs text-muted-foreground">
                                Valores em formato JSON que substituirão os padrões do template.
                              </p>
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
