'use client';

import { useTranslation } from 'react-i18next';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SectionId = 'metadata' | 'templates' | 'variables' | 'defaults' | 'preview';

interface BlueprintSectionNavigationProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  checkAccess?: (section: SectionId) => boolean;
  sectionsWithErrors?: SectionId[];
}

const sections: Array<{ id: SectionId }> = [
  { id: 'metadata' },
  { id: 'templates' },
  { id: 'variables' },
  { id: 'defaults' },
  { id: 'preview' },
];

/**
 * BlueprintSectionNavigation - Navigation component for blueprint creation/edit workflow
 * Displays tabs for each section and allows switching between them with validation
 */
export function BlueprintSectionNavigation({
  activeSection,
  onSectionChange,
  checkAccess: _checkAccess, // Adicionado underscore para evitar erro de lint
  sectionsWithErrors = [],
}: BlueprintSectionNavigationProps) {
  const { t } = useTranslation(['blueprints']);

  // Handle section change - sempre permite navegação livre para qualquer seção
  function handleSectionChange(section: string) {
    onSectionChange(section as SectionId);
  }

  return (
    <TooltipProvider>
      <Tabs value={activeSection} onValueChange={handleSectionChange}>
        <TabsList className="grid w-full grid-cols-5">
          {sections.map((section) => {
            // Nunca desabilitar nenhuma aba, permitindo navegação livre entre todas as seções
            const isDisabled = false;
            const isActive = section.id === activeSection;
            const hasErrors = sectionsWithErrors.includes(section.id);

            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={section.id}
                    disabled={isDisabled}
                    data-state={isActive ? 'active' : undefined}
                    data-testid={`section-nav-${section.id}`}
                    data-error={hasErrors ? 'true' : undefined}
                    className={`relative ${hasErrors ? 'text-destructive' : ''}`}
                  >
                    {t(
                      section.id === 'metadata' ? 'sections.basicInfo' : `sections.${section.id}`,
                      {
                        defaultValue: section.id === 'metadata' ? 'Basic Information' : section.id,
                      }
                    )}
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t(getSectionDescription(section.id), {
                      defaultValue:
                        section.id === 'metadata' ? 'Basic Information' : `${section.id} Section`,
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TabsList>
      </Tabs>
    </TooltipProvider>
  );
}

function getSectionDescription(id: SectionId): string {
  return id === 'metadata' ? 'sections.basicInfo_description' : `sections.${id}_description`;
}
