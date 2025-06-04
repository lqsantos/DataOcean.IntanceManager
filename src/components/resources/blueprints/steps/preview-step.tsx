'use client';

import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const validations = getValidations(formData);

  // Não precisamos mais da validação automática aqui
  // A validação só será feita quando o usuário clicar em "Criar Blueprint"

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

      {/* Validation Results */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Validações</h3>

        {/* Local validations */}
        {validations.map((validation, index) => (
          <Alert key={index} variant={getAlertVariant(validation.type)}>
            {validation.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {validation.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            {validation.type === 'success' && <CheckCircle className="h-4 w-4" />}
            <AlertTitle>{getAlertTitle(validation.type)}</AlertTitle>
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        ))}

        {/* Sem validação automática - será feita ao clicar em Criar Blueprint */}
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Pronto para criar</AlertTitle>
          <AlertDescription>
            Revise os dados acima e clique no botão "Criar Blueprint" para continuar. O blueprint
            será validado antes da criação.
          </AlertDescription>
        </Alert>
      </div>

      {/* Preview Helper.tpl */}
      {formData.helperTpl && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Helper Template</h3>
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Visualização</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-2 rounded-md border p-4">
              <MarkdownPreview content={formData.helperTpl} />
            </TabsContent>
            <TabsContent value="code" className="mt-2 rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs">{formData.helperTpl}</pre>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

/**
 * Get the appropriate alert variant based on validation type
 */
function getAlertVariant(type: 'error' | 'warning' | 'success'): 'destructive' | 'default' {
  switch (type) {
    case 'error':
      return 'destructive';
    case 'warning':
    case 'success':
    default:
      return 'default';
  }
}

/**
 * Get the appropriate alert title based on validation type
 */
function getAlertTitle(type: 'error' | 'warning' | 'success') {
  switch (type) {
    case 'error':
      return 'Erro';
    case 'warning':
      return 'Aviso';
    case 'success':
      return 'Sucesso';
    default:
      return 'Informação';
  }
}

/**
 * Generate validation results for the form data
 */
function getValidations(data: FormValues) {
  const validations: Array<{ type: 'error' | 'warning' | 'success'; message: string }> = [];

  // 1. Check name and description
  if (!data.name?.trim()) {
    validations.push({ type: 'error', message: 'Nome do blueprint é obrigatório' });
  }

  if (!data.description?.trim()) {
    validations.push({ type: 'error', message: 'Descrição do blueprint é obrigatória' });
  }

  // 2. Check selected templates (unique identifiers)
  const selectedTemplates = data.selectedTemplates || [];
  const identifiers = selectedTemplates.map((t) => t.identifier);
  const uniqueIdentifiers = new Set(identifiers);

  if (identifiers.length > uniqueIdentifiers.size) {
    validations.push({
      type: 'error',
      message: 'Existem identificadores duplicados nos templates',
    });
  }

  // 3. Check blueprint variables (unique names and syntax)
  const blueprintVariables = data.blueprintVariables || [];
  const variableNames = blueprintVariables.map((v) => v.name);
  const uniqueNames = new Set(variableNames);

  if (variableNames.length > uniqueNames.size) {
    validations.push({ type: 'error', message: 'Existem nomes duplicados nas variáveis' });
  }

  // 4. Check Go Template syntax in advanced expressions
  blueprintVariables
    .filter((v) => v.type === 'advanced')
    .forEach((variable) => {
      const value = variable.value || '';
      const openBraces = (value.match(/{{/g) || []).length;
      const closeBraces = (value.match(/}}/g) || []).length;

      if (openBraces !== closeBraces) {
        validations.push({
          type: 'error',
          message: `Erro de sintaxe na variável "${variable.name}": chaves não correspondem`,
        });
      }
    });

  // 5. Warnings
  if (blueprintVariables.length === 0) {
    validations.push({ type: 'warning', message: 'Nenhuma variável definida' });
  }

  if (selectedTemplates.length === 0) {
    validations.push({
      type: 'warning',
      message: 'Nenhum template associado',
    });
  }

  // 6. Success message if no errors
  if (!validations.some((v) => v.type === 'error')) {
    validations.push({
      type: 'success',
      message: 'Blueprint válido e pronto para ser criado',
    });
  }

  return validations;
}
