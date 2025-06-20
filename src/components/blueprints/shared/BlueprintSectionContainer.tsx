'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
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
      className="flex h-full flex-col overflow-hidden"
      data-testid={`section-content-${sectionId}`}
    >
      <div
        className={`flex h-full flex-col overflow-hidden border-b ${isSaving ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="mx-5 my-2 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h2 className="font-semibold">{t(`sections.${sectionId}`, title)}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">
                {t(`${sectionId}.sectionDescription`, description)}
              </p>
            )}
          </div>
          <div className="mt-2 border-b shadow-lg" />
        </div>

        <div className="mx-5 mb-2 mt-5 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          {/* Render custom section content if provided */}
          <div className="h-full flex-1 overflow-hidden">
            {sectionContent[sectionId] || children}
          </div>
        </div>
      </div>
    </Card>
  );
}
