'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { useTemplateValidation } from '@/contexts/template-validation-context';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

interface ResourceTemplateFormProps {
  template?: Template;
  onSubmit: (data: CreateTemplateDto | UpdateTemplateDto) => void;
}

export function ResourceTemplateForm({ template, onSubmit }: ResourceTemplateFormProps) {
  const { t } = useTranslation('templates');
  const { validateTemplate } = useTemplateValidation();
  const [isValidating, setIsValidating] = useState(false);

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
      });
    }
  }, [template, form]);

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

  // Handle validation button click
  const handleValidateClick = async () => {
    // Get form values
    const { repositoryUrl, chartPath, name } = form.getValues();

    // Validate required fields
    const isRepoValid = form.trigger('repositoryUrl');
    const isChartPathValid = form.trigger('chartPath');
    const isNameValid = form.trigger('name');

    if (!isRepoValid || !isChartPathValid || !isNameValid) {
      return;
    }

    setIsValidating(true);

    try {
      if (template) {
        // Use existing template ID if available
        await validateTemplate(template.id, template.name);
      } else {
        // Generate a temporary ID for validation
        const tempId = `temp-${Date.now()}`;

        await validateTemplate(tempId, name || 'New Template');
      }
    } finally {
      setIsValidating(false);
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
                <FormLabel>{t('createTemplate.fields.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('createTemplate.fields.name.placeholder')}
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
                <FormLabel>{t('createTemplate.fields.category.label')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
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
              <FormLabel>{t('createTemplate.fields.repositoryUrl.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('createTemplate.fields.repositoryUrl.placeholder')}
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
                  <FormLabel>{t('createTemplate.fields.chartPath.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('createTemplate.fields.chartPath.placeholder')}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleValidateClick}
              disabled={isValidating}
              className="w-full gap-2"
              data-testid="validate-chart-button"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('table.actions.validating')}
                </>
              ) : (
                t('table.actions.validate')
              )}
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('createTemplate.fields.description.label')}{' '}
                <span className="text-sm text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('createTemplate.fields.description.placeholder')}
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
            {template ? t('editTemplate.buttons.save') : t('createTemplate.buttons.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
