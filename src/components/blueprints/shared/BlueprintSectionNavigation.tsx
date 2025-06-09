'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface BlueprintSection {
  id: string;
  label: string;
  completed: boolean;
}

interface BlueprintSectionNavigationProps {
  sections: BlueprintSection[];
  activeSection: string;
  onChange: (section: string) => void;
}

/**
 * BlueprintSectionNavigation - Navigation component for blueprint creation/edit workflow
 * Displays tabs for each section and allows switching between them
 *
 * @example
 * <BlueprintSectionNavigation
 *   sections={sections}
 *   activeSection={activeSection}
 *   onChange={setActiveSection}
 * />
 *
 * @param {object} props
 * @param {BlueprintSection[]} props.sections - Array of section objects with id, label, and completed status
 * @param {string} props.activeSection - The currently active section id
 * @param {(section: string) => void} props.onChange - Callback function when active section changes
 */
export function BlueprintSectionNavigation({
  sections,
  activeSection,
  onChange,
}: BlueprintSectionNavigationProps) {
  return (
    <TabsList
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}
    >
      {sections.map((section) => (
        <TabsTrigger
          key={section.id}
          value={section.id}
          onClick={() => onChange(section.id)}
          data-testid={`section-tab-${section.id}`}
          className="flex items-center gap-2"
          data-state={activeSection === section.id ? 'active' : 'inactive'}
        >
          {section.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-green-500"
              data-testid={`section-complete-indicator-${section.id}`}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {section.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
