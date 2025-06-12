/**
 * BatchActions component
 * Provides batch actions to expose/hide fields and reset to defaults
 */

import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { DefaultValueField } from './types';
import { ValueSourceType } from './types';

interface BatchActionsProps {
  fields: DefaultValueField[];
  onFieldsChange: (updatedFields: DefaultValueField[]) => void;
}

/**
 * Component for batch actions on fields
 */
export function BatchActions({ fields, onFieldsChange }: BatchActionsProps) {
  const { t } = useTranslation('blueprints', { keyPrefix: 'defaultValues.batchActions' });

  /**
   * Set the exposed property for all fields
   */
  const setAllFieldsExposure = (exposed: boolean) => {
    const updateField = (field: DefaultValueField): DefaultValueField => {
      const updatedField = {
        ...field,
        exposed,
      };

      // Recursively update children
      if (field.children && field.children.length > 0) {
        updatedField.children = field.children.map(updateField);
      }

      return updatedField;
    };

    const updatedFields = fields.map(updateField);

    onFieldsChange(updatedFields);
  };

  /**
   * Reset all fields to default values (template-sourced)
   */
  const resetAllToDefaults = () => {
    const resetField = (field: DefaultValueField): DefaultValueField => {
      const updatedField = {
        ...field,
        source: ValueSourceType.TEMPLATE,
        value: field.originalValue ?? null,
      };

      // Recursively update children
      if (field.children && field.children.length > 0) {
        updatedField.children = field.children.map(resetField);
      }

      return updatedField;
    };

    const updatedFields = fields.map(resetField);

    onFieldsChange(updatedFields);
  };

  return (
    <div className="mb-4 flex space-x-2" data-testid="batch-actions">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllFieldsExposure(true)}
              data-testid="expose-all-fields"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('exposeAll')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('exposeAllDescription')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllFieldsExposure(false)}
              data-testid="hide-all-fields"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              {t('hideAll')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('hideAllDescription')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllToDefaults}
              data-testid="reset-to-defaults"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('resetAll')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('resetAllDescription')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
