/**
 * ObjectDisplayComponent
 * Specialized component for displaying object fields with clean display + informative tooltip
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import { BUTTON_STYLES } from './constants';

interface ObjectDisplayComponentProps {
  /** The object field being displayed */
  field: DefaultValueField;
  /** Callback when user clicks "Reset All Children" - should handle recursive reset */
  onResetAllChildren?: (customizedPaths: string[]) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to show confirmation dialog for destructive actions */
  showConfirmation?: boolean;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

/**
 * Recursively analyzes object children to determine customization state
 * NOTE: totalProperties counts only DIRECT children for clarity and intuition
 * NOTE: customizedCount counts ALL customizations recursively (needed for reset)
 */
function analyzeObjectChildren(children: DefaultValueField[]): {
  totalProperties: number;
  hasCustomizations: boolean;
  customizedCount: number;
  isEmpty: boolean;
} {
  if (!children || children.length === 0) {
    return {
      totalProperties: 0,
      hasCustomizations: false,
      customizedCount: 0,
      isEmpty: true,
    };
  }

  // Count only direct children for totalProperties (more intuitive)
  const totalProperties = children.length;
  let hasCustomizations = false;
  let customizedCount = 0;

  for (const child of children) {
    // Check if this child is customized
    if (child.source === ValueSourceType.BLUEPRINT) {
      hasCustomizations = true;
      customizedCount++;
    }

    // Recursively check nested children for customizations (but not for count)
    if (child.children && child.children.length > 0) {
      const childAnalysis = analyzeObjectChildren(child.children);

      // Only add customization info, NOT property count
      if (childAnalysis.hasCustomizations) {
        hasCustomizations = true;
        customizedCount += childAnalysis.customizedCount;
      }
    }
  }

  return {
    totalProperties,
    hasCustomizations,
    customizedCount,
    isEmpty: false,
  };
}

/**
 * Recursively collects all customized children paths for reset operation
 */
function collectCustomizedChildren(children: DefaultValueField[]): string[] {
  if (!children || children.length === 0) {
    return [];
  }

  const customizedPaths: string[] = [];

  for (const child of children) {
    // If this child is customized, add its path
    if (child.source === ValueSourceType.BLUEPRINT) {
      customizedPaths.push(child.path.join('.'));
    }

    // Recursively check nested children
    if (child.children && child.children.length > 0) {
      customizedPaths.push(...collectCustomizedChildren(child.children));
    }
  }

  return customizedPaths;
}

/**
 * Component for displaying object fields with clean interface + informative tooltip
 */
export const ObjectDisplayComponent: React.FC<ObjectDisplayComponentProps> = ({
  field,
  onResetAllChildren,
  disabled = false,
  showConfirmation = true,
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation('blueprints');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Analyze the object structure
  const analysis = useMemo(() => {
    return analyzeObjectChildren(field.children || []);
  }, [field.children]);

  // Get customized children paths for reset operation
  const customizedPaths = useMemo(() => {
    return collectCustomizedChildren(field.children || []);
  }, [field.children]);

  // Determine states
  const hasCustomizations = analysis.hasCustomizations;
  const isEmpty = analysis.isEmpty;

  // Handle reset all children with optional confirmation
  const handleResetAllChildren = useCallback(() => {
    if (showConfirmation && hasCustomizations) {
      setShowConfirmDialog(true);
    } else {
      onResetAllChildren?.(customizedPaths);
    }
  }, [showConfirmation, hasCustomizations, onResetAllChildren, customizedPaths]);

  // Confirm reset action
  const handleConfirmReset = useCallback(() => {
    setShowConfirmDialog(false);
    onResetAllChildren?.(customizedPaths);
  }, [onResetAllChildren, customizedPaths]);

  // Cancel reset action
  const handleCancelReset = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  // Clean display text
  const getDisplayText = () => {
    if (isEmpty) {
      return 'Empty';
    }

    return 'Object';
  };

  // Detailed tooltip text
  const getTooltipText = () => {
    if (isEmpty) {
      return 'Empty object';
    }

    const propertyText = analysis.totalProperties === 1 ? 'property' : 'properties';

    if (hasCustomizations) {
      return `${analysis.totalProperties} ${propertyText}, ${analysis.customizedCount} customized`;
    }

    return `${analysis.totalProperties} ${propertyText}`;
  };

  // Visual styling based on state
  const getTextColor = () => {
    if (hasCustomizations) {
      return 'text-blue-700';
    }

    return 'text-gray-700';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-2" data-testid={dataTestId}>
        {/* Object display with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <span
                className={cn('text-sm font-medium', getTextColor())}
                data-testid={dataTestId ? `${dataTestId}-text` : undefined}
              >
                {getDisplayText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset button */}
        {hasCustomizations && !isEmpty && onResetAllChildren && !disabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAllChildren}
            className={cn(BUTTON_STYLES.resetAll)}
            aria-label={`Reset all children (${analysis.customizedCount} ${analysis.customizedCount === 1 ? 'field' : 'fields'})`}
            data-testid={dataTestId ? `${dataTestId}-reset-all` : undefined}
          >
            {t('values.table.resetAllChildren', 'Reset All Children')}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('values.table.resetConfirmation.title', 'Confirm Reset')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'values.table.resetConfirmation.description',
                  `This will reset ${analysis.customizedCount} customized field${
                    analysis.customizedCount === 1 ? '' : 's'
                  } back to template values. This action cannot be undone.`
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelReset}>
                {t('common:buttons.cancel', 'Cancel')}
              </Button>
              <Button variant="destructive" onClick={handleConfirmReset}>
                {t('common:buttons.reset', 'Reset')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
};
