'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

import { DirectValidateButton } from './direct-validate-button';

const CATEGORY_TRANSLATION_KEYS = {
  APPLICATION: 'createTemplate.fields.category.options.application',
  INFRASTRUCTURE: 'createTemplate.fields.category.options.infrastructure',
  DATABASE: 'createTemplate.fields.category.options.database',
  MONITORING: 'createTemplate.fields.category.options.monitoring',
  SECURITY: 'createTemplate.fields.category.options.security',
  STORAGE: 'createTemplate.fields.category.options.storage',
  OTHER: 'createTemplate.fields.category.options.other',
} as const;

interface ResourceTemplateFormProps {
  template?: Template;
  onSubmit: (data: CreateTemplateDto | UpdateTemplateDto) => void;
}

export function ResourceTemplateForm({ template, onSubmit }: ResourceTemplateFormProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tTemplates } = useTranslation('templates');

  // Define schema for form validation
  const templateFormSchema = z.object({
    name: z.string().min(3, {
      message: tTemplates('createTemplate.fields.name.validation.tooShort', { min: 3 }),
    }),
    description: z.string().optional(),
    category: z.string().min(1, {
      message: tTemplates('createTemplate.fields.category.validation.required'),
    }),
    repositoryUrl: z.string().url({
      message: tTemplates('createTemplate.fields.repositoryUrl.validation.invalidUrl'),
    }),
    chartPath: z.string().min(1, {
      message: tTemplates('createTemplate.fields.chartPath.validation.required'),
    }),
  });

  type TemplateFormValues = z.infer<typeof templateFormSchema>;

  const defaultValues = template
    ? {
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        repositoryUrl: template.repositoryUrl || 'https://github.com/',
        chartPath: template.chartPath || '',
      }
    : {
        name: '',
        description: '',
        category: '',
        repositoryUrl: 'https://github.com/',
        chartPath: '',
      };

  // Initialize form
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      Object.entries({
        name: template.name,
        description: template.description || '',
        category: template.category,
        repositoryUrl: template.repositoryUrl,
        chartPath: template.chartPath,
      }).forEach(([field, value]) => {
        form.setValue(field as keyof TemplateFormValues, value);
      });
    }
  }, [template?.id, form]);

  // Form submission handler
  const handleSubmit = (values: TemplateFormValues) => {
    if (template) {
      onSubmit({
        id: template.id,
        ...values,
      });
    } else {
      onSubmit(values);
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
        className="space-y-4"
        data-testid="edit-template-form"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tTemplates('createTemplate.fields.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tTemplates('createTemplate.fields.name.placeholder')}
                    {...field}
                    data-testid="edit-template-name-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tTemplates('createTemplate.fields.category.label')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="edit-template-category-select">
                      <SelectValue
                        placeholder={tTemplates('createTemplate.fields.category.placeholder')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templateCategories.map((category) => {
                      const translationKey =
                        CATEGORY_TRANSLATION_KEYS[
                          category.toUpperCase() as keyof typeof CATEGORY_TRANSLATION_KEYS
                        ];

                      return (
                        <SelectItem
                          key={category}
                          value={category}
                          data-testid={`edit-template-category-option-${category.toLowerCase()}`}
                        >
                          {tTemplates(translationKey)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="repositoryUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tTemplates('createTemplate.fields.repositoryUrl.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={tTemplates('createTemplate.fields.repositoryUrl.placeholder')}
                  {...field}
                  data-testid="edit-template-repository-url-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="chartPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTemplates('createTemplate.fields.chartPath.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tTemplates('createTemplate.fields.chartPath.placeholder')}
                      {...field}
                      data-testid="edit-template-chart-path-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-end">
            <DirectValidateButton
              templateName={form.watch('name') || template?.name || 'Template'}
              templateId={template?.id}
              repositoryUrl={form.watch('repositoryUrl')}
              chartPath={form.watch('chartPath')}
              data-testid="edit-template-validate-button"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {tTemplates('createTemplate.fields.description.label')}
                <span className="ml-1 text-sm text-muted-foreground">
                  ({tCommon('form.optional')})
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tTemplates('createTemplate.fields.description.placeholder')}
                  {...field}
                  data-testid="edit-template-description-input"
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" data-testid="edit-template-submit-button">
            {template
              ? tTemplates('editTemplate.buttons.save')
              : tTemplates('createTemplate.buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
