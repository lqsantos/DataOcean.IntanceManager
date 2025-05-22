'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileCode2, GitBranch, GitFork, Loader2, ServerCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useGitNavigation } from '@/hooks/use-git-navigation';
import { usePAT } from '@/hooks/use-pat';
import { useTemplateValidation } from '@/hooks/use-template-validation';
import { cn } from '@/lib/utils';
import type { CreateTemplateDto, Template, UpdateTemplateDto } from '@/types/template';

import { TemplateValidationStatus } from './template-validation-status';

// Form schema with validation
const templateFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().optional(),
  gitRepositoryId: z.string().min(1, 'O repositório é obrigatório'),
  branch: z.string().min(1, 'O branch é obrigatório'),
  path: z.string().min(1, 'O caminho é obrigatório'),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template?: Template;
  onSubmit: (values: CreateTemplateDto | UpdateTemplateDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  'data-testid'?: string;
}

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
  'data-testid': dataTestId = 'template-form',
}: TemplateFormProps) {
  const [activeStep, setActiveStep] = useState<'provider' | 'location' | 'details'>(
    template ? 'details' : 'provider'
  );
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const { isConfigured: hasPat, openPatModal } = usePAT();

  const {
    repositories,
    branches,
    treeItems,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingTree,
    error: gitError,
    fetchRepositories,
    fetchBranches,
    fetchTreeStructure,
    getRepositoryUrl,
  } = useGitNavigation();

  const {
    chartInfo,
    preview,
    isValidating,
    isLoadingPreview,
    validationError,
    previewError,
    validateChart,
    getPreview,
    resetValidation,
  } = useTemplateValidation();

  // Set up form with default values
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      gitRepositoryId: template?.gitRepositoryId || '',
      branch: template?.branch || '',
      path: template?.path || '',
    },
    mode: 'onTouched',
  });

  // Verificar se o formulário está válido
  const isFormValid = form.formState.isValid;

  // Track form values for validation and preview
  const gitRepositoryId = form.watch('gitRepositoryId');
  const branch = form.watch('branch');
  const path = form.watch('path');

  // Auto-advance wizard when selections are made
  useEffect(() => {
    if (gitRepositoryId && branch && activeStep === 'provider') {
      setActiveStep('location');
    }
  }, [gitRepositoryId, branch, activeStep]);

  // Auto-advance to details step when path is selected and chart is valid
  useEffect(() => {
    if (path && chartInfo?.isValid && activeStep === 'location') {
      setActiveStep('details');
    }
  }, [path, chartInfo, activeStep]);

  // Load repositories on component mount
  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Check for PAT on component mount
  useEffect(() => {
    if (!hasPat) {
      toast.error(
        'Personal Access Token (PAT) não configurado. Configure para acessar repositórios privados.',
        {
          action: {
            label: 'Configurar PAT',
            onClick: openPatModal,
          },
        }
      );
    }
  }, [hasPat, openPatModal]);

  // Load branches when repository changes
  useEffect(() => {
    if (gitRepositoryId) {
      fetchBranches(gitRepositoryId);
      form.setValue('branch', '');
      form.setValue('path', '');
      resetValidation();
    }
  }, [gitRepositoryId, fetchBranches, form, resetValidation]);

  // Load root directory when branch changes
  useEffect(() => {
    if (gitRepositoryId && branch) {
      fetchTreeStructure(gitRepositoryId, branch);
      form.setValue('path', '');
      resetValidation();
    }
  }, [gitRepositoryId, branch, fetchTreeStructure, form, resetValidation]);

  // Auto-validate and preview when path changes
  useEffect(() => {
    if (gitRepositoryId && branch && path) {
      validateChart(gitRepositoryId, branch, path);
      getPreview(gitRepositoryId, branch, path);
    }
  }, [gitRepositoryId, branch, path, validateChart, getPreview]);

  // Update name field with suggested name from chartInfo
  useEffect(() => {
    if (chartInfo?.isValid && chartInfo?.name && !template) {
      form.setValue('name', chartInfo.name);
    }
  }, [chartInfo, form, template]);

  // Handle form submission
  const handleSubmit = async (values: TemplateFormValues) => {
    setAttemptedSubmit(true);

    // Validate chart before submission
    if (!chartInfo?.isValid) {
      toast.error('O template precisa ser válido para continuar.');

      // Add a data attribute to indicate validation failure for testing
      const formElement = document.querySelector(`[data-testid="${dataTestId}"]`);

      if (formElement) {
        formElement.setAttribute('data-validation-error', 'chart-invalid');
      }

      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);

      // Add a data attribute to indicate submission error for testing
      const formElement = document.querySelector(`[data-testid="${dataTestId}"]`);

      if (formElement) {
        formElement.setAttribute('data-submission-error', 'true');
      }
    }
  };

  // Helper function to go to next step
  const nextStep = async () => {
    if (activeStep === 'provider') {
      const isValid = await form.trigger(['gitRepositoryId', 'branch']);

      if (isValid) {
        setActiveStep('location');
      }
    } else if (activeStep === 'location') {
      const isValid = await form.trigger('path');

      if (isValid) {
        setActiveStep('details');
      }
    }
  };

  // Helper function to go to previous step
  const prevStep = () => {
    if (activeStep === 'location') {
      setActiveStep('provider');
    } else if (activeStep === 'details') {
      setActiveStep('location');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid={dataTestId}
        data-form-state={isSubmitting ? 'submitting' : 'idle'}
        data-validation-status={chartInfo?.isValid ? 'valid' : chartInfo ? 'invalid' : 'pending'}
        data-is-edit-mode={template ? 'true' : 'false'}
        data-active-step={activeStep}
      >
        {/* Removendo o Alert de PAT ausente */}

        {!template && (
          <Tabs value={activeStep} className="w-full" data-testid="template-wizard-tabs">
            <TabsList
              className="mb-6 grid w-full grid-cols-3"
              data-testid="template-wizard-tabslist"
            >
              <TabsTrigger
                value="provider"
                onClick={() => setActiveStep('provider')}
                className={cn(
                  activeStep === 'provider' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="template-wizard-tab-provider"
              >
                1. Escolha o Repositório
              </TabsTrigger>
              <TabsTrigger
                value="location"
                onClick={() => activeStep !== 'provider' && setActiveStep('location')}
                disabled={!form.getValues('gitRepositoryId') || !form.getValues('branch')}
                className={cn(
                  activeStep === 'location' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="template-wizard-tab-location"
              >
                2. Localização do Template
              </TabsTrigger>
              <TabsTrigger
                value="details"
                onClick={() => activeStep === 'details' && setActiveStep('details')}
                disabled={activeStep !== 'details'}
                className={cn(
                  activeStep === 'details' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="template-wizard-tab-details"
              >
                3. Detalhes do Template
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Repository Selection */}
            <TabsContent
              value="provider"
              className="mt-0"
              data-testid="template-wizard-content-provider"
            >
              <Card data-testid="template-provider-card">
                <CardHeader>
                  <CardTitle>Selecione o Repositório</CardTitle>
                  <CardDescription>
                    Escolha o repositório e o branch para o template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="gitRepositoryId"
                    render={({ field }) => (
                      <FormItem data-testid={`${dataTestId}-repo-field`}>
                        <FormLabel>Repositório Git</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingRepos || isSubmitting}
                          data-testid={`${dataTestId}-repo-select`}
                        >
                          <FormControl>
                            <SelectTrigger className="flex items-center">
                              <GitFork className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selecione um repositório" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent data-testid={`${dataTestId}-repo-options`}>
                            {repositories.map((repo) => (
                              <SelectItem
                                key={repo.id}
                                value={repo.id}
                                data-testid={`repo-option-${repo.id}`}
                              >
                                {repo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecione o repositório Git contendo o template Helm.
                        </FormDescription>
                        <FormMessage data-testid={`${dataTestId}-repo-error`} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem data-testid={`${dataTestId}-branch-field`}>
                        <FormLabel>Branch</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!gitRepositoryId || isLoadingBranches || isSubmitting}
                          data-testid={`${dataTestId}-branch-select`}
                        >
                          <FormControl>
                            <SelectTrigger className="flex items-center">
                              <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selecione um branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent data-testid={`${dataTestId}-branch-options`}>
                            {branches.map((branch) => (
                              <SelectItem
                                key={branch.name}
                                value={branch.name}
                                data-testid={`branch-option-${branch.name}`}
                              >
                                {branch.name} {branch.isDefault && '(padrão)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Selecione o branch que contém o template.</FormDescription>
                        <FormMessage data-testid={`${dataTestId}-branch-error`} />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    data-testid="cancel-button"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!gitRepositoryId || !branch}
                    data-testid="next-step-button"
                  >
                    Próximo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 2: Template Location */}
            <TabsContent
              value="location"
              className="mt-0"
              data-testid="template-wizard-content-location"
            >
              <Card data-testid="template-location-card">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCode2 className="mr-2 h-5 w-5" />
                    <CardTitle>Localização do Template</CardTitle>
                  </div>
                  <CardDescription>
                    Insira o caminho para o template Helm no repositório
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="path"
                    render={({ field }) => (
                      <FormItem data-testid={`${dataTestId}-path-field`}>
                        <FormLabel>Caminho do Template</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Caminho do template"
                            disabled={isSubmitting}
                            data-testid="path-input"
                            className="flex-1"
                          />
                        </FormControl>
                        <FormDescription>
                          Digite o caminho para o diretório contendo o Chart.yaml.
                        </FormDescription>
                        <FormMessage data-testid={`${dataTestId}-path-error`} />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    data-testid="prev-step-button"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!path || !chartInfo?.isValid}
                    data-testid="next-step-button"
                  >
                    Próximo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 3: Template Details */}
            <TabsContent
              value="details"
              className="mt-0"
              data-testid="template-wizard-content-details"
            >
              <Card data-testid="template-details-card">
                <CardHeader>
                  <CardTitle>Detalhes do Template</CardTitle>
                  <CardDescription>Finalize o cadastro com informações adicionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem data-testid={`${dataTestId}-name-field`}>
                        <FormLabel>Nome do Template</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome do template"
                            disabled={isSubmitting}
                            data-testid="name-input"
                          />
                        </FormControl>
                        <FormDescription>
                          Nome descritivo para identificar o template
                          {chartInfo?.isValid && chartInfo?.name && !field.value && (
                            <span className="ml-1 font-medium text-green-600">
                              (sugerido: {chartInfo.name})
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage data-testid={`${dataTestId}-name-error`} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem data-testid={`${dataTestId}-description-field`}>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descrição do template (opcional)"
                            disabled={isSubmitting}
                            data-testid="description-input"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Descrição opcional para fornecer mais detalhes sobre o template.
                        </FormDescription>
                        <FormMessage data-testid={`${dataTestId}-description-error`} />
                      </FormItem>
                    )}
                  />

                  {/* Resumo do template selecionado */}
                  <div className="rounded-md border border-border bg-muted/20 p-4">
                    <h3 className="mb-2 text-sm font-medium">Resumo do Template</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground">Repositório:</p>
                        <p className="font-medium">
                          {repositories.find((r) => r.id === gitRepositoryId)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Branch:</p>
                        <p className="font-medium">{branch}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Caminho:</p>
                        <p className="font-medium">{path}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Chart:</p>
                        <p className="font-medium">
                          {chartInfo?.name} (v{chartInfo?.version})
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    data-testid="prev-step-button"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || (attemptedSubmit && !isFormValid) || !chartInfo?.isValid
                    }
                    data-testid="submit-button"
                    className="min-w-[140px]"
                    onClick={() => {
                      if (!isFormValid) {
                        setAttemptedSubmit(true);
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          data-testid={`${dataTestId}-loading-indicator`}
                        />
                        Criando...
                      </>
                    ) : (
                      <>
                        <ServerCog className="mr-2 h-4 w-4" />
                        Criar Template
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Modo de edição - formulário simplificado */}
        {template && (
          <Card data-testid="template-edit-card">
            <CardHeader>
              <div className="flex items-center">
                <ServerCog className="mr-2 h-5 w-5" />
                <CardTitle>Editar Template</CardTitle>
              </div>
              <CardDescription>Atualize as informações do template {template.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem data-testid={`${dataTestId}-name-field`}>
                      <FormLabel>Nome do Template</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome do template"
                          disabled={isSubmitting}
                          data-testid="name-input"
                        />
                      </FormControl>
                      <FormDescription>Nome descritivo para identificar o template</FormDescription>
                      <FormMessage data-testid={`${dataTestId}-name-error`} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem data-testid={`${dataTestId}-description-field`}>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descrição do template (opcional)"
                          disabled={isSubmitting}
                          data-testid="description-input"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição opcional para fornecer mais detalhes sobre o template.
                      </FormDescription>
                      <FormMessage data-testid={`${dataTestId}-description-error`} />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gitRepositoryId"
                render={({ field }) => (
                  <FormItem data-testid={`${dataTestId}-repo-field`}>
                    <FormLabel>Repositório Git</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingRepos || isSubmitting}
                      data-testid={`${dataTestId}-repo-select`}
                    >
                      <FormControl>
                        <SelectTrigger className="flex items-center">
                          <GitFork className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione um repositório" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent data-testid={`${dataTestId}-repo-options`}>
                        {repositories.map((repo) => (
                          <SelectItem
                            key={repo.id}
                            value={repo.id}
                            data-testid={`repo-option-${repo.id}`}
                          >
                            {repo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Repositório Git contendo o template Helm</FormDescription>
                    <FormMessage data-testid={`${dataTestId}-repo-error`} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem data-testid={`${dataTestId}-branch-field`}>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!gitRepositoryId || isLoadingBranches || isSubmitting}
                      data-testid={`${dataTestId}-branch-select`}
                    >
                      <FormControl>
                        <SelectTrigger className="flex items-center">
                          <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione um branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent data-testid={`${dataTestId}-branch-options`}>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.name}
                            value={branch.name}
                            data-testid={`branch-option-${branch.name}`}
                          >
                            {branch.name} {branch.isDefault && '(padrão)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Branch que contém o template</FormDescription>
                    <FormMessage data-testid={`${dataTestId}-branch-error`} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem data-testid={`${dataTestId}-path-field`} className="md:col-span-2">
                    <FormLabel>Caminho do Template</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Caminho do template"
                        disabled={isSubmitting}
                        data-testid="path-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Caminho para o diretório contendo o Chart.yaml
                    </FormDescription>
                    <FormMessage data-testid={`${dataTestId}-path-error`} />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <TemplateValidationStatus
                  chartInfo={chartInfo}
                  isValidating={isValidating}
                  error={validationError}
                  data-testid={`${dataTestId}-validation-status`}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                data-testid="cancel-button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (attemptedSubmit && !isFormValid) || !chartInfo?.isValid}
                data-testid="submit-button"
                className="min-w-[140px]"
                onClick={() => {
                  if (!isFormValid) {
                    setAttemptedSubmit(true);
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-testid={`${dataTestId}-loading-indicator`}
                    />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </Form>
  );
}
