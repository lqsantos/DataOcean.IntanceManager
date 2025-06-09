'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { BlueprintActionControls } from '@/components/blueprints/shared/BlueprintActionControls';
import { BlueprintSectionContainer } from '@/components/blueprints/shared/BlueprintSectionContainer';
import { BlueprintSectionNavigation } from '@/components/blueprints/shared/BlueprintSectionNavigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  BlueprintFormProvider,
  type BlueprintSectionContent,
} from '@/contexts/blueprint-form-context';
import { useBlueprintNavigation, type SectionId } from '@/hooks/blueprint';

export interface BlueprintEditorProps {
  /**
   * Mode of operation (create or edit)
   */
  mode: 'create' | 'edit';

  /**
   * Base URL for navigation (e.g. /blueprints/create or /blueprints/edit/:id)
   */
  baseUrl: string;

  /**
   * Blueprint ID (only required for edit mode)
   */
  blueprintId?: string;

  /**
   * Custom content for sections (optional)
   * Allows inserting custom components for each section
   */
  sectionContent?: Partial<BlueprintSectionContent>;

  /**
   * Optional test ID for component identification in tests
   */
  testId?: string;

  /**
   * Additional actions to execute on save
   * @param mode The mode of the editor
   * @param validSections Array of validated sections
   * @returns Promise that resolves when action is complete
   */
  onSave?: (mode: 'create' | 'edit', validSections: SectionId[]) => Promise<void>;
}

/**
 * BlueprintEditor - Shared component for creating or editing blueprints
 * Handles all common logic and UI for both creation and edit workflows
 */
export function BlueprintEditor({
  mode,
  baseUrl,
  blueprintId,
  sectionContent = {},
  testId,
  onSave,
}: BlueprintEditorProps) {
  const { t } = useTranslation(['blueprints', 'common']);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(mode === 'edit');

  // Load blueprint data in edit mode
  useEffect(() => {
    if (mode === 'edit' && blueprintId) {
      const fetchBlueprintData = async () => {
        try {
          // TODO: Replace with real API call
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });

          setLoading(false);
        } catch (error) {
          console.error(t('errors.fetchError', 'Failed to fetch blueprint:'), error);
          toast.error(t('toast.error.title', 'Error'), {
            description: t('blueprints:errors.loadError', 'Failed to load blueprint'),
          });
          setLoading(false);
        }
      };

      void fetchBlueprintData();
    }
  }, [mode, blueprintId, t]);

  // Use the navigation hook for sections with basic validations
  const { activeSection, canAccessSection, navigateToSection } = useBlueprintNavigation(
    'metadata',
    { mode, baseUrl }
  );

  // Handler for section navigation
  const handleSectionChange = useCallback(
    (section: SectionId) => {
      navigateToSection(section);
    },
    [navigateToSection]
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6" data-testid="blueprint-editor-loading">
        <Card className="p-6">{t('common:messages.loading', 'Loading...')}</Card>
      </div>
    );
  }

  // Utility functions for toast messages
  const showSuccessToast = (messageKey: string) => {
    toast.success(t('toast.success.title', 'Success'), {
      description: t(`toast.${messageKey}`, 'Operation completed successfully'),
    });
  };

  const showErrorToast = (errorKey: string) => {
    toast.error(t('toast.error.title', 'Error'), {
      description: t(`errors.${errorKey}`, 'An error occurred'),
    });
  };

  // Handle save action
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Execute custom save action if provided
      if (onSave) {
        await onSave(mode, [activeSection]);
      }

      showSuccessToast(
        mode === 'create' ? 'toast.created.description' : 'toast.updated.description'
      );
    } catch (error) {
      console.error(t('errors.saveError', 'Failed to save blueprint:'), error);
      showErrorToast('errors.saveError');
    } finally {
      setIsSaving(false);
    }
  }, [mode, onSave, activeSection]);

  return (
    <BlueprintFormProvider>
      <div className="flex flex-col gap-6" data-testid={testId}>
        <Tabs value={activeSection}>
          <Card className="p-6">
            <BlueprintSectionNavigation
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              checkAccess={canAccessSection}
            />
          </Card>

          <div className="flex-1">
            {/* Metadata Section */}
            <TabsContent value="metadata">
              <BlueprintSectionContainer
                sectionId="metadata"
                title={t('sections.basicInfo', 'Basic Information')}
                description={t(
                  'basicInfo.sectionDescription',
                  'Configure the basic information for this blueprint'
                )}
                mode={mode}
                isSaving={isSaving}
              >
                {sectionContent.metadata || (
                  <div
                    className="p-4 text-muted-foreground"
                    data-testid="metadata-section-placeholder"
                  >
                    {t('sections.placeholders.metadata', 'No metadata form provided')}
                  </div>
                )}
              </BlueprintSectionContainer>
            </TabsContent>

            {/* Templates Section */}
            <TabsContent value="templates">
              <BlueprintSectionContainer
                sectionId="templates"
                title={t('sections.templates', 'Templates')}
                description={t(
                  'templates.sectionDescription',
                  'Select and manage templates associated with this blueprint'
                )}
                mode={mode}
                isSaving={isSaving}
              >
                {sectionContent.templates || (
                  <div
                    className="p-4 text-muted-foreground"
                    data-testid="templates-section-placeholder"
                  >
                    {t('sections.placeholders.templates', 'No templates form provided')}
                  </div>
                )}
              </BlueprintSectionContainer>
            </TabsContent>

            {/* Variables Section */}
            <TabsContent value="variables">
              <BlueprintSectionContainer
                sectionId="variables"
                title={t('sections.variables', 'Variables')}
                description={t(
                  'variables.sectionDescription',
                  'Define variables used by this blueprint'
                )}
                mode={mode}
                isSaving={isSaving}
              >
                {sectionContent.variables || (
                  <div
                    className="p-4 text-muted-foreground"
                    data-testid="variables-section-placeholder"
                  >
                    {t('sections.placeholders.variables', 'No variables form provided')}
                  </div>
                )}
              </BlueprintSectionContainer>
            </TabsContent>

            {/* Defaults Section */}
            <TabsContent value="defaults">
              <BlueprintSectionContainer
                sectionId="defaults"
                title={t('sections.defaults', 'Default Values')}
                description={t('defaults.sectionDescription', 'Set default values for variables')}
                mode={mode}
                isSaving={isSaving}
              >
                {sectionContent.defaults || (
                  <div
                    className="p-4 text-muted-foreground"
                    data-testid="defaults-section-placeholder"
                  >
                    {t('sections.placeholders.defaults', 'No defaults form provided')}
                  </div>
                )}
              </BlueprintSectionContainer>
            </TabsContent>

            {/* Preview Section */}
            <TabsContent value="preview">
              <BlueprintSectionContainer
                sectionId="preview"
                title={t('sections.preview', 'Preview')}
                description={t('preview.sectionDescription', 'Preview the blueprint configuration')}
                mode={mode}
                isSaving={isSaving}
              >
                {sectionContent.preview || (
                  <div
                    className="p-4 text-muted-foreground"
                    data-testid="preview-section-placeholder"
                  >
                    {t('sections.placeholders.preview', 'No preview available')}
                  </div>
                )}
              </BlueprintSectionContainer>
            </TabsContent>
          </div>
        </Tabs>

        <BlueprintActionControls mode={mode} isSaving={isSaving} handleSave={handleSave} />
      </div>
    </BlueprintFormProvider>
  );
}
