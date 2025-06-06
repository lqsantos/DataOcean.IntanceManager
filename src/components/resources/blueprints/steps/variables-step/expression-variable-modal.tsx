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

import { GoTemplateEditor } from './go-template-editor';
import type { ExpressionVariable } from './types';
import { useVariableValidation } from './types';
import { VariableModal } from './variable-modal';

interface ExpressionVariableModalProps {
  /** Initial variable data for editing */
  initialData?: ExpressionVariable;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when form is submitted */
  onSubmit: (data: ExpressionVariable) => void;
  /** Function to check if variable name is duplicate */
  isVariableNameDuplicate: (name: string, currentVariable?: ExpressionVariable) => boolean;
}

const defaultValues: ExpressionVariable = {
  name: '',
  type: 'expression',
  expression: '',
};

/**
 * Modal component for adding/editing Go Template expression variables
 */
export function ExpressionVariableModal({
  initialData,
  open,
  onOpenChange,
  onSubmit,
  isVariableNameDuplicate,
}: ExpressionVariableModalProps) {
  const { t } = useTranslation(['blueprints']);
  const validation = useVariableValidation();

  // Form
  const form = useForm<ExpressionVariable>({
    resolver: zodResolver(validation.expressionVariableSchema),
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
  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>, data: ExpressionVariable) => {
    formEvent.preventDefault();
    formEvent.stopPropagation();
    onSubmit(data);
    onOpenChange(false);
    form.reset(defaultValues);
  };

  return (
    <VariableModal
      title={
        initialData
          ? t('variableModal.expression.title.edit')
          : t('variableModal.expression.title.new')
      }
      description={t('variableModal.expression.description')}
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
                <FormLabel>{t('variableModal.expression.nameLabel')}</FormLabel>
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
                    placeholder={t('variableModal.expression.namePlaceholder')}
                    data-testid="expression-variable-name-input"
                  />
                </FormControl>
                <FormDescription>{t('variableModal.expression.nameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('variableModal.expression.descriptionLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    data-testid="expression-variable-description-input"
                  />
                </FormControl>
                <FormDescription>
                  {t('variableModal.expression.descriptionDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('variableModal.expression.expressionLabel')}</FormLabel>
                <FormControl>
                  <GoTemplateEditor value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  {t('variableModal.expression.expressionDescription')}
                </FormDescription>
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
              data-testid="expression-variable-cancel-button"
            >
              {t('variableModal.expression.cancel')}
            </Button>
            <Button type="submit" data-testid="expression-variable-save-button">
              {t('variableModal.expression.save')}
            </Button>
          </div>
        </form>
      </Form>
    </VariableModal>
  );
}
