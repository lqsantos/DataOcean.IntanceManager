'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileCode2,
  GitBranch,
  GitFork,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

import { GitDirectoryBrowserModal } from './git-directory-browser-modal';
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
    }
  }, [gitRepositoryId, branch, fetchTreeStructure, form, resetValidation]);

  // Atualizar o nome com nome sugerido do chart após validação bem-sucedida
  useEffect(() => {
    if (chartInfo?.isValid && chartInfo?.name && !form.getValues('name')) {
      form.setValue('name', chartInfo.name);
    }
  }, [chartInfo, form]);

  // Função para validar o template
  const handleValidate = async () => {
    setValidationAttempted(true);

    if (gitRepositoryId && branch && path) {
      await validateChart(gitRepositoryId, branch, path);
      await getPreview(gitRepositoryId, branch, path);
    }
  };

  // Função para abrir navegador de diretórios
  const handleOpenDirectoryBrowser = () => {
    setShowDirectoryBrowser(true);
  };

  // Função para selecionar caminho no navegador de diretórios
  const handleSelectPath = (selectedPath: string) => {
    form.setValue('path', selectedPath);
    setShowDirectoryBrowser(false);
  };

  // Função para enviar o formulário
  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);

    try {
      await createTemplate(values);
      onCreateSuccess();
    } catch (error) {
      console.error('Erro ao criar template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Seção de Identificação */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <FormDescription className="text-xs">
                      Nome descritivo para identificar o template
                    </FormDescription>
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
                        className="min-h-[70px] resize-none"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Breve descrição sobre o propósito deste template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção de Repositório */}
          <div>
            <FormField
              control={form.control}
              name="gitRepositoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repositório Git</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingRepos}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <GitFork className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Selecione um repositório" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingRepos ? (
                        <div className="flex items-center justify-center p-2">
                          <Spinner size="sm" />
                        </div>
                      ) : repositories.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground">
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
                  <FormDescription className="text-xs">
                    Repositório Git que contém o chart Helm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Seção de Branch e Caminho */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!gitRepositoryId || isLoadingBranches}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <GitBranch className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Selecione um branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingBranches ? (
                          <div className="flex items-center justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : branches.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground">
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
                    <FormDescription className="text-xs">
                      Branch do repositório a ser utilizada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caminho do Chart</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="charts/app" {...field} className="flex-1" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleOpenDirectoryBrowser}
                        disabled={!gitRepositoryId || !branch}
                        title="Navegar"
                        className="h-10 w-10 flex-shrink-0"
                      >
                        <FileCode2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription className="text-xs">
                      Caminho relativo dentro do repositório onde o chart está localizado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção de Validação e Pré-visualização */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <Button
                type="button"
                variant="outline"
                className="flex gap-2"
                onClick={handleValidate}
                disabled={!gitRepositoryId || !branch || !path || isValidating}
              >
                {isValidating ? <Spinner size="sm" /> : <CheckCircle2 className="h-4 w-4" />}
                {isValidating ? 'Validando...' : 'Validar Template'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!chartInfo?.isValid || isLoadingPreview}
                className="flex gap-2"
              >
                <Eye className="h-4 w-4" />
                Pré-visualizar
              </Button>
            </div>

            {/* Área de resultado da validação */}
            {validationAttempted && (
              <div>
                {isValidating ? (
                  <Alert>
                    <Spinner size="sm" className="mr-2" />
                    <AlertTitle>Validando template</AlertTitle>
                    <AlertDescription>Aguarde enquanto verificamos o template...</AlertDescription>
                  </Alert>
                ) : validationError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro de validação</AlertTitle>
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                ) : chartInfo?.isValid ? (
                  <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Template válido</AlertTitle>
                    <AlertDescription>
                      <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                          <span className="font-medium">Nome:</span> {chartInfo.name}
                        </div>
                        <div>
                          <span className="font-medium">Versão:</span> {chartInfo.version}
                        </div>
                        {chartInfo.description && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Descrição:</span> {chartInfo.description}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : chartInfo ? (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Template inválido</AlertTitle>
                    <AlertDescription>
                      <p>{chartInfo.validationMessage}</p>
                      <div className="mt-2">
                        <ul className="list-inside space-y-1">
                          {chartInfo.requiredFiles?.map((file) => (
                            <li key={file.name} className="flex items-center gap-1 text-sm">
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
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Botão de Salvar - ajustado para ficar no canto direito */}
        <div className="mt-8 flex justify-end">
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

        {/* Modal de navegação no repositório */}
        <GitDirectoryBrowserModal
          open={showDirectoryBrowser}
          onOpenChange={setShowDirectoryBrowser}
          treeItems={treeItems}
          isLoading={isLoadingTree}
          onSelectPath={handleSelectPath}
        />

        {/* Modal de pré-visualização */}
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
