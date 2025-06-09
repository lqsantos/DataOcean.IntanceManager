'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface BlueprintActionControlsProps {
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSaveDraft: () => void;
  onSaveComplete: () => void;
  isSaving?: boolean;
}

/**
 * BlueprintActionControls - Shared component for blueprint action buttons
 * Displays action controls for creating or editing blueprints
 *
 * @example
 * <BlueprintActionControls
 *   mode="create"
 *   onCancel={() => router.push('/blueprints')}
 *   onSaveDraft={handleSaveDraft}
 *   onSaveComplete={handleSaveAndCreate}
 *   isSaving={isSaving}
 * />
 *
 * @param {object} props
 * @param {'create' | 'edit'} props.mode - The mode of the component (create or edit)
 * @param {() => void} props.onCancel - Callback function for cancel button
 * @param {() => void} props.onSaveDraft - Callback function for save draft button
 * @param {() => void} props.onSaveComplete - Callback function for final save button
 * @param {boolean} [props.isSaving=false] - Whether the form is currently saving
 */
export function BlueprintActionControls({
  mode,
  onCancel,
  onSaveDraft,
  onSaveComplete,
  isSaving = false,
}: BlueprintActionControlsProps) {
  const { t } = useTranslation(['blueprints']);

  // Helper function to avoid nested ternary
  const getSaveButtonText = () => {
    return mode === 'create'
      ? t('actions.saveCreate', 'Save & Create')
      : t('actions.saveUpdate', 'Save & Update');
  };

  return (
    <div className="mt-4 flex justify-between">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
        data-testid="blueprint-cancel-button"
      >
        {t('actions.cancel', 'Cancel')}
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving}
          data-testid="blueprint-save-draft-button"
        >
          {isSaving ? t('actions.saving', 'Saving...') : t('actions.saveDraft', 'Save Draft')}
        </Button>
        <Button
          onClick={onSaveComplete}
          disabled={isSaving}
          data-testid="blueprint-save-complete-button"
        >
          {isSaving ? t('actions.saving', 'Saving...') : getSaveButtonText()}
        </Button>
      </div>
    </div>
  );
}
