/**
 * ObjectDisplayComponent
 * Specialized component for displaying object fields with structural information
 * and conditional "Reset All Children" functionality
 */

import { AlertTriangle, Circle, Edit3 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

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
 * Enhanced version that provides detailed analysis for better UX
 */
function analyzeObjectChildren(children: DefaultValueField[]): {
  totalProperties: number;
  directProperties: number;
  hasCustomizations: boolean;
  customizedCount: number;
  isEmpty: boolean;
  maxDepth: number;
} {
  if (!children || children.length === 0) {
    return {
      totalProperties: 0,
      directProperties: 0,
      hasCustomizations: false,
      customizedCount: 0,
      isEmpty: true,
      maxDepth: 0,
    };
  }

  let totalProperties = children.length;
  const directProperties = children.length;
  let hasCustomizations = false;
  let customizedCount = 0;
  let maxDepth = 1;

  for (const child of children) {
    // Check if this child is customized
    if (child.source === ValueSourceType.BLUEPRINT) {
      hasCustomizations = true;
      customizedCount++;
    }

    // Recursively check nested children
    if (child.children && child.children.length > 0) {
      const childAnalysis = analyzeObjectChildren(child.children);

      totalProperties += childAnalysis.totalProperties;
      maxDepth = Math.max(maxDepth, childAnalysis.maxDepth + 1);

      if (childAnalysis.hasCustomizations) {
        hasCustomizations = true;
        customizedCount += childAnalysis.customizedCount;
      }
    }
  }

  return {
    totalProperties,
    directProperties,
    hasCustomizations,
    customizedCount,
    isEmpty: false,
    maxDepth,
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
 * Component for displaying object fields with structural information
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

  // Determine visual state based on customizations
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

  // Get appropriate icon and styling based on project patterns
  const getVisualState = () => {
    if (hasCustomizations) {
      return {
        icon: Edit3,
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        warningIcon: true,
      };
    }

    return {
      icon: Circle,
      iconColor: 'text-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      warningIcon: false,
    };
  };

  const visualState = getVisualState();
  const IconComponent = visualState.icon;

  // Format display text with enhanced information
  const getDisplayText = () => {
    if (isEmpty) {
      return '{empty object}';
    }

    const propertyText = analysis.totalProperties === 1 ? 'property' : 'properties';

    // Show different information based on customization state
    if (hasCustomizations) {
      return `{${analysis.totalProperties} ${propertyText}, ${analysis.customizedCount} customized}`;
    }

    return `{${analysis.totalProperties} ${propertyText}}`;
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between rounded-md border p-2 transition-colors',
          visualState.bgColor,
          visualState.borderColor,
          disabled && 'opacity-50'
        )}
        data-testid={dataTestId}
      >
        {/* Object information */}
        <div className="flex items-center gap-2">
          <IconComponent
            size={16}
            className={cn(visualState.iconColor)}
            aria-hidden="true"
            data-testid={dataTestId ? `${dataTestId}-icon` : undefined}
          />
          <span
            className={cn('text-sm font-medium', visualState.textColor)}
            data-testid={dataTestId ? `${dataTestId}-text` : undefined}
          >
            {getDisplayText()}
          </span>
          {hasCustomizations && !isEmpty && visualState.warningIcon && (
            <AlertTriangle
              size={14}
              className="text-amber-600"
              aria-label={t('values.table.validation.attention', 'Has customizations')}
              data-testid={dataTestId ? `${dataTestId}-warning` : undefined}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {hasCustomizations && !isEmpty && onResetAllChildren && !disabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllChildren}
              className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`${t('values.table.resetAllChildren')} (${analysis.customizedCount} ${analysis.customizedCount === 1 ? 'field' : 'fields'})`}
              data-testid={dataTestId ? `${dataTestId}-reset-all` : undefined}
            >
              {t('values.table.resetAllChildren')}
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('values.resetConfirmation.title', 'Confirm Reset')}</DialogTitle>
              <DialogDescription>
                {t(
                  'values.resetConfirmation.description',
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
    </>
  );
};
