'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { MarkdownPreview } from '@/components/ui/markdown-preview';

import type { FormValues } from '../types';

interface PreviewStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * Final step in blueprint form to preview and validate
 */
export function PreviewStep({ form }: PreviewStepProps) {
  const { t } = useTranslation(['blueprints']);

  // Get form values
  const formData = form.getValues();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{t('previewStep.title', 'Revisar e Confirmar')}</h2>
        <p className="text-sm text-muted-foreground">{t('previewStep.description')}</p>
      </div>

      {/* Blueprint Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t('createBlueprint.fields.name.label')}</h3>
              <p>{formData.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">
                {t('createBlueprint.fields.description.label')}
              </h3>
              <div className="rounded-md bg-muted/30 p-3">
                <MarkdownPreview content={formData.description || ''} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">{t('previewStep.templates')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('previewStep.templatesCount', {
                  count: formData.selectedTemplates?.length ?? 0,
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">{t('createBlueprint.fields.variables.label')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('previewStep.variablesCount', {
                  count: formData.blueprintVariables?.length ?? 0,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
