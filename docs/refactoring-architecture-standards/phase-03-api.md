# Phase 03: API Architecture

## Objetivo

Implementar arquitetura robusta para consumo de APIs com HTTP client centralizado, cache inteligente (migração SWR → React Query) e tratamento de erros consistente.

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](./project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Categorização Global vs. Feature**

- **GLOBAL** (`src/lib/`, `src/services/base-*`): HTTP Client, Base Service, Query Provider
- **FEATURE-BOUND** (`src/services/*-service.ts`, `src/hooks/use-*`): Services específicos, hooks de domínio

### **Package Manager**: pnpm (padrão do projeto)

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Verificar API routes existentes (App Router)
- Analisar services atuais e uso do SWR
- Identificar padrões de fetch e cache atuais
- Planejar migração de SWR para React Query
- Avaliar tratamento de erros e type safety

### 2. Gaps Típicos Esperados

- [ ] **HTTP Client centralizado**: Falta wrapper consistente para fetch
- [ ] **Migração SWR → React Query**: Padronizar cache strategy
- [ ] **Error handling**: Inconsistente entre services
- [ ] **Request/Response validation**: Otimizar uso do Zod existente
- [ ] **Type safety**: Melhorar tipagem de APIs consumidas

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before API architecture refactoring"
```

### Step 2: Análise da Infraestrutura Atual (Copilot Agent)

O Copilot Agent irá primeiro analisar usando `read_file` e `grep_search`:

- ✅ **SWR já instalado**: (2.3.3) - precisa migrar para React Query
- ✅ **Zod já instalado**: (3.24.4) - otimizar uso para validation
- ❓ **Verificar se faltam**: @tanstack/react-query
- 🔍 **Analisar**: Padrões atuais de API calls e cache

### Step 3: Instalar Dependências Faltantes (Copilot Agent)

**IMPORTANTE**: Usar `pnpm` e verificar apenas o que está faltando:

```bash
# State management e cache (substituto do SWR)
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Zod já está instalado ✅
```

### Step 4: HTTP Client Centralizado (Copilot Agent)

**CATEGORIA**: Global - Infraestrutura compartilhada em toda aplicação

```typescript
// src/lib/http-client.ts (GLOBAL)
import { config } from '@/config';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = new URL(url, this.baseURL).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.statusText}`,
          response.status,
          `HTTP_${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
  }

  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params) : '';
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    return this.request<T>(fullUrl);
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient(config.api.baseUrl);
```

### Step 5: React Query Setup (Copilot Agent)

**CATEGORIA**: Global - Provider e configuração para toda aplicação

```typescript
// src/lib/query-client.ts (GLOBAL)
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error) => {
        if (error instanceof Error && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          if (statusCode >= 400 && statusCode < 500) return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});
```

```tsx
// src/lib/query-provider.tsx (GLOBAL)
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

### Step 6: Service Layer com Validation (Copilot Agent)

**CATEGORIA**: Base Service (Global) + Implementation Services (Feature-bound)

```typescript
// src/services/base-service.ts (GLOBAL)
import { z } from 'zod';
import { httpClient } from '@/lib/http-client';

export const baseResponseSchema = z.object({
  data: z.unknown(),
  success: z.boolean(),
  message: z.string().optional(),
});

export abstract class BaseService {
  protected abstract baseEndpoint: string;

  protected validate<T>(data: unknown, schema: z.ZodType<T>): T {
    return schema.parse(data);
  }

  protected async findAll<T>(schema: z.ZodType<T>, params?: Record<string, string>) {
    const response = await httpClient.get(this.baseEndpoint, params);
    return this.validate(response, schema);
  }

  protected async findById<T>(id: string, schema: z.ZodType<T>) {
    const response = await httpClient.get(`${this.baseEndpoint}/${id}`);
    return this.validate(response, schema);
  }

  protected async create<T>(data: unknown, schema: z.ZodType<T>) {
    const response = await httpClient.post(this.baseEndpoint, data);
    return this.validate(response, schema);
  }

  protected async update<T>(id: string, data: unknown, schema: z.ZodType<T>) {
    const response = await httpClient.put(`${this.baseEndpoint}/${id}`, data);
    return this.validate(response, schema);
  }

  protected async remove<T>(id: string, schema: z.ZodType<T>) {
    const response = await httpClient.delete(`${this.baseEndpoint}/${id}`);
    return this.validate(response, schema);
  }
}
```

```typescript
// src/services/application-service.ts (FEATURE-BOUND)
import { z } from 'zod';
import { BaseService, baseResponseSchema } from './base-service';

const applicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  environmentId: z.string(),
  locationId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const applicationsResponseSchema = baseResponseSchema.extend({
  data: z.array(applicationSchema),
});

const applicationResponseSchema = baseResponseSchema.extend({
  data: applicationSchema,
});

export type Application = z.infer<typeof applicationSchema>;

class ApplicationService extends BaseService {
  protected baseEndpoint = '/api/applications';

  async getApplications(params?: Record<string, string>) {
    return this.findAll(applicationsResponseSchema, params);
  }

  async getApplicationById(id: string) {
    return this.findById(id, applicationResponseSchema);
  }

  async createApplication(data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.create(data, applicationResponseSchema);
  }

  async updateApplication(id: string, data: Partial<Application>) {
    return this.update(id, data, applicationResponseSchema);
  }

  async deleteApplication(id: string) {
    return this.remove(id, baseResponseSchema);
  }
}

export const applicationService = new ApplicationService();
```

### Step 7: Migração SWR → React Query (Copilot Agent)

**CATEGORIA**: Feature-bound - Hooks específicos por domínio

**IMPORTANTE**: Migrar hooks existentes que usam SWR para React Query:

```typescript
// src/hooks/use-applications.ts (FEATURE-BOUND)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, type Application } from '@/services/application-service';

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: string) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

export function useApplications(params?: Record<string, string>) {
  return useQuery({
    queryKey: applicationKeys.list(JSON.stringify(params || {})),
    queryFn: () => applicationService.getApplications(params),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationService.getApplicationById(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      applicationService.updateApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
```

### Step 8: Error Boundary (Copilot Agent)

**CATEGORIA**: Global - Component de infraestrutura para toda aplicação

```tsx
// src/components/error-boundary.tsx (GLOBAL)
'use client';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-gray-600">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 9: Atualizar Layout (Copilot Agent)

**CATEGORIA**: Global - Root layout da aplicação

```tsx
// src/app/layout.tsx - adicionar providers (GLOBAL)
import { QueryProvider } from '@/lib/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Step 10: Limpeza e Migração Final (Copilot Agent)

**DEPOIS** que React Query estiver funcionando:

1. **Migrar hooks existentes**: Trocar `useSWR` por `useQuery`
2. **Atualizar imports**: Remover imports do SWR
3. **Remover dependência SWR**: Atualizar package.json (após validação)

### Step 11: Validação Automática (Copilot Agent)

**COMANDO**: Use ferramentas do VS Code para validação:

1. **Verificar Erros**: Use `get_errors` para identificar problemas de build
2. **Executar Build**: Use `run_in_terminal` com pnpm para build validation
3. **Executar Testes**: Use `run_tests` ou `run_in_terminal` para test validation

```typescript
// Copilot Agent deve usar:
// 1. get_errors(filePaths) - Verificar problemas de compilação
// 2. run_in_terminal("pnpm build") - Validar build
// 3. run_in_terminal("pnpm test") - Validar testes
// 4. Verificar no Problems panel do VS Code se há erros
```

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: implement frontend API architecture with React Query and centralized HTTP client"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Backup realizado

### ✅ HTTP Client & Services (Copilot Agent)

- [ ] HTTP client centralizado implementado
- [ ] Base service class criada
- [ ] Validation com Zod implementada
- [ ] Error handling consistente

### ✅ React Query Migration (Copilot Agent)

- [ ] React Query instalado e configurado
- [ ] SWR hooks migrados para useQuery/useMutation
- [ ] Provider integrado no layout
- [ ] DevTools habilitadas
- [ ] Cache strategy definida

### ✅ Hooks & State (Copilot Agent)

- [ ] Query hooks implementados (migrados de SWR)
- [ ] Mutation hooks criados
- [ ] Cache invalidation funcionando
- [ ] Loading/error states gerenciados

### ✅ Error Handling (Copilot Agent)

- [ ] Error boundary implementado
- [ ] Custom error classes definidas
- [ ] User-friendly error messages
- [ ] Recovery mechanisms

### ✅ Validação Final (Copilot Agent)

- [ ] `get_errors` - Sem erros de compilação/lint
- [ ] `run_in_terminal("pnpm build")` - Build successful
- [ ] `run_in_terminal("pnpm test")` - Testes passam
- [ ] Problems panel vazio no VS Code
- [ ] APIs respondem corretamente
- [ ] Cache funciona como esperado
- [ ] DevTools aparecem em desenvolvimento
- [ ] SWR completamente removido
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] **React Query** como framework principal de cache/state
- [ ] **SWR** completamente removido do projeto
- [ ] **HTTP Client** centralizado para consumo de APIs
- [ ] **Zod** integrado para validation de requests/responses
- [ ] **Error handling** consistente em toda aplicação
- [ ] **Type safety** melhorada para dados de APIs externas

## Próximo Passo

→ **Phase 04: Features Architecture**
