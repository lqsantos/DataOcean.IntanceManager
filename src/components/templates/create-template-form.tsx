'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, GitBranch, GitFork, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { useTemplateValidation } from '@/hooks/use-template-validation';
import { cn } from '@/lib/utils';
import type { CreateTemplateDto } from '@/types/template';

import { TemplatePreviewModal } from './template-preview-modal';

// Form schema com validação
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

export function CreateTemplateForm({ onCreateSuccess, createTemplate }: CreateTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [shouldShowToast, setShouldShowToast] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastShownRef = useRef(false);

  // Configuração do formulário
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

  // Hooks para manipulação de repositório Git e validação
  const {
    repositories,
    branches,
    treeItems,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingTree,
    fetchRepositories,
    fetchBranches,
    fetchTreeStructure,
  } = useGitNavigation();

  const {
    chartInfo,
    preview,
    isValidating,
    isLoadingPreview,
    validationError,
    validateChart,
    getPreview,
    resetValidation,
  } = useTemplateValidation();

  // Valores do formulário para validação e navegação
  const gitRepositoryId = form.watch('gitRepositoryId');
  const branch = form.watch('branch');
  const path = form.watch('path');

  // Carregar repositórios ao montar o componente
  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Carregar branches quando o repositório mudar
  useEffect(() => {
    if (gitRepositoryId) {
      fetchBranches(gitRepositoryId);
      form.setValue('branch', '');
      form.setValue('path', '');
      resetValidation();
    }
  }, [gitRepositoryId, fetchBranches, form, resetValidation]);

  // Carregar estrutura do diretório quando branch mudar
  useEffect(() => {
    if (gitRepositoryId && branch) {
      fetchTreeStructure(gitRepositoryId, branch);
      form.setValue('path', '');
      resetValidation();
      setValidationAttempted(false);
    }
  }, [gitRepositoryId, branch, fetchTreeStructure, form, resetValidation]);

  // Auto-validar quando o caminho mudar, com debounce
  useEffect(() => {
    if (gitRepositoryId && branch && path) {
      // Limpar timeout anterior se existir
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Configurar novo timeout (debounce de 500ms)
      validationTimeoutRef.current = setTimeout(() => {
        validateTemplateAuto();
        // Apenas habilita a exibição do toast quando a validação for explicitamente solicitada
        setShouldShowToast(true);
        toastShownRef.current = false;
      }, 1000);
    }

    // Cleanup do timeout quando o componente desmontar ou as dependências mudarem
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [gitRepositoryId, branch, path]);

  // Atualizar o nome com nome sugerido do chart após validação bem-sucedida
  useEffect(() => {
    if (chartInfo?.isValid && chartInfo?.name && !form.getValues('name')) {
      form.setValue('name', chartInfo.name);
    }
  }, [chartInfo, form]);

  // Efeito para mostrar toast quando o template for inválido
  useEffect(() => {
    if (
      validationAttempted &&
      !isValidating &&
      chartInfo &&
      !chartInfo.isValid &&
      shouldShowToast &&
      !toastShownRef.current
    ) {
      toast.error('Template inválido', {
        description: (
          <div>
            <p>{chartInfo.validationMessage}</p>
            <div className="mt-2">
              <ul className="list-inside space-y-1">
                {chartInfo.requiredFiles?.map((file) => (
                  <li key={file.name} className="flex items-center gap-1">
                    {file.exists ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    )}
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
        duration: 5000,
      });

      // Marca que o toast já foi mostrado para esta validação
      toastShownRef.current = true;
      // Desabilita novas exibições automáticas até a próxima validação explícita
      setShouldShowToast(false);
    }
  }, [chartInfo, isValidating, validationAttempted, shouldShowToast]);

  // Função para validar o template - agora será usada automaticamente quando o caminho mudar
  const validateTemplateAuto = async () => {
    if (gitRepositoryId && branch && path) {
      setValidationAttempted(true);
      await validateChart(gitRepositoryId, branch, path);
      await getPreview(gitRepositoryId, branch, path);
    }
  };

  // Função para enviar o formulário
  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);

    // Limpar timeout se existir
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Habilitar exibição de toast para a validação final
    setShouldShowToast(true);
    toastShownRef.current = false;

    // Executar validação antes de salvar
    await validateTemplateAuto();

    // Só salvar se o template for válido
    if (chartInfo?.isValid) {
      try {
        await createTemplate(values);
        onCreateSuccess();
      } catch (error) {
        console.error('Erro ao criar template:', error);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 space-y-5">
        {/* Nome do Template com destaque */}
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
                  className="transition-shadow duration-200 focus:border-primary focus:shadow-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Repositório Git com efeito de hover */}
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
              >
                <FormControl>
                  <SelectTrigger className="w-full transition-all duration-200 focus:shadow-md group-hover:border-primary/50">
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

        {/* Branch com estilização idêntica */}
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
              >
                <FormControl>
                  <SelectTrigger className="w-full transition-all duration-200 focus:shadow-md group-hover:border-primary/50">
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

        {/* Descrição com contador de caracteres e indicação de campo opcional */}
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
          {validationAttempted && (
            <>
              {isValidating ? (
                <div className="flex animate-pulse items-center rounded-md bg-primary/5 px-3 py-1.5 text-foreground/80">
                  <Spinner size="sm" className="mr-2 text-primary" />
                  <span className="text-sm">Validando template...</span>
                </div>
              ) : validationError ? (
                <div className="flex items-center rounded-md bg-destructive/5 px-3 py-1.5 text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">{validationError}</span>
                </div>
              ) : chartInfo?.isValid ? (
                <div className="flex items-center rounded-md bg-green-50 px-3 py-1.5 text-green-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="text-sm">Template válido</span>
                </div>
              ) : chartInfo && !chartInfo.isValid ? (
                <div className="flex items-center rounded-md bg-destructive/5 px-3 py-1.5 text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">Template inválido</span>
                </div>
              ) : null}
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'relative min-w-[140px] overflow-hidden transition-all',
              'bg-gradient-to-r from-primary to-primary/90',
              'hover:from-primary/90 hover:to-primary hover:shadow-md'
            )}
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
