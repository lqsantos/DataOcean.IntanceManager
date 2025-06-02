'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  /** Current step */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Function to move to next step */
  onNextStep?: () => void;
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
  totalSteps,
  onNextStep,
  onPrevStep,
  onCancel,
  isFinalStep = false,
  isSubmitting = false,
  isNextEnabled = true,
  isPrevEnabled = true,
  labels = {},
}: StepNavigationProps) {
  // Default labels
  const { next = 'Próximo', prev = 'Anterior', cancel = 'Cancelar', submit = 'Salvar' } = labels;

  return (
    <div className="mt-6 flex justify-between border-t pt-4">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancel}
        </Button>

        {currentStep > 1 && onPrevStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevStep}
            disabled={!isPrevEnabled || isSubmitting}
            data-testid="prev-step-button"
          >
            {prev}
          </Button>
        )}
      </div>

      <div className="self-center text-sm text-muted-foreground">
        Etapa {currentStep} de {totalSteps}
      </div>

      {isFinalStep ? (
        <Button type="submit" disabled={!isNextEnabled || isSubmitting} data-testid="submit-button">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submit
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!isNextEnabled || isSubmitting}
          data-testid="next-step-button"
        >
          {next}
        </Button>
      )}
    </div>
  );
}
