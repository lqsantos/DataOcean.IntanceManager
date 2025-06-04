'use client';

import type { UseFormReturn } from 'react-hook-form';

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
  // Get form values
  const formData = form.getValues();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Revisar e Confirmar</h2>
        <p className="text-sm text-muted-foreground">
          Revise todas as informações antes de finalizar a criação do blueprint.
        </p>
      </div>

      {/* Blueprint Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Nome</h3>
              <p>{formData.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Descrição</h3>
              <div className="rounded-md bg-muted/30 p-3">
                <MarkdownPreview content={formData.description} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium">Templates Associados</h3>
              <p className="text-sm text-muted-foreground">
                {formData.selectedTemplates?.length ?? 0} template(s) associado(s)
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Variáveis</h3>
              <p className="text-sm text-muted-foreground">
                {formData.blueprintVariables?.length ?? 0} variável(is) definida(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
