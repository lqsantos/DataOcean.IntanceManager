'use client';

import { Code, FileText } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApplications } from '@/hooks/use-applications';

import type { FormValues } from '../types';

interface BasicInfoStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * First step in blueprint form to collect basic info
 */
export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const { t } = useTranslation(['blueprints']);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const { applications } = useApplications();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{t('basicInfoStep.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('basicInfoStep.description')}</p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required-field">
              {t('createBlueprint.fields.name.label')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('createBlueprint.fields.name.placeholder')}
                {...field}
                data-testid="blueprint-name-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required-field">
              {t('createBlueprint.fields.applicationId.label')}
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Adicionar log para debug
                console.warn('Application selected:', value);
              }}
              defaultValue={field.value}
              value={field.value} // Adicionar o value explicitamente
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('createBlueprint.fields.applicationId.placeholder')}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {applications?.map((app: { id: string; name: string }) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {t('createBlueprint.fields.applicationId.description')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="required-field">
                  {t('createBlueprint.fields.description.label')}
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                  className="h-7 gap-1 text-xs"
                >
                  {showMarkdownPreview ? (
                    <Code className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {showMarkdownPreview
                    ? t('basicInfoStep.markdownButtons.edit')
                    : t('basicInfoStep.markdownButtons.preview')}
                </Button>
              </div>
              <FormControl>
                {showMarkdownPreview ? (
                  <div className="min-h-[150px] rounded-md border bg-muted/30 p-3">
                    <MarkdownPreview content={field.value || t('basicInfoStep.noDescription')} />
                  </div>
                ) : (
                  <Textarea
                    placeholder={t('createBlueprint.fields.description.placeholder')}
                    {...field}
                    rows={5}
                    data-testid="blueprint-description-input"
                  />
                )}
              </FormControl>
              <FormDescription>{t('basicInfoStep.markdownHelp')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
