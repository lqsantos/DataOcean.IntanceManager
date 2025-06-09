'use client';

import { useTranslation } from 'react-i18next';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SectionId = 'metadata' | 'templates' | 'variables' | 'defaults' | 'preview';

interface BlueprintSectionNavigationProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  checkAccess?: (section: SectionId) => boolean;
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
  checkAccess,
}: BlueprintSectionNavigationProps) {
  const { t } = useTranslation(['blueprints']);

  // Handle section change
  function handleSectionChange(section: string) {
    if (!checkAccess || checkAccess(section as SectionId)) {
      onSectionChange(section as SectionId);
    }
  }

  return (
    <TooltipProvider>
      <Tabs value={activeSection} onValueChange={handleSectionChange}>
        <TabsList className="grid w-full grid-cols-5">
          {sections.map((section) => {
            const isDisabled = checkAccess ? !checkAccess(section.id) : false;
            const isActive = section.id === activeSection;

            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={section.id}
                    disabled={isDisabled}
                    data-state={isActive ? 'active' : undefined}
                    className="relative"
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
                    {isDisabled
                      ? t(
                          'createBlueprint.validation.notAccessible',
                          'This section is not accessible'
                        )
                      : t(getSectionDescription(section.id), {
                          defaultValue: 'Section not accessible',
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
