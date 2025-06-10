'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BlueprintSectionContent } from '@/contexts/blueprint-form-context';
import { type SectionId } from '@/hooks/blueprint';
import { useBlueprintSection } from '@/hooks/blueprint/use-blueprint-section';

interface BlueprintSectionContainerProps {
  sectionId: SectionId;
  title: string;
  description?: string;
  children: React.ReactNode;
  isSaving?: boolean;
  mode: 'create' | 'edit';
  sectionContent?: Partial<BlueprintSectionContent>;
}

/**
 * BlueprintSectionContainer - Container component for blueprint section content
 * Provides consistent layout and styling for each section
 *
 * @example
 * <BlueprintSectionContainer
 *   sectionId="metadata"
 *   title="Blueprint Metadata"
 *   description="Define the basic information about your blueprint"
 * >
 *   <MetadataForm values={formValues} onChange={handleChange} />
 * </BlueprintSectionContainer>
 */
export function BlueprintSectionContainer({
  sectionId,
  title,
  description,
  children,
  isSaving = false,
  mode,
  sectionContent = {},
}: BlueprintSectionContainerProps) {
  const { t } = useTranslation(['blueprints']);

  // Use the section hook to get form state and validation
  // Não estamos mais exibindo os erros genéricos no rodapé da seção
  const { sectionErrors: _sectionErrors } = useBlueprintSection(sectionId, {
    mode,
    sectionContent,
  });

  return (
    <Card
      className="flex h-[calc(100vh-170px)] flex-col p-6"
      data-testid={`section-content-${sectionId}`}
    >
      <div className="mb-4 flex-shrink-0">
        <h2 className="mb-1 text-xl font-semibold">{t(`sections.${sectionId}`, title)}</h2>
        {description && (
          <p className="text-muted-foreground">
            {t(`${sectionId}.sectionDescription`, description)}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className={`${isSaving ? 'pointer-events-none opacity-60' : ''}`}>
          {/* Render custom section content if provided */}
          {sectionContent[sectionId] || children}
        </div>
      </ScrollArea>
    </Card>
  );
}
