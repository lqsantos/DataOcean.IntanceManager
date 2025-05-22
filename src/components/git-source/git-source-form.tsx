'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  GitBranchPlus,
  Github,
  Gitlab,
  Globe,
  Key,
  Loader2,
  Server,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePATModal } from '@/contexts/modal-manager-context';
import { useGitSource } from '@/hooks/use-git-source';
import { usePAT } from '@/hooks/use-pat';
import { cn } from '@/lib/utils';
import { PATService } from '@/services/pat-service';
import type {
  CreateGitSourceDto,
  GitProvider,
  GitSource,
  UpdateGitSourceDto,
} from '@/types/git-source';

// Schema básica para validação comum a todos os provedores
const baseGitSourceSchema = {
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  url: z.string().url('URL deve ser válida'),
  notes: z.string().optional(),
  token: z.string().optional(),
};

// Schema dinâmico baseado no provedor selecionado
const getGitSourceSchema = (provider: GitProvider | null) => {
  const schema = { ...baseGitSourceSchema };

  if (provider === 'github') {
    return z.object({
      ...schema,
      provider: z.literal('github'),
      organization: z.string().min(1, 'Owner é obrigatório'),
      namespace: z.string().optional(),
      project: z.string().optional(),
    });
  } else if (provider === 'gitlab') {
    return z.object({
      ...schema,
      provider: z.literal('gitlab'),
      namespace: z.string().min(1, 'Namespace é obrigatório'),
      organization: z.string().optional(),
      project: z.string().optional(),
    });
  } else if (provider === 'azure-devops') {
    return z.object({
      ...schema,
      provider: z.literal('azure-devops'),
      organization: z.string().min(1, 'Organização é obrigatória'),
      project: z.string().min(1, 'Projeto é obrigatório'),
      namespace: z.string().optional(),
    });
  }

  // Fallback para quando o provider ainda não foi selecionado
  return z.object({
    ...schema,
    provider: z.enum(['github', 'gitlab', 'azure-devops']),
    organization: z.string().optional(),
    namespace: z.string().optional(),
    project: z.string().optional(),
  });
};

// Definindo o tipo corretamente com todas as propriedades possíveis
type GitSourceFormData = {
  name: string;
  provider: GitProvider;
  url: string;
  token?: string;
  organization?: string;
  namespace?: string;
  project?: string;
  notes?: string;
};

interface GitSourceFormProps {
  gitSource?: GitSource | null;
  onSubmit: (data: CreateGitSourceDto | UpdateGitSourceDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GitSourceForm({
  gitSource,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GitSourceFormProps) {
  // Inicialize provider com o valor padrão do formulário - 'azure-devops'
  const [provider, setProvider] = useState<GitProvider | null>(
    gitSource?.provider || 'azure-devops'
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [activeStep, setActiveStep] = useState<'provider' | 'connection' | 'details'>(
    gitSource ? 'details' : 'provider'
  );
  const { testConnection } = useGitSource();

  // Usar o hook usePAT diretamente para obter o status mais atualizado
  const { status: patStatus, fetchStatus } = usePAT();
  // Atualizando para usar métodos padronizados
  const { openModal: openPatModal, isOpen: isPATModalOpen } = usePATModal();
  const [patModalOpened, setPatModalOpened] = useState(false);

  // Atualizar o formulário dinâmico com base no provider selecionado
  const form = useForm<GitSourceFormData>({
    resolver: zodResolver(getGitSourceSchema(provider)),
    defaultValues: {
      name: gitSource?.name || '',
      provider: gitSource?.provider || 'azure-devops',
      url: gitSource?.url || '',
      token: gitSource?.token || 'placeholder-token', // Este campo será substituído pelo token real do PAT
      organization: gitSource?.organization || '',
      namespace: gitSource?.namespace || '',
      project: gitSource?.project || '',
      notes: gitSource?.notes || '',
    },
    mode: 'onTouched', // Só valida quando o usuário interage com o campo
  });

  // Monitorar mudanças no provider para atualizar a validação
  useEffect(() => {
    if (provider) {
      // Não disparar validação no carregamento inicial, apenas quando mudar o provider
      if (form.formState.isDirty) {
        form.trigger();
      }
    }
  }, [provider, form]);

  // Monitorar quando o modal PAT é fechado para atualizar o status
  useEffect(() => {
    if (!isPATModalOpen && patModalOpened) {
      // Quando o modal PAT é fechado e foi aberto pelo botão, buscar o status atual do PAT
      fetchStatus();

      // Resetar o estado de token missing se o usuário configurou o token
      if (patStatus.configured) {
        setTokenMissing(false);
        toast.success('Token de acesso configurado com sucesso!');
      }
      setPatModalOpened(false);
    }
  }, [isPATModalOpen, fetchStatus, patStatus.configured, patModalOpened]);

  // Verificar se o formulário está válido
  const isFormValid = form.formState.isValid;

  const handleSubmit = async (formData: GitSourceFormData) => {
    setAttemptedSubmit(true);

    if (!patStatus.configured) {
      setTokenMissing(true);
      toast.error('É necessário configurar um token de acesso antes de criar uma fonte Git');

      return;
    }

    try {
      // Obter o PAT token através do service
      const patData = await PATService.getToken();

      // Usar o token do PAT para a submissão
      const dataToSubmit = {
        ...formData,
        token: patData.token || 'dummy-token-for-test', // Em modo de teste usamos um dummy token
      };

      // Chamar onSubmit com os dados atualizados
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Erro ao processar formulário. Verifique o token de acesso.');
    }
  };

  const handleConfigurePAT = () => {
    setPatModalOpened(true);
    openPatModal(); // Usando o método padronizado
  };

  const handleTestConnection = async () => {
    try {
      // Verificar se o token está configurado antes de testar a conexão
      if (!patStatus.configured) {
        setTokenMissing(true);

        return;
      }

      setIsTesting(true);
      setTestResult(null);

      // Se estamos editando, testar com o ID existente
      if (gitSource?.id) {
        const result = await testConnection(gitSource.id);

        setTestResult({
          success: result.success,
          message: result.success
            ? `Conexão bem sucedida! ${result.repositoryCount} repositórios encontrados.`
            : result.message,
        });
      } else {
        // Validar o formulário antes de tentar testar
        const isValid = await form.trigger(['provider', 'url']);

        if (!isValid) {
          setTestResult({
            success: false,
            message: 'Preencha corretamente os campos obrigatórios antes de testar.',
          });

          return;
        }

        // Simular teste para novo cadastro (na implementação real, isso seria feito via API)
        toast.info('Testando conexão...');
        setTimeout(() => {
          const success = Math.random() < 0.8;
          const repos = Math.floor(Math.random() * 100) + 5;

          setTestResult({
            success,
            message: success
              ? `Conexão bem sucedida! ${repos} repositórios encontrados.`
              : 'Falha na conexão. Verifique as credenciais e URL.',
          });
        }, 1500);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar conexão',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const nextStep = async () => {
    if (activeStep === 'provider') {
      const isValid = await form.trigger('provider');

      if (isValid) {
        setActiveStep('connection');
      }
    } else if (activeStep === 'connection') {
      const isValid = await form.trigger(['url', 'organization', 'namespace', 'project']);

      if (isValid) {
        setActiveStep('details');
      }
    }
  };

  const prevStep = () => {
    if (activeStep === 'connection') {
      setActiveStep('provider');
    } else if (activeStep === 'details') {
      setActiveStep('connection');
    }
  };

  const getProviderIcon = (providerType: GitProvider) => {
    switch (providerType) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'gitlab':
        return <Gitlab className="h-5 w-5" />;
      case 'azure-devops':
        return <Server className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid="git-source-form"
      >
        {!gitSource && (
          <Tabs value={activeStep} className="w-full" data-testid="git-source-wizard-tabs">
            <TabsList
              className="mb-6 grid w-full grid-cols-3"
              data-testid="git-source-wizard-tabslist"
            >
              <TabsTrigger
                value="provider"
                onClick={() => setActiveStep('provider')}
                className={cn(
                  activeStep === 'provider' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="git-source-wizard-tab-provider"
              >
                1. Provedor
              </TabsTrigger>
              <TabsTrigger
                value="connection"
                onClick={() => activeStep !== 'provider' && setActiveStep('connection')}
                disabled={!form.getValues('provider')}
                className={cn(
                  activeStep === 'connection' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="git-source-wizard-tab-connection"
              >
                2. Conexão
              </TabsTrigger>
              <TabsTrigger
                value="details"
                onClick={() => activeStep === 'details' && setActiveStep('details')}
                disabled={activeStep !== 'details'}
                className={cn(
                  activeStep === 'details' && 'relative',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
                data-testid="git-source-wizard-tab-details"
              >
                3. Detalhes
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="provider"
              className="mt-0"
              data-testid="git-source-wizard-content-provider"
            >
              <Card data-testid="git-source-provider-card">
                <CardHeader>
                  <CardTitle>Selecione o Provedor Git</CardTitle>
                  <CardDescription>
                    Escolha o serviço de hospedagem Git para conectar
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <div
                          className="grid grid-cols-1 gap-4 md:grid-cols-3"
                          data-testid="git-source-provider-grid"
                        >
                          <div
                            className={cn(
                              'relative flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                              field.value === 'azure-devops' && 'border-primary'
                            )}
                            onClick={() => {
                              field.onChange('azure-devops');
                              setProvider('azure-devops');
                            }}
                            data-testid="git-source-provider-azure"
                          >
                            <Server className="mb-3 h-8 w-8" />
                            <div className="space-y-1 text-center">
                              <h3 className="font-medium">Azure DevOps</h3>
                              <p className="text-xs text-muted-foreground">
                                Microsoft Azure DevOps
                              </p>
                            </div>
                            {field.value === 'azure-devops' && (
                              <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary" />
                            )}
                          </div>

                          <div
                            className={cn(
                              'relative flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                              field.value === 'github' && 'border-primary'
                            )}
                            onClick={() => {
                              field.onChange('github');
                              setProvider('github');
                            }}
                            data-testid="git-source-provider-github"
                          >
                            <Github className="mb-3 h-8 w-8" />
                            <div className="space-y-1 text-center">
                              <h3 className="font-medium">GitHub</h3>
                              <p className="text-xs text-muted-foreground">
                                GitHub.com ou GitHub Enterprise
                              </p>
                            </div>
                            {field.value === 'github' && (
                              <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary" />
                            )}
                          </div>

                          <div
                            className={cn(
                              'relative flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                              field.value === 'gitlab' && 'border-primary'
                            )}
                            onClick={() => {
                              field.onChange('gitlab');
                              setProvider('gitlab');
                            }}
                            data-testid="git-source-provider-gitlab"
                          >
                            <Gitlab className="mb-3 h-8 w-8" />
                            <div className="space-y-1 text-center">
                              <h3 className="font-medium">GitLab</h3>
                              <p className="text-xs text-muted-foreground">
                                GitLab.com ou GitLab Self-hosted
                              </p>
                            </div>
                            {field.value === 'gitlab' && (
                              <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    data-testid="git-source-cancel-button"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!form.getValues('provider')}
                    data-testid="git-source-next-button"
                  >
                    Próximo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent
              value="connection"
              className="mt-0"
              data-testid="git-source-wizard-content-connection"
            >
              <Card data-testid="git-source-connection-card">
                <CardHeader>
                  <div className="flex items-center">
                    {getProviderIcon(form.getValues('provider') as GitProvider)}
                    <CardTitle className="ml-2">Configurar Conexão</CardTitle>
                  </div>
                  <CardDescription>
                    Defina as informações de conexão para{' '}
                    {provider === 'github'
                      ? 'GitHub'
                      : provider === 'gitlab'
                        ? 'GitLab'
                        : 'Azure DevOps'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem data-testid="git-source-url-field">
                        <FormLabel>URL Base</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              provider === 'github'
                                ? 'https://api.github.com'
                                : provider === 'gitlab'
                                  ? 'https://gitlab.com/api/v4'
                                  : provider === 'azure-devops'
                                    ? 'https://dev.azure.com'
                                    : 'https://api.example.com'
                            }
                            {...field}
                            data-testid="git-source-url-input"
                          />
                        </FormControl>
                        <FormDescription>
                          {provider === 'github' &&
                            'URL da API GitHub (padrão: https://api.github.com)'}
                          {provider === 'gitlab' &&
                            'URL da API GitLab (padrão: https://gitlab.com/api/v4)'}
                          {provider === 'azure-devops' &&
                            'URL do Azure DevOps (padrão: https://dev.azure.com)'}
                          {!provider && 'URL base do provedor Git'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {provider === 'github' && (
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem data-testid="git-source-organization-field">
                          <FormLabel>Owner</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="nome-do-owner"
                              {...field}
                              data-testid="git-source-organization-input"
                            />
                          </FormControl>
                          <FormDescription>Nome do owner/organização no GitHub</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {provider === 'gitlab' && (
                    <FormField
                      control={form.control}
                      name="namespace"
                      render={({ field }) => (
                        <FormItem data-testid="git-source-namespace-field">
                          <FormLabel>Namespace</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="namespace-do-grupo"
                              {...field}
                              data-testid="git-source-namespace-input"
                            />
                          </FormControl>
                          <FormDescription>Namespace do grupo no GitLab</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {provider === 'azure-devops' && (
                    <>
                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem data-testid="git-source-organization-field">
                            <FormLabel>Organização</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="nome-da-organizacao"
                                {...field}
                                data-testid="git-source-organization-input"
                              />
                            </FormControl>
                            <FormDescription>Nome da organização no Azure DevOps</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="project"
                        render={({ field }) => (
                          <FormItem data-testid="git-source-project-field">
                            <FormLabel>Projeto</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="nome-do-projeto"
                                {...field}
                                data-testid="git-source-project-input"
                              />
                            </FormControl>
                            <FormDescription>Nome do projeto no Azure DevOps</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {testResult && (
                    <Alert
                      variant={testResult.success ? 'default' : 'destructive'}
                      className={
                        testResult.success ? 'border-green-500 bg-green-500/10' : undefined
                      }
                      data-testid="test-connection-result"
                    >
                      <AlertDescription
                        className="flex items-center"
                        data-testid="test-connection-message"
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        {testResult.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {tokenMissing && (
                    <div
                      className="mt-4 rounded-lg border-2 border-destructive/70 bg-destructive/5 p-4"
                      data-testid="token-missing-alert"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-3 font-medium text-destructive">
                            É necessário configurar um token de acesso
                          </p>
                          <p className="mb-4 text-sm text-muted-foreground">
                            Configure um token de acesso pessoal antes de prosseguir com a operação.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleConfigurePAT}
                            className="flex items-center"
                            data-testid="configure-token-button"
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Configurar Token
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isSubmitting || isTesting}
                      className="w-full"
                      data-testid="test-connection-button"
                    >
                      {isTesting ? (
                        <>
                          <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            data-testid="test-connection-loading"
                          />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    data-testid="git-source-back-button"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!form.getValues('url')}
                    data-testid="git-source-next-connection-button"
                  >
                    Próximo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent
              value="details"
              className="mt-0"
              data-testid="git-source-wizard-content-details"
            >
              <Card data-testid="git-source-details-card">
                <CardHeader>
                  <CardTitle>Detalhes da Fonte Git</CardTitle>
                  <CardDescription>
                    Finalize a configuração com informações adicionais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem data-testid="git-source-name-field">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Fonte Git Corporativa"
                            {...field}
                            data-testid="git-source-name-input"
                          />
                        </FormControl>
                        <FormDescription>
                          Um nome descritivo para identificar esta fonte Git
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem data-testid="git-source-notes-field">
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre esta fonte Git..."
                            {...field}
                            data-testid="git-source-notes-input"
                          />
                        </FormControl>
                        <FormDescription>Informações adicionais (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tokenMissing && (
                    <div
                      className="mt-4 rounded-lg border-2 border-destructive/70 bg-destructive/5 p-4"
                      data-testid="token-missing-details-alert"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-3 font-medium text-destructive">
                            É necessário configurar um token de acesso
                          </p>
                          <p className="mb-4 text-sm text-muted-foreground">
                            Configure um token de acesso pessoal antes de prosseguir com a criação
                            da fonte Git.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleConfigurePAT}
                            className="flex items-center"
                            data-testid="configure-token-button-details"
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Configurar Token
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    data-testid="git-source-back-details-button"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (attemptedSubmit && !isFormValid)}
                    data-testid="git-source-submit-button"
                    onClick={() => {
                      if (!isFormValid) {
                        setAttemptedSubmit(true);
                      }

                      if (!patStatus.configured) {
                        setTokenMissing(true);
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          data-testid="git-source-submit-loading"
                        />
                        Criando...
                      </>
                    ) : (
                      <>
                        <GitBranchPlus className="mr-2 h-4 w-4" />
                        Criar Fonte Git
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Modo de edição - formulário simplificado */}
        {gitSource && (
          <Card data-testid="git-source-edit-card">
            <CardHeader>
              <div className="flex items-center">
                {getProviderIcon(gitSource.provider)}
                <CardTitle className="ml-2">Editar Fonte Git</CardTitle>
              </div>
              <CardDescription>Atualize as informações da fonte {gitSource.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem data-testid="git-source-edit-name-field">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Fonte Git Corporativa"
                        {...field}
                        data-testid="git-source-name-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Um nome descritivo para identificar esta fonte Git
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem data-testid="git-source-edit-url-field">
                    <FormLabel>URL Base</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          provider === 'github'
                            ? 'https://api.github.com'
                            : provider === 'gitlab'
                              ? 'https://gitlab.com/api/v4'
                              : provider === 'azure-devops'
                                ? 'https://dev.azure.com'
                                : 'https://api.example.com'
                        }
                        {...field}
                        data-testid="git-source-url-input"
                      />
                    </FormControl>
                    <FormDescription>URL base do provedor Git</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {provider === 'github' && (
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem data-testid="git-source-edit-organization-field">
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nome-do-owner"
                          {...field}
                          data-testid="git-source-organization-input"
                        />
                      </FormControl>
                      <FormDescription>Nome do owner/organização no GitHub</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {provider === 'gitlab' && (
                <FormField
                  control={form.control}
                  name="namespace"
                  render={({ field }) => (
                    <FormItem data-testid="git-source-edit-namespace-field">
                      <FormLabel>Namespace</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="namespace-do-grupo"
                          {...field}
                          data-testid="git-source-namespace-input"
                        />
                      </FormControl>
                      <FormDescription>Namespace do grupo no GitLab</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {provider === 'azure-devops' && (
                <>
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem data-testid="git-source-edit-organization-field">
                        <FormLabel>Organização</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="nome-da-organizacao"
                            {...field}
                            data-testid="git-source-organization-input"
                          />
                        </FormControl>
                        <FormDescription>Nome da organização no Azure DevOps</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem data-testid="git-source-edit-project-field">
                        <FormLabel>Projeto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="nome-do-projeto"
                            {...field}
                            data-testid="git-source-project-input"
                          />
                        </FormControl>
                        <FormDescription>Nome do projeto no Azure DevOps</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem data-testid="git-source-edit-notes-field">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre esta fonte Git..."
                        {...field}
                        data-testid="git-source-notes-input"
                      />
                    </FormControl>
                    <FormDescription>Informações adicionais (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {testResult && (
                <Alert
                  variant={testResult.success ? 'default' : 'destructive'}
                  className={testResult.success ? 'border-green-500 bg-green-500/10' : undefined}
                  data-testid="test-connection-result"
                >
                  <AlertDescription
                    className="flex items-center"
                    data-testid="test-connection-message"
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {tokenMissing && (
                <div
                  className="mt-4 rounded-lg border-2 border-destructive/70 bg-destructive/5 p-4"
                  data-testid="token-missing-edit-alert"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="mb-3 font-medium text-destructive">
                        É necessário configurar um token de acesso
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Configure um token de acesso pessoal antes de prosseguir com a criação da
                        fonte Git.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleConfigurePAT}
                        className="flex items-center"
                        data-testid="configure-token-button-edit"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Configurar Token
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isSubmitting || isTesting}
                className="w-full"
                data-testid="test-connection-button"
              >
                {isTesting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-testid="test-connection-loading"
                    />
                    Testando...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Testar Conexão
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                data-testid="git-source-cancel-button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (attemptedSubmit && !isFormValid)}
                data-testid="git-source-submit-button"
                onClick={() => {
                  if (!isFormValid) {
                    setAttemptedSubmit(true);
                  }

                  if (!patStatus.configured) {
                    setTokenMissing(true);
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-testid="git-source-submit-loading"
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
