'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { BlueprintVariable } from '../../types';

import { VariableCard } from './variable-card';

interface VariableListProps {
  /** Variables array */
  variables: BlueprintVariable[];
  /** Remove variable callback */
  onRemoveVariable: (index: number) => void;
  /** Update variable callback */
  onUpdateVariable: (index: number, field: string, value: string) => void;
  /** Check if variable name is duplicate */
  isVariableNameDuplicate: (name: string, currentIndex: number) => boolean;
}

/**
 * Component to display the list of variables
 */
export function VariableList({
  variables,
  onRemoveVariable,
  onUpdateVariable,
  isVariableNameDuplicate,
}: VariableListProps) {
  // State to track which variable is expanded
  const [expandedVariable, setExpandedVariable] = useState<number | null>(null);

  // Toggle expanded state
  const toggleExpanded = (index: number) => {
    setExpandedVariable(expandedVariable === index ? null : index);
  };

  // Check if a name is duplicate
  const isNameDuplicate = (name: string, index: number) => {
    return isVariableNameDuplicate(name, index);
  };

  if (variables.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
            <div className="mb-3 h-12 w-12 text-muted-foreground">
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma variável global definida
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Clique em "Adicionar Variável" para criar uma variável que poderá ser usada em todos
              os templates.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ScrollArea className="max-h-[500px] pr-2">
          <div className="space-y-4">
            {variables.map((variable, index) => (
              <VariableCard
                key={`${variable.name}-${index}`}
                variable={variable}
                index={index}
                isExpanded={expandedVariable === index}
                toggleExpanded={() => toggleExpanded(index)}
                onRemove={() => onRemoveVariable(index)}
                onUpdate={(field, value) => onUpdateVariable(index, field as string, value)}
                isNameDuplicate={(name) => isNameDuplicate(name, index)}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-end">
          <div className="mr-4 pt-2 text-sm text-muted-foreground">
            {variables.length} variável(is) configurada(s)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
