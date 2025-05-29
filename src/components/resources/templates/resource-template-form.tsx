'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

interface ResourceTemplateFormProps {
  template?: Template;
  onSubmit: (data: CreateTemplateDto | UpdateTemplateDto) => Promise<void>;
  isSubmitting?: boolean;
  'data-testid'?: string;
}

export function ResourceTemplateForm({
  template,
  onSubmit,
  isSubmitting = false,
  'data-testid': dataTestId,
}: ResourceTemplateFormProps) {
  const { t } = useTranslation('templates');

  // Define schema for form validation
  const templateFormSchema = z.object({
    name: z.string().min(3, {
      message: t('createTemplate.fields.name.validation.tooShort', { min: 3 }),
    }),
    description: z.string().optional(),
    category: z.string().min(1, {
      message: t('createTemplate.fields.category.validation.required'),
    }),
    repositoryUrl: z.string().url({
      message: t('createTemplate.fields.repositoryUrl.validation.invalidUrl'),
    }),
    chartPath: z.string().min(1, {
      message: t('createTemplate.fields.chartPath.validation.required'),
    }),
    version: z.string().optional(),
    isActive: z.boolean().default(true),
    valuesYaml: z.string().optional(),
  });

  type TemplateFormValues = z.infer<typeof templateFormSchema>;

  // Initialize form
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || '',
      repositoryUrl: template?.repositoryUrl || 'https://github.com/',
      chartPath: template?.chartPath || '',
      version: template?.version || '1.0.0',
      isActive: template?.isActive ?? true,
      valuesYaml: template?.valuesYaml || '',
    },
  });

  // Update form when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        repositoryUrl: template.repositoryUrl || '',
        chartPath: template.chartPath || '',
        version: template.version || '',
        isActive: template.isActive ?? true,
        valuesYaml: template.valuesYaml || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category: '',
        repositoryUrl: 'https://github.com/',
        chartPath: '',
        version: '1.0.0',
        isActive: true,
        valuesYaml: '',
      });
    }
  }, [template, form]);

  // Form submission handler
  const handleSubmit = async (values: TemplateFormValues) => {
    try {
      await onSubmit({
        ...values,
        id: template?.id,
      });

      if (!template) {
        // If we're creating a new template, reset the form
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting template form:', error);
    }
  };

  // Predefined template categories
  const templateCategories = [
    'Application',
    'Infrastructure',
    'Database',
    'Monitoring',
    'Security',
    'Storage',
    'Other',
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid={dataTestId || 'edit-template-form'}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('createTemplate.fields.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('createTemplate.fields.name.placeholder')}
                    {...field}
                    data-testid="edit-template-name-input"
                  />
                </FormControl>
                <FormDescription>{t('createTemplate.fields.name.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('createTemplate.fields.category.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="edit-template-category-select">
                      <SelectValue placeholder={t('createTemplate.fields.category.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        data-testid={`edit-template-category-option-${category.toLowerCase()}`}
                      >
                        {t(`createTemplate.fields.category.options.${category.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t('createTemplate.fields.category.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('createTemplate.fields.description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('createTemplate.fields.description.placeholder')}
                  {...field}
                  data-testid="edit-template-description-input"
                />
              </FormControl>
              <FormDescription>
                {t('createTemplate.fields.description.description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="repositoryUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('createTemplate.fields.repositoryUrl.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('createTemplate.fields.repositoryUrl.placeholder')}
                    {...field}
                    data-testid="edit-template-repository-url-input"
                  />
                </FormControl>
                <FormDescription>
                  {t('createTemplate.fields.repositoryUrl.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chartPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('createTemplate.fields.chartPath.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('createTemplate.fields.chartPath.placeholder')}
                    {...field}
                    data-testid="edit-template-chart-path-input"
                  />
                </FormControl>
                <FormDescription>
                  {t('createTemplate.fields.chartPath.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('createTemplate.fields.version.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('createTemplate.fields.version.placeholder')}
                    {...field}
                    data-testid="edit-template-version-input"
                  />
                </FormControl>
                <FormDescription>{t('createTemplate.fields.version.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('createTemplate.fields.isActive.label')}</FormLabel>
                  <FormDescription>
                    {t('createTemplate.fields.isActive.description')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-readonly={field.disabled}
                    data-testid="edit-template-is-active-checkbox"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="valuesYaml"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('createTemplate.fields.valuesYaml.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('createTemplate.fields.valuesYaml.placeholder')}
                  className="h-[200px] font-mono"
                  {...field}
                  data-testid="edit-template-values-yaml-input"
                />
              </FormControl>
              <FormDescription>{t('createTemplate.fields.valuesYaml.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          data-testid="edit-template-submit-button"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              {t('editTemplate.buttons.saving')}
            </>
          ) : template ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              {t('editTemplate.buttons.save')}
            </>
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              {t('createTemplate.buttons.create')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
