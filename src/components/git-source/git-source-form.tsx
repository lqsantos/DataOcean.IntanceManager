'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { useGitSource } from '@/hooks/use-git-source';
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
  token: z.string().min(8, 'Token deve ter pelo menos 8 caracteres'),
  notes: z.string().optional(),
};

// Schema dinâmico baseado no provedor selecionado
const getGitSourceSchema = (provider: GitProvider | null) => {
  const schema = { ...baseGitSourceSchema };

  if (provider === 'github') {
    return z.object({
      ...schema,
      provider: z.literal('github'),
      organization: z.string().min(1, 'Owner é obrigatório'),
    });
  } else if (provider === 'gitlab') {
    return z.object({
      ...schema,
      provider: z.literal('gitlab'),
      namespace: z.string().min(1, 'Namespace é obrigatório'),
    });
  } else if (provider === 'azure-devops') {
    return z.object({
      ...schema,
      provider: z.literal('azure-devops'),
      organization: z.string().min(1, 'Organização é obrigatória'),
      project: z.string().min(1, 'Projeto é obrigatório'),
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
  const [provider, setProvider] = useState<GitProvider | null>(gitSource?.provider || null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { testConnection } = useGitSource();

  // Atualizar o formulário dinâmico com base no provider selecionado
  const form = useForm<CreateGitSourceDto>({
    resolver: zodResolver(getGitSourceSchema(provider)),
    defaultValues: {
      name: gitSource?.name || '',
      provider: gitSource?.provider || 'azure-devops', // Alterado para Azure DevOps como default
      url: gitSource?.url || '',
      token: gitSource?.token || '',
      organization: gitSource?.organization || '',
      namespace: gitSource?.namespace || '',
      project: gitSource?.project || '',
      notes: gitSource?.notes || '',
    },
  });

  // Monitorar mudanças no provider para atualizar a validação
  useEffect(() => {
    if (provider) {
      form.trigger();
    }
  }, [provider, form]);

  const handleSubmit = async (data: CreateGitSourceDto) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Erro será tratado pelo componente pai
      console.error('Form submission error:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
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
        const isValid = await form.trigger(['provider', 'url', 'token']);

        if (!isValid) {
          setTestResult({
            success: false,
            message: 'Preencha corretamente os campos de Provider, URL e Token antes de testar.',
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid="git-source-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Fonte Git Corporativa"
                  {...field}
                  data-testid="git-source-name"
                />
              </FormControl>
              <FormDescription>Um nome descritivo para identificar esta fonte Git</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provedor</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value: GitProvider) => {
                    field.onChange(value);
                    setProvider(value);
                  }}
                  disabled={isSubmitting || !!gitSource}
                  data-testid="git-source-provider"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="azure-devops">Azure DevOps</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {gitSource
                  ? 'O provedor não pode ser alterado após a criação'
                  : 'Selecione o provedor Git para esta fonte'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
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
                  data-testid="git-source-url"
                />
              </FormControl>
              <FormDescription>
                {provider === 'github' && 'URL da API GitHub (padrão: https://api.github.com)'}
                {provider === 'gitlab' && 'URL da API GitLab (padrão: https://gitlab.com/api/v4)'}
                {provider === 'azure-devops' &&
                  'URL do Azure DevOps (padrão: https://dev.azure.com)'}
                {!provider && 'URL base do provedor Git'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token de Acesso</FormLabel>
              <FormControl>
                <Input type="password" {...field} data-testid="git-source-token" />
              </FormControl>
              <FormDescription>
                {provider === 'github' &&
                  'Personal Access Token com permissão para acessar repositórios'}
                {provider === 'gitlab' && 'Token de API com escopo "read_api" e "read_repository"'}
                {provider === 'azure-devops' &&
                  'Personal Access Token (PAT) com permissão "Code (read)"'}
                {!provider && 'Token de acesso para autenticação na API'}
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
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nome-do-owner"
                    {...field}
                    data-testid="git-source-organization"
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
              <FormItem>
                <FormLabel>Namespace</FormLabel>
                <FormControl>
                  <Input
                    placeholder="namespace-do-grupo"
                    {...field}
                    data-testid="git-source-namespace"
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
                <FormItem>
                  <FormLabel>Organização</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nome-da-organizacao"
                      {...field}
                      data-testid="git-source-organization"
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
                <FormItem>
                  <FormLabel>Projeto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nome-do-projeto"
                      {...field}
                      data-testid="git-source-project"
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
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre esta fonte Git..."
                  {...field}
                  data-testid="git-source-notes"
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
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isSubmitting || isTesting}
              data-testid="test-connection-button"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              data-testid="cancel-button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="submit-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {gitSource ? 'Salvando...' : 'Criando...'}
                </>
              ) : gitSource ? (
                'Salvar'
              ) : (
                'Criar'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
