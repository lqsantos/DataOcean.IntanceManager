'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  /** Current step */
  currentStep: number;
  /** Function to move to previous step */
  onPrevStep?: () => void;
  /** Function to cancel operation */
  onCancel: () => void;
  /** Is the final step */
  isFinalStep?: boolean;
  /** Is form submitting */
  isSubmitting?: boolean;
  /** Is next button enabled */
  isNextEnabled?: boolean;
  /** Is previous button enabled */
  isPrevEnabled?: boolean;
  /** Is server validation passed (only relevant for final step) */

  /** Custom labels */
  labels?: {
    next?: string;
    prev?: string;
    cancel?: string;
    submit?: string;
  };
}

/**
 * Navigation component for multi-step forms
 */
export function StepNavigation({
  currentStep,
  onPrevStep,
  onCancel,
  isFinalStep = false,
  isSubmitting = false,
  isNextEnabled = true,
  isPrevEnabled = true,
  labels = {},
}: StepNavigationProps) {
  const { t } = useTranslation(['blueprints', 'common']);

  // Use translation or fallback to labels or default values
  const cancelLabel = labels.cancel || t('common:buttons.cancel');
  const prevLabel = labels.prev || t('blueprints:createBlueprint.buttons.previous');
  const nextLabel = labels.next || t('blueprints:createBlueprint.buttons.next');
  const submitLabel = labels.submit || t('common:buttons.save');
  const submittingLabel = t('common:messages.loading') || 'Salvando...';

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-between border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>

        {currentStep > 1 && onPrevStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevStep}
            disabled={!isPrevEnabled || isSubmitting}
            data-testid="prev-step-button"
          >
            {prevLabel}
          </Button>
        )}
      </div>

      {isFinalStep ? (
        <Button type="submit" disabled={!isNextEnabled || isSubmitting} data-testid="submit-button">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!isNextEnabled || isSubmitting}
          data-testid="next-step-button"
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
