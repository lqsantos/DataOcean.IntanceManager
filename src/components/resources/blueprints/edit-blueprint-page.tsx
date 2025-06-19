'use client';

import { zodResolv  const { getBlueprint, updateBlueprint } = useBlueprintStore();

  // Inicializar formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      applicationId: '',
      selectedTemplates: [],
      blueprintVariables: [],
    },
    mode: 'onSubmit',
  });

  const { handleSubmit } = form;form/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlueprintStore } from '@/hooks/use-blueprints';
import type { Blueprint } from '@/types/blueprint';

import { BasicInfoStep } from './steps/basic-info-step';
import { TemplatesStep } from './steps/templates-step';
import { VariablesStep } from './steps/variables-step';
import { formSchema, type FormValues } from './types';

interface EditBlueprintPageProps {
  blueprintId: string;
}

export function EditBlueprintPage({ blueprintId }: EditBlueprintPageProps) {
  const { t } = useTranslation(['blueprints', 'common']);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const { getBlueprint, updateBlueprint } = useBlueprintStore();

  // Inicializar formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      applicationId: '',
      selectedTemplates: [],
      blueprintVariables: [],
    },
    mode: 'onSubmit',
  });

  // Carregar dados do blueprint
  useEffect(() => {
    async function loadBlueprint() {
      try {
        setIsLoading(true);
        const loadedBlueprint = await getBlueprint(blueprintId);
        
        setBlueprint(loadedBlueprint);

        // Mapear variáveis do formato da API para o formato do formulário
        const mappedVariables = loadedBlueprint.variables?.map(v => ({
          name: v.name,
          type: 'simple' as const, // Assumindo tipo simples como padrão
          description: v.description,
          value: v.defaultValue,
        })) || [];

        // Atualizar valores do formulário
        form.reset({
          name: loadedBlueprint.name,
          description: loadedBlueprint.description || '',
          applicationId: loadedBlueprint.applicationId,
          selectedTemplates: loadedBlueprint.childTemplates || [],
          blueprintVariables: mappedVariables,
        });
      } catch {
        toast.error(t('toast.error.title'), {
          description: t('errors.loadFailed'),
        });
        router.push('/resources/blueprints');
      } finally {
        setIsLoading(false);
      }
    }

    loadBlueprint();
  }, [blueprintId, form, getBlueprint, router, t]);

  // Função para salvar o blueprint
  async function onSave(data: FormValues) {
    if (!blueprint) {
      return;
    }
    
    try {
      setIsSaving(true);

      // Mapear as variáveis para o formato esperado pela API
      const mappedVariables = data.blueprintVariables?.map(v => ({
        name: v.name,
        type: 'string' as const, // Usando 'string' como padrão
        description: v.description,
        defaultValue: v.value,
        required: true, // Assumindo que todas são obrigatórias por padrão
      }));

      // Preparar dados para atualização
      const blueprintData = {
        id: blueprint.id,
        name: data.name,
        description: data.description,
        applicationId: data.applicationId,
        variables: mappedVariables,
        childTemplates: data.selectedTemplates?.map((template, index) => ({
          templateId: template.templateId,
          identifier: template.identifier,
          order: index + 1,
          overrideValues: template.overrideValues,
        })) || [],
      };

      await updateBlueprint(blueprintData);

      toast.success(t('toast.updated.title'), {
        description: t('edit.saveSuccess'),
      });

      router.push('/resources/blueprints');
    } catch {
      toast.error(t('toast.error.title'), {
        description: t('errors.updateFailed'),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/resources/blueprints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-40" />
              ) : (
                `${t('blueprints:edit.title')} ${blueprint?.name || ''}`
              )}
            </h1>
            <p className="text-muted-foreground">
              {t('blueprints:edit.description')}
            </p>
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSave)}
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              {t('common:buttons.save')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('common:buttons.save')}
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form className="grid gap-6">
            {/* Seção de Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>{t('blueprints:sections.basicInfo')}</CardTitle>
                <CardDescription>
                  {t('blueprints:basicInfo.sectionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoStep form={form} />
              </CardContent>
            </Card>

            {/* Seção de Templates */}
            <Card>
              <CardHeader>
                <CardTitle>{t('blueprints:sections.templates')}</CardTitle>
                <CardDescription>
                  {t('blueprints:templates.sectionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesStep form={form} />
              </CardContent>
            </Card>

            {/* Seção de Variáveis */}
            <Card>
              <CardHeader>
                <CardTitle>{t('blueprints:sections.variables')}</CardTitle>
                <CardDescription>
                  {t('blueprints:variables.sectionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VariablesStep form={form} />
              </CardContent>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
