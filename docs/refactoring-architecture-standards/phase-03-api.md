# Phase 03: API Architecture

## Objetivo

Implementar arquitetura de APIs robusta com HTTP client centralizado, cache inteligente (React Query), tratamento de erros consistente e documentação automatizada.

## Análise da Situação Atual

### 1. Verificar APIs Atuais

```bash
# Verificar API routes
find src/app/api -name "route.ts" 2>/dev/null || find pages/api -name "*.ts" 2>/dev/null

# Verificar services existentes
ls -la src/services/ 2>/dev/null

# Verificar padrões de fetch
grep -r "fetch\|axios" src/ --include="*.ts" --include="*.tsx" | wc -l

# Verificar uso de cache
grep -r "useQuery\|useSWR" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 2. Identificar Gaps

- [ ] **HTTP Client centralizado**: Falta wrapper consistente
- [ ] **Cache strategy**: Falta React Query/SWR
- [ ] **Error handling**: Inconsistente entre services
- [ ] **Request/Response validation**: Falta schemas
- [ ] **API documentation**: Falta OpenAPI

## Implementação

### Step 1: Instalar Dependências

```bash
# State management e cache
npm install @tanstack/react-query @tanstack/react-query-devtools

# Validation
npm install zod

# API documentation
npm install swagger-ui-react swagger-jsdoc
npm install -D @types/swagger-ui-react @types/swagger-jsdoc
```

### Step 2: HTTP Client Centralizado

```typescript
// src/lib/http-client.ts
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

### Step 3: React Query Setup

```typescript
// src/lib/query-client.ts
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
// src/lib/query-provider.tsx
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

### Step 4: Service Layer com Validation

```typescript
// src/services/base-service.ts
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
// src/services/application-service.ts
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

### Step 5: React Query Hooks

```typescript
// src/hooks/use-applications.ts
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

### Step 6: Error Boundary

```tsx
// src/components/error-boundary.tsx
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

### Step 7: Atualizar Layout

```tsx
// src/app/layout.tsx - adicionar providers
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

### Step 8: API Documentation

```typescript
// src/lib/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataOcean Instance Manager API',
      version: '1.0.0',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const specs = swaggerJsdoc(options);
```

```typescript
// src/app/api/docs/route.ts
import { NextResponse } from 'next/server';
import { specs } from '@/lib/swagger';

export async function GET() {
  return NextResponse.json(specs);
}
```

## Checklist de Finalização

### HTTP Client & Services

- [ ] HTTP client centralizado implementado
- [ ] Base service class criada
- [ ] Validation com Zod implementada
- [ ] Error handling consistente

### React Query

- [ ] Query client configurado
- [ ] Provider integrado no layout
- [ ] DevTools habilitadas
- [ ] Cache strategy definida

### Hooks & State

- [ ] Query hooks implementados
- [ ] Mutation hooks criados
- [ ] Cache invalidation funcionando
- [ ] Loading/error states gerenciados

### Error Handling

- [ ] Error boundary implementado
- [ ] Custom error classes definidas
- [ ] User-friendly error messages
- [ ] Recovery mechanisms

### Funcionalidade

- [ ] `npm run build` - Build successful
- [ ] APIs respondem corretamente
- [ ] Cache funciona como esperado
- [ ] DevTools aparecem em desenvolvimento
- [ ] Error handling funciona

## Próximo Passo

→ **Phase 04: Features Architecture**
