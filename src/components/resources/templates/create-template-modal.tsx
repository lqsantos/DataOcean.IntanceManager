'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCreateTemplateModal } from '@/contexts/create-template-modal-context';

import { DirectValidateButton } from './direct-validate-button';

export function CreateTemplateModal() {
  const { t } = useTranslation('templates');
  const { isOpen, isLoading, closeModal, createTemplate } = useCreateTemplateModal();

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
      name: '',
      description: '',
      category: '',
      repositoryUrl: 'https://github.com/',
      chartPath: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: '',
        description: '',
        category: '',
        repositoryUrl: 'https://github.com/',
        chartPath: '',
      });
    }
  }, [isOpen, form]);

  // Form submission handler
  const handleSubmit = async (values: TemplateFormValues) => {
    await createTemplate(values);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px]" data-testid="create-template-modal">
        <DialogHeader>
          <DialogTitle>{t('createTemplate.title')}</DialogTitle>
          <DialogDescription>{t('createTemplate.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            data-testid="create-template-form"
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
                        data-testid="template-name-input"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="template-category-select">
                          <SelectValue
                            placeholder={t('createTemplate.fields.category.placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templateCategories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            data-testid={`template-category-option-${category.toLowerCase()}`}
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
                      data-testid="template-repository-url-input"
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
                          data-testid="template-chart-path-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-end">
                <DirectValidateButton
                  templateName={form.watch('name') || 'Novo Template'}
                  templateId={null}
                  repositoryUrl={form.watch('repositoryUrl')}
                  chartPath={form.watch('chartPath')}
                />
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
                      data-testid="template-description-input"
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                data-testid="create-template-cancel-button"
              >
                {t('createTemplate.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="create-template-submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createTemplate.buttons.creating')}
                  </>
                ) : (
                  t('createTemplate.buttons.create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
