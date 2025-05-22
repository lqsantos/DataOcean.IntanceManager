'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, GitBranch, GitFork, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useGitNavigation } from '@/hooks/use-git-navigation';
import { useTemplateFormValidation } from '@/hooks/use-template-form-validation';
import { cn } from '@/lib/utils';
import type { CreateTemplateDto } from '@/types/template';

import { TemplatePreviewModal } from './template-preview-modal';

// Form schema com validação - movido para fora do componente para evitar recriações
const templateFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().optional(),
  gitRepositoryId: z.string().min(1, 'O repositório é obrigatório'),
  branch: z.string().min(1, 'O branch é obrigatório'),
  path: z.string().min(1, 'O caminho é obrigatório'),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface CreateTemplateFormProps {
  onCreateSuccess: () => void;
  createTemplate: (values: CreateTemplateDto) => Promise<void>;
}

/**
 * Componente de formulário para criação de templates
 * Com otimizações de performance e separação de responsabilidades
 */
export function CreateTemplateForm({ onCreateSuccess, createTemplate }: CreateTemplateFormProps) {
  // Estado para o modal de pré-visualização
  const [showPreview, setShowPreview] = useState(false);

  // Configuração do formulário - memoizada para evitar recálculos
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      gitRepositoryId: '',
      branch: '',
      path: '',
    },
  });

  // Valores do formulário para validação e navegação - memoizados
  const formValues = form.watch();
  const { gitRepositoryId, branch, path } = formValues;

  // Hooks para manipulação de repositório Git - agora com valores memoizados
  const {
    repositories,
    branches,
    isLoadingRepos,
    isLoadingBranches,
    fetchRepositories,
    fetchBranches,
    fetchTreeStructure,
  } = useGitNavigation();

  // Hook de validação de template - separada do componente principal
  const {
    chartInfo,
    preview,
    isValidating,
    validationError,
    isSubmitting,
    validationAttempted,
    setIsSubmitting,
    validateTemplateAuto,
    resetFormValidation,
  } = useTemplateFormValidation({
    gitRepositoryId,
    branch,
    path,
  });

  // Carregar repositórios ao montar o componente - memoizado
  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Carregar branches quando o repositório mudar - memoizado
  useEffect(() => {
    if (gitRepositoryId) {
      fetchBranches(gitRepositoryId);
      form.setValue('branch', '');
      form.setValue('path', '');
      resetFormValidation();
    }
  }, [gitRepositoryId, fetchBranches, form, resetFormValidation]);

  // Carregar estrutura do diretório quando branch mudar - memoizado
  useEffect(() => {
    if (gitRepositoryId && branch) {
      fetchTreeStructure(gitRepositoryId, branch);
      form.setValue('path', '');
      resetFormValidation();
    }
  }, [gitRepositoryId, branch, fetchTreeStructure, form, resetFormValidation]);

  // Atualizar o nome com nome sugerido do chart após validação bem-sucedida - memoizado
  useEffect(() => {
    if (chartInfo?.isValid && chartInfo?.name && !form.getValues('name')) {
      form.setValue('name', chartInfo.name);
    }
  }, [chartInfo, form]);

  // Função para enviar o formulário - memoizada
  const onSubmit = useCallback(
    async (values: TemplateFormValues) => {
      setIsSubmitting(true);

      // Executar validação antes de salvar
      await validateTemplateAuto();

      // Só salvar se o template for válido
      if (chartInfo?.isValid) {
        try {
          await createTemplate(values);
          onCreateSuccess();
        } catch (error) {
          console.error('Erro ao criar template:', error);
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }
    },
    [chartInfo?.isValid, createTemplate, onCreateSuccess, setIsSubmitting, validateTemplateAuto]
  );

  // Memoizando os componentes de status de validação para evitar re-renderizações
  const validationStatus = useMemo(() => {
    if (!validationAttempted) {
      return null;
    }

    if (isValidating) {
      return (
        <div className="flex animate-pulse items-center rounded-md bg-primary/5 px-3 py-1.5 text-foreground/80">
          <Spinner size="sm" className="mr-2 text-primary" />
          <span className="text-sm">Validando template...</span>
        </div>
      );
    }

    if (validationError) {
      return (
        <div className="flex items-center rounded-md bg-destructive/5 px-3 py-1.5 text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span className="text-sm">{validationError}</span>
        </div>
      );
    }

    if (chartInfo?.isValid) {
      return (
        <div className="flex items-center rounded-md bg-green-50 px-3 py-1.5 text-green-600">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          <span className="text-sm">Template válido</span>
        </div>
      );
    }

    if (chartInfo && !chartInfo.isValid) {
      return (
        <div className="flex items-center rounded-md bg-destructive/5 px-3 py-1.5 text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span className="text-sm">Template inválido</span>
        </div>
      );
    }

    return null;
  }, [validationAttempted, isValidating, validationError, chartInfo]);

  // Classes do botão memoizadas
  const buttonClasses = useMemo(
    () =>
      cn(
        'relative min-w-[140px] overflow-hidden transition-all',
        'bg-gradient-to-r from-primary to-primary/90',
        'hover:from-primary/90 hover:to-primary hover:shadow-md'
      ),
    []
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative z-10 space-y-5"
        data-testid="template-create-form"
      >
        {/* Nome do Template */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="transition-all duration-200 focus-within:shadow-sm">
              <FormLabel className="text-sm font-medium text-foreground/90">
                Nome do Template
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do template"
                  {...field}
                  data-testid="template-name-input"
                  className="transition-shadow duration-200 focus:border-primary focus:shadow-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Repositório Git */}
        <FormField
          control={form.control}
          name="gitRepositoryId"
          render={({ field }) => (
            <FormItem className="group w-full">
              <FormLabel className="text-sm font-medium text-foreground/90">
                Repositório Git
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingRepos}
                data-testid="template-repo-select"
              >
                <FormControl>
                  <SelectTrigger
                    className="w-full transition-all duration-200 focus:shadow-md group-hover:border-primary/50"
                    data-testid="template-repo-trigger"
                  >
                    <div className="flex flex-1 items-center">
                      <GitFork className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione um repositório" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]" position="popper">
                  {isLoadingRepos ? (
                    <div className="flex items-center justify-center p-4">
                      <Spinner size="sm" className="text-primary" />
                    </div>
                  ) : repositories.length === 0 ? (
                    <div className="p-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted p-2">
                        <GitFork className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nenhum repositório encontrado</p>
                    </div>
                  ) : (
                    repositories.map((repo) => (
                      <SelectItem
                        key={repo.id}
                        value={repo.id}
                        className="transition-colors duration-150 hover:bg-primary/5"
                        data-testid={`repo-option-${repo.id}`}
                      >
                        {repo.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch */}
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem className="group w-full">
              <FormLabel className="text-sm font-medium text-foreground/90">Branch</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!gitRepositoryId || isLoadingBranches}
                data-testid="template-branch-select"
              >
                <FormControl>
                  <SelectTrigger
                    className="w-full transition-all duration-200 focus:shadow-md group-hover:border-primary/50"
                    data-testid="template-branch-trigger"
                  >
                    <div className="flex flex-1 items-center">
                      <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione um branch" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]" position="popper">
                  {isLoadingBranches ? (
                    <div className="flex items-center justify-center p-4">
                      <Spinner size="sm" className="text-primary" />
                    </div>
                  ) : branches.length === 0 ? (
                    <div className="p-4 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted p-2">
                        <GitBranch className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nenhum branch encontrado</p>
                    </div>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem
                        key={branch.name}
                        value={branch.name}
                        className="transition-colors duration-150 hover:bg-primary/5"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span>{branch.name}</span>
                          {branch.isDefault && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                              padrão
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Caminho do Chart */}
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem className="transition-all duration-200 focus-within:shadow-sm">
              <FormLabel className="text-sm font-medium text-foreground/90">
                Caminho do Chart
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="charts/app"
                    {...field}
                    data-testid="template-path-input"
                    className="pl-9 transition-shadow duration-200 focus:border-primary focus:shadow-md"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <div className="font-mono text-sm text-muted-foreground">/</div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormLabel className="text-sm font-medium text-foreground/90">
                    Descrição
                  </FormLabel>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                    Opcional
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {field.value?.length || 0} caracteres
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Breve descrição sobre o template..."
                  {...field}
                  data-testid="template-description-input"
                  className="h-20 resize-none transition-shadow duration-200 focus:border-primary focus:shadow-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Separador sutil antes dos controles de ação */}
        <div className="my-2 h-px w-full bg-border" />

        {/* Botão de Salvar com indicadores de status */}
        <div className="flex items-center justify-end gap-3">
          {validationStatus && (
            <div data-testid="template-validation-status">{validationStatus}</div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={buttonClasses}
            data-testid="template-submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <span className="mr-1">Salvar Template</span>
              </>
            )}
          </Button>
        </div>

        <TemplatePreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          preview={preview}
          chartInfo={chartInfo}
        />
      </form>
    </Form>
  );
}
