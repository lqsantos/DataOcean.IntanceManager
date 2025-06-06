'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { FixedVariable } from './types';
import { useVariableValidation } from './types';
import { VariableModal } from './variable-modal';

interface FixedVariableModalProps {
  /** Initial variable data for editing */
  initialData?: FixedVariable;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when form is submitted */
  onSubmit: (data: FixedVariable) => void;
  /** Function to check if variable name is duplicate */
  isVariableNameDuplicate: (name: string, currentVariable?: FixedVariable) => boolean;
}

const defaultValues: FixedVariable = {
  name: '',
  type: 'fixed',
  value: '',
};

/**
 * Modal component for adding/editing fixed value variables
 */
export function FixedVariableModal({
  initialData,
  open,
  onOpenChange,
  onSubmit,
  isVariableNameDuplicate,
}: FixedVariableModalProps) {
  const { t } = useTranslation(['blueprints']);
  const validation = useVariableValidation();

  // Form
  const form = useForm<FixedVariable>({
    resolver: zodResolver(validation.fixedVariableSchema),
    defaultValues,
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(defaultValues);
    }
  }, [form, initialData]);

  // Form submission
  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>, data: FixedVariable) => {
    formEvent.preventDefault();
    formEvent.stopPropagation();
    onSubmit(data);
    onOpenChange(false);
    form.reset(defaultValues);
  };

  return (
    <VariableModal
      title={initialData ? t('variableModal.fixed.title.edit') : t('variableModal.fixed.title.new')}
      description={t('variableModal.fixed.description')}
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset(defaultValues);
        }
        onOpenChange(isOpen);
      }}
    >
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit((data) => handleSubmit(e, data))(e);
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('variableModal.fixed.nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (!isVariableNameDuplicate(value, initialData)) {
                        field.onChange(value);
                      }
                    }}
                    placeholder={t('variableModal.fixed.namePlaceholder')}
                    data-testid="fixed-variable-name-input"
                  />
                </FormControl>
                <FormDescription>{t('variableModal.fixed.nameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('variableModal.fixed.descriptionLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    data-testid="fixed-variable-description-input"
                  />
                </FormControl>
                <FormDescription>{t('variableModal.fixed.descriptionDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('variableModal.fixed.valueLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    data-testid="fixed-variable-value-input"
                  />
                </FormControl>
                <FormDescription>{t('variableModal.fixed.valueDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(defaultValues);
                onOpenChange(false);
              }}
              data-testid="fixed-variable-cancel-button"
            >
              {t('variableModal.fixed.cancel')}
            </Button>
            <Button type="submit" data-testid="fixed-variable-save-button">
              {t('variableModal.fixed.save')}
            </Button>
          </div>
        </form>
      </Form>
    </VariableModal>
  );
}
