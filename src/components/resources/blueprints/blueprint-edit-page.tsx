'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import type { Blueprint, UpdateBlueprintDto } from '@/types/blueprint';

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

  // Acessar o estado do formulário para verificar modificações
  const { isDirty } = form.formState;

  // Carregar dados do blueprint - com controle para evitar múltiplas chamadas
  useEffect(() => {
    // Referência para controle de chamada da API
    let isMounted = true;

    async function loadBlueprint() {
      if (!blueprintId) {
        toast.error(t('toast.error.title'), {
          description: t('errors.missingId'),
        });
        router.push('/resources/blueprints');

        return;
      }

      setIsLoading(true);

      try {
        // Verificar se o blueprint já foi carregado com o mesmo ID
        // Isso evita fazer chamadas duplicadas para a API
        if (blueprint && blueprint.id === blueprintId) {
          setIsLoading(false);

          return;
        }

        const loadedBlueprint = await getBlueprint(blueprintId);

        // Verificar se o componente ainda está montado
        if (!isMounted) {
          return;
        }

        if (!loadedBlueprint) {
          throw new Error(`Blueprint with id ${blueprintId} not found`);
        }

        setBlueprint(loadedBlueprint);

        // Mapear variáveis do formato da API para o formato do formulário
        const mappedVariables =
          loadedBlueprint.variables?.map((v) => ({
            name: v.name,
            type: 'simple' as const, // Assumindo tipo simples como padrão
            description: v.description,
            value: v.defaultValue,
          })) || [];

        // Atualizar valores do formulário apenas se o componente ainda estiver montado
        if (isMounted) {
          form.reset({
            name: loadedBlueprint.name,
            description: loadedBlueprint.description || '',
            applicationId: loadedBlueprint.applicationId,
            selectedTemplates: loadedBlueprint.childTemplates || [],
            blueprintVariables: mappedVariables,
          });
        }
      } catch (error) {
        // Verificar se o componente ainda está montado
        if (!isMounted) {
          return;
        }

        // Erro específico se o blueprint não for encontrado
        if (error instanceof Error && error.message.includes('not found')) {
          toast.error(t('errors.notFound'), {
            description: t('errors.notFoundWithId', { id: blueprintId }),
          });
        } else {
          // Outros erros de carregamento
          toast.error(t('toast.error.title'), {
            description: t('errors.loadError'),
          });
        }

        router.push('/resources/blueprints');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBlueprint();

    // Função de limpeza do useEffect
    return () => {
      isMounted = false;
    };
  }, [blueprintId, router, t, getBlueprint, blueprint, form]);

  // Função para salvar o blueprint
  async function onSave(data: FormValues) {
    if (!blueprint) {
      return;
    }

    try {
      setIsSaving(true);

      // Mapear as variáveis para o formato esperado pela API
      const mappedVariables = data.blueprintVariables?.map((v) => ({
        name: v.name,
        type: 'string' as const, // Usando 'string' como padrão
        description: v.description,
        defaultValue: v.value,
        required: true, // Assumindo que todas são obrigatórias por padrão
        options: [], // Campo opcional para valores enumerados
      }));

      // Preparar dados para atualização
      const blueprintData: UpdateBlueprintDto = {
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
        })),
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
    <div className="px-6 py-6" data-testid="blueprint-edit-page">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/resources/blueprints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-40" />
              ) : (
                t('edit.title', { name: blueprint?.name })
              )}
            </h1>
            <p className="text-muted-foreground">{t('edit.description')}</p>
          </div>
        </div>
        <Button
          onClick={form.handleSubmit(onSave)}
          disabled={isLoading || isSaving || !isDirty}
          title={!isDirty ? t('editBlueprint.buttons.noChanges') : ''}
          data-testid="save-blueprint-button"
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              {t('common:messages.loading')}
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
                <CardTitle>{t('sections.basicInfo')}</CardTitle>
                <CardDescription>{t('basicInfo.sectionDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoStep form={form} />
              </CardContent>
            </Card>

            {/* Seção de Templates */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.templates')}</CardTitle>
                <CardDescription>{t('templates.sectionDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesStep form={form} />
              </CardContent>
            </Card>

            {/* Seção de Variáveis */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.variables')}</CardTitle>
                <CardDescription>{t('variables.sectionDescription')}</CardDescription>
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
