'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  GitBranch,
  GitFork,
  Loader2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Campo Nome e Descrição */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do template" {...field} />
                    </FormControl>
                    <FormDescription>Nome descritivo para identificar o template</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do template"
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Breve descrição sobre o propósito deste template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Repositório Git e Branch na mesma linha */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <FormField
                control={form.control}
                name="gitRepositoryId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Repositório Git</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingRepos}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <div className="flex flex-1 items-center">
                            <GitFork className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Selecione um repositório" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingRepos ? (
                          <div className="flex items-center justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : repositories.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhum repositório encontrado
                          </div>
                        ) : (
                          repositories.map((repo) => (
                            <SelectItem key={repo.id} value={repo.id}>
                              {repo.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Repositório Git que contém o chart Helm</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!gitRepositoryId || isLoadingBranches}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <div className="flex flex-1 items-center">
                            <GitBranch className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Selecione um branch" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingBranches ? (
                          <div className="flex items-center justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : branches.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhum branch encontrado
                          </div>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.name} value={branch.name}>
                              {branch.name} {branch.isDefault && '(padrão)'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Branch do repositório a ser utilizada</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Caminho do Chart */}
          <div>
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caminho do Chart</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="charts/app"
                      {...field}
                      className="flex-1"
                    />
                  </FormControl>
                  <FormDescription>
                    Caminho relativo dentro do repositório onde o chart está localizado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botão de Salvar com indicadores de status ao lado */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {validationAttempted && (
            <>
              {isValidating ? (
                <div className="flex items-center text-muted-foreground">
                  <Spinner size="sm" className="mr-2" />
                  <span className="text-sm">Validando template...</span>
                </div>
              ) : validationError ? (
                <div className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">{validationError}</span>
                </div>
              ) : chartInfo?.isValid ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="text-sm">Template válido</span>
                </div>
              ) : chartInfo && !chartInfo.isValid ? (
                <div className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">Template inválido</span>
                </div>
              ) : null}
            </>
          )}

          <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Template'
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
