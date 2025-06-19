'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type SectionId } from '@/components/blueprints/shared/BlueprintSectionNavigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlueprintActionControlsProps {
  mode: 'create' | 'edit';
  handleSave: () => Promise<void>;
  isSaving?: boolean;
  sectionsWithErrors?: SectionId[];
  hasAttemptedSave?: boolean;
  onNavigateToSection?: (section: SectionId) => void;
  className?: string;
}

/**
 * BlueprintActionControls - Shared component for blueprint action buttons
 * Displays action controls for creating or editing blueprints
 */
export function BlueprintActionControls({
  mode: _mode, // Prefixado com _ para indicar que é intencionalmente não utilizado
  handleSave,
  isSaving = false,
  sectionsWithErrors = [],
  hasAttemptedSave = false,
  onNavigateToSection,
  className,
}: BlueprintActionControlsProps) {
  const { t } = useTranslation(['blueprints', 'common']);

  return (
    <div className={cn('space-y-2 p-2', className)}>
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          disabled={isSaving}
          onClick={() => window.history.back()}
          data-testid="blueprint-cancel-button"
        >
          {t('createBlueprint.buttons.cancel', 'Cancel')}
        </Button>

        <Button
          variant="default"
          disabled={isSaving}
          onClick={handleSave}
          data-testid="blueprint-save-button"
        >
          {isSaving
            ? t('editBlueprint.buttons.saving', 'Saving...')
            : t('editBlueprint.buttons.save', 'Save Changes')}
        </Button>
      </div>

      {/* Resumo de erros - mostrado apenas quando o usuário tentou salvar com erros */}
      {hasAttemptedSave && sectionsWithErrors.length > 0 && (
        <div
          className="flex items-start gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-testid="blueprint-validation-summary"
        >
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-medium">
              {t('validation.formHasErrors', 'O formulário contém erros')}
            </p>
            <ul className="mt-1.5 list-disc pl-4">
              {sectionsWithErrors.map((section) => (
                <li
                  key={section}
                  className={onNavigateToSection ? 'cursor-pointer hover:underline' : undefined}
                  onClick={() => onNavigateToSection?.(section)}
                  data-testid={`error-section-${section}`}
                >
                  {t(section === 'metadata' ? 'sections.basicInfo' : `sections.${section}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
