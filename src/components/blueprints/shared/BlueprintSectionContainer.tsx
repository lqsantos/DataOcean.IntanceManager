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
  const { sectionErrors } = useBlueprintSection(sectionId, {
    mode,
    sectionContent,
  });

  return (
    <Card className="p-6" data-testid={`section-content-${sectionId}`}>
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">{t(`sections.${sectionId}`, title)}</h2>
        {description && (
          <p className="text-muted-foreground">
            {t(`${sectionId}.sectionDescription`, description)}
          </p>
        )}
      </div>

      <div className={`${isSaving ? 'pointer-events-none opacity-60' : ''}`}>
        {/* Render custom section content if provided */}
        {sectionContent[sectionId] || children}

        {/* Display validation errors */}
        {sectionErrors.length > 0 && (
          <div className="mt-4 space-y-2" aria-live="polite">
            {sectionErrors.map((error, index) => (
              <div key={index} className="text-sm text-destructive" role="alert">
                {t(`validation.${error}`, error)}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
