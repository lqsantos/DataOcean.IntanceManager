'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface BlueprintActionControlsProps {
  mode: 'create' | 'edit';
  handleSave: () => Promise<void>;
  isSaving?: boolean;
}

/**
 * BlueprintActionControls - Shared component for blueprint action buttons
 * Displays action controls for creating or editing blueprints
 */
export function BlueprintActionControls({
  mode: _mode, // Prefixado com _ para indicar que é intencionalmente não utilizado
  handleSave,
  isSaving = false,
}: BlueprintActionControlsProps) {
  const { t } = useTranslation(['blueprints', 'common']);

  return (
    <div className="flex justify-end gap-4 p-4">
      <Button variant="outline" disabled={isSaving} onClick={() => window.history.back()}>
        {t('createBlueprint.buttons.cancel', 'Cancel')}
      </Button>

      <Button variant="default" disabled={isSaving} onClick={handleSave}>
        {isSaving
          ? t('editBlueprint.buttons.saving', 'Saving...')
          : t('editBlueprint.buttons.save', 'Save Changes')}
      </Button>
    </div>
  );
}
