'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlueprintActionControls } from '@/components/blueprints/shared/BlueprintActionControls';
import {
  type BlueprintSection,
  BlueprintSectionNavigation,
} from '@/components/blueprints/shared/BlueprintSectionNavigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';

/**
 * BlueprintEditPage - Component for editing an existing blueprint
 * Extends the creation page with loading state and pre-filled data
 *
 * @param {object} props
 * @param {string} props.blueprintId - The ID of the blueprint to edit
 */
export function BlueprintEditPage({ blueprintId }: { blueprintId: string }) {
  const { t } = useTranslation(['blueprints']);
  const [activeTab, setActiveTab] = useState<string>('metadata');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();

  // Array of sections with their respective IDs, labels and completion status
  const sections: BlueprintSection[] = [
    { id: 'metadata', label: t('create.sections.metadata', 'Metadata'), completed: false },
    { id: 'templates', label: t('create.sections.templates', 'Templates'), completed: false },
    { id: 'variables', label: t('create.sections.variables', 'Variables'), completed: false },
    { id: 'defaults', label: t('create.sections.defaults', 'Defaults'), completed: false },
    { id: 'preview', label: t('create.sections.preview', 'Preview'), completed: false },
  ];

  // Simulate loading blueprint data
  useEffect(() => {
    // TODO: Replace with actual API call to fetch blueprint data
    const fetchBlueprintData = async () => {
      try {
        // Simulate API request delay
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error('Failed to fetch blueprint data:', error);
        setLoading(false);
      }
    };

    fetchBlueprintData();
  }, [blueprintId]);

  // Handle save draft action
  const handleSaveDraft = () => {
    setIsSaving(true);
    // TODO: Implement save draft functionality
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Handle save and update action
  const handleSaveAndUpdate = () => {
    setIsSaving(true);
    // TODO: Implement save and update functionality
    setTimeout(() => {
      setIsSaving(false);
      // Navigate to blueprint listing page after successful update
      router.push('/blueprints');
    }, 1000);
  };

  // Handle cancel action
  const handleCancel = () => {
    // TODO: Add confirmation dialog if there are unsaved changes
    router.push('/blueprints');
  };

  if (loading) {
    return <BlueprintEditSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        data-testid="section-navigation"
      >
        <BlueprintSectionNavigation
          sections={sections}
          activeSection={activeTab}
          onChange={setActiveTab}
        />

        {/* Section Content Areas */}
        <Card className="mt-6 p-6">
          <TabsContent value="metadata" data-testid="section-content-metadata">
            <h2 className="mb-4 text-xl font-semibold">
              {t('create.sections.metadata', 'Metadata')}
            </h2>
            <p className="text-muted-foreground">
              {t(
                'create.sections.metadata.description',
                'Define the basic information about your blueprint'
              )}
            </p>
            {/* Placeholder for MetadataSection component */}
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">MetadataSection component will be placed here</p>
            </div>
          </TabsContent>

          <TabsContent value="templates" data-testid="section-content-templates">
            <h2 className="mb-4 text-xl font-semibold">
              {t('create.sections.templates', 'Templates')}
            </h2>
            <p className="text-muted-foreground">
              {t(
                'create.sections.templates.description',
                'Select and organize templates for your blueprint'
              )}
            </p>
            {/* Placeholder for TemplatesSection component */}
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                TemplatesSection component will be placed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="variables" data-testid="section-content-variables">
            <h2 className="mb-4 text-xl font-semibold">
              {t('create.sections.variables', 'Variables')}
            </h2>
            <p className="text-muted-foreground">
              {t(
                'create.sections.variables.description',
                'Define variables that will be used in your blueprint'
              )}
            </p>
            {/* Placeholder for VariablesSection component */}
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                VariablesSection component will be placed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="defaults" data-testid="section-content-defaults">
            <h2 className="mb-4 text-xl font-semibold">
              {t('create.sections.defaults', 'Default Values')}
            </h2>
            <p className="text-muted-foreground">
              {t(
                'create.sections.defaults.description',
                'Configure default values for each template'
              )}
            </p>
            {/* Placeholder for DefaultValuesSection component */}
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                DefaultValuesSection component will be placed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" data-testid="section-content-preview">
            <h2 className="mb-4 text-xl font-semibold">
              {t('create.sections.preview', 'Preview')}
            </h2>
            <p className="text-muted-foreground">
              {t('create.sections.preview.description', 'Preview your blueprint configuration')}
            </p>
            {/* Placeholder for PreviewSection component */}
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">PreviewSection component will be placed here</p>
            </div>
          </TabsContent>
        </Card>
      </Tabs>

      {/* Action Controls */}
      <BlueprintActionControls
        mode="edit"
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSaveComplete={handleSaveAndUpdate}
        isSaving={isSaving}
      />
    </div>
  );
}

/**
 * BlueprintEditSkeleton - Loading skeleton for the blueprint edit page
 */
function BlueprintEditSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation Skeleton */}
      <div className="h-10 w-full rounded-md bg-muted" />

      {/* Section Content Skeleton */}
      <Card className="mt-6 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
          <div className="mt-4 h-64">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </Card>

      {/* Action Controls Skeleton */}
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
