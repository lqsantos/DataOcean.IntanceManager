# Prompt: Implementação API Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 03 - API Architecture (Implementation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Análise completa em `../analysis/results.md`

## Objetivo da Implementação

Implementar uma arquitetura de APIs robusta, padronizada e performática com HTTP client centralizado, tratamento de erros consistente, cache inteligente e documentação automatizada.

## Pré-requisitos

- [ ] Phase 02 (Testing Framework) concluída e validada
- [ ] Análise da API architecture atual completa
- [ ] Gap analysis identificando melhorias necessárias
- [ ] Backup/commit do estado atual

## Stack de APIs Target

### Core API Stack

- **HTTP Client**: Custom wrapper around fetch with interceptors
- **Cache Management**: TanStack Query (React Query v5)
- **Validation**: Zod for request/response validation
- **Error Handling**: Structured error classes and boundaries
- **Documentation**: OpenAPI + Swagger UI

### Supporting Tools

- **Mock Data**: MSW integration for development
- **DevTools**: React Query DevTools
- **Performance**: Request deduplication and background updates
- **Type Safety**: Full TypeScript integration

## Implementação Passo-a-Passo

### Step 1: Install API Dependencies

```bash
# Core API management
npm install @tanstack/react-query @tanstack/react-query-devtools

# Validation and schema
npm install zod

# API documentation
npm install swagger-ui-react swagger-jsdoc

# Development dependencies
npm install -D @types/swagger-ui-react @types/swagger-jsdoc
```

### Step 2: HTTP Client Architecture

#### src/lib/http-client.ts

```typescript
import { config } from '@/config';

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, originalError?: unknown) {
    super(message, 0, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

// Request/Response types
export interface ApiRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

// HTTP Client implementation
class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private requestInterceptors: Array<(request: ApiRequest) => ApiRequest | Promise<ApiRequest>> =
    [];
  private responseInterceptors: Array<
    (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  > = [];
  private errorInterceptors: Array<(error: ApiError) => ApiError | Promise<ApiError>> = [];

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  // Add interceptors
  addRequestInterceptor(interceptor: (request: ApiRequest) => ApiRequest | Promise<ApiRequest>) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  ) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: ApiError) => ApiError | Promise<ApiError>) {
    this.errorInterceptors.push(interceptor);
  }

  // Build URL with params
  private buildUrl(url: string, params?: Record<string, string>): string {
    const fullUrl = new URL(url, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        fullUrl.searchParams.append(key, value);
      });
    }

    return fullUrl.toString();
  }

  // Apply request interceptors
  private async applyRequestInterceptors(request: ApiRequest): Promise<ApiRequest> {
    let processedRequest = request;

    for (const interceptor of this.requestInterceptors) {
      processedRequest = await interceptor(processedRequest);
    }

    return processedRequest;
  }

  // Apply response interceptors
  private async applyResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let processedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  // Apply error interceptors
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let processedError = error;

    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }

    return processedError;
  }

  // Core request method
  async request<T = unknown>(requestConfig: ApiRequest): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptors
      const processedRequest = await this.applyRequestInterceptors(requestConfig);

      // Build URL
      const url = this.buildUrl(processedRequest.url, processedRequest.params);

      // Prepare fetch options
      const options: RequestInit = {
        method: processedRequest.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...processedRequest.headers,
        },
        signal: processedRequest.signal,
      };

      // Add body for non-GET requests
      if (processedRequest.data && processedRequest.method !== 'GET') {
        options.body = JSON.stringify(processedRequest.data);
      }

      // Set timeout
      const timeoutMs = processedRequest.timeout || this.defaultTimeout;
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

      // Combine signals
      if (processedRequest.signal) {
        processedRequest.signal.addEventListener('abort', () => timeoutController.abort());
      }
      options.signal = timeoutController.signal;

      // Make request
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // Parse response
      let data: T;
      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Create response object
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };

      // Handle non-ok responses
      if (!response.ok) {
        const error = new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          `HTTP_${response.status}`,
          data
        );
        throw await this.applyErrorInterceptors(error);
      }

      // Apply response interceptors
      return await this.applyResponseInterceptors(apiResponse);
    } catch (error) {
      // Handle different error types
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new ApiError('Request timeout', 408, 'TIMEOUT_ERROR', error);
        throw await this.applyErrorInterceptors(timeoutError);
      }

      const networkError = new NetworkError('Network request failed', error);
      throw await this.applyErrorInterceptors(networkError);
    }
  }

  // Convenience methods
  async get<T = unknown>(
    url: string,
    config?: Omit<ApiRequest, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequest, 'url' | 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequest, 'url' | 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequest, 'url' | 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  async delete<T = unknown>(
    url: string,
    config?: Omit<ApiRequest, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

// Create and configure HTTP client instance
export const httpClient = new HttpClient(config.api.baseUrl, config.api.timeout);

// Add default interceptors

// Request interceptor for authentication
httpClient.addRequestInterceptor(async (request) => {
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return request;
});

// Response interceptor for logging
httpClient.addResponseInterceptor(async (response) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      url: response.headers.get('x-request-url'),
    });
  }
  return response;
});

// Error interceptor for common error handling
httpClient.addErrorInterceptor(async (error) => {
  // Handle 401 - redirect to login
  if (error.statusCode === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  return error;
});

export { HttpClient };
```

### Step 3: React Query Setup

#### src/lib/query-client.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time - how long data stays in cache after being unused
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          if (statusCode >= 400 && statusCode < 500) {
            return false;
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (disabled by default for better UX)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});
```

#### src/lib/query-provider.tsx

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

### Step 4: API Service Layer

#### src/services/base-service.ts

```typescript
import { z } from 'zod';
import { httpClient, ApiResponse } from '@/lib/http-client';

// Base response schema
export const baseResponseSchema = z.object({
  data: z.unknown(),
  success: z.boolean(),
  message: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

export type BaseResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Paginated response schema
export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
    success: z.boolean(),
    message: z.string().optional(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
};

// Base service class
export abstract class BaseService {
  protected abstract baseEndpoint: string;

  // Validate response with schema
  protected validateResponse<T>(response: ApiResponse, schema: z.ZodType<T>): T {
    try {
      return schema.parse(response.data);
    } catch (error) {
      throw new Error(`Response validation failed: ${error}`);
    }
  }

  // Build endpoint URL
  protected buildEndpoint(path?: string): string {
    return path ? `${this.baseEndpoint}/${path}` : this.baseEndpoint;
  }

  // Generic CRUD operations
  protected async findAll<T>(
    schema: z.ZodType<PaginatedResponse<T>>,
    params?: Record<string, string>
  ): Promise<PaginatedResponse<T>> {
    const response = await httpClient.get(this.baseEndpoint, { params });
    return this.validateResponse(response, schema);
  }

  protected async findById<T>(
    id: string,
    schema: z.ZodType<BaseResponse<T>>
  ): Promise<BaseResponse<T>> {
    const response = await httpClient.get(this.buildEndpoint(id));
    return this.validateResponse(response, schema);
  }

  protected async create<T, U>(
    data: T,
    schema: z.ZodType<BaseResponse<U>>
  ): Promise<BaseResponse<U>> {
    const response = await httpClient.post(this.baseEndpoint, data);
    return this.validateResponse(response, schema);
  }

  protected async update<T, U>(
    id: string,
    data: T,
    schema: z.ZodType<BaseResponse<U>>
  ): Promise<BaseResponse<U>> {
    const response = await httpClient.put(this.buildEndpoint(id), data);
    return this.validateResponse(response, schema);
  }

  protected async remove<T>(
    id: string,
    schema: z.ZodType<BaseResponse<T>>
  ): Promise<BaseResponse<T>> {
    const response = await httpClient.delete(this.buildEndpoint(id));
    return this.validateResponse(response, schema);
  }
}
```

#### src/services/application-service.ts

```typescript
import { z } from 'zod';
import { BaseService, paginatedResponseSchema, baseResponseSchema } from './base-service';

// Zod schemas for validation
export const applicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'error']),
  environmentId: z.string(),
  locationId: z.string(),
  configuration: z.record(z.unknown()),
  metadata: z.object({
    version: z.string().optional(),
    tags: z.array(z.string()).optional(),
    owner: z.string().optional(),
    lastDeployment: z.string().datetime().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createApplicationSchema = applicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateApplicationSchema = createApplicationSchema.partial();

// Type definitions
export type Application = z.infer<typeof applicationSchema>;
export type CreateApplicationRequest = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationRequest = z.infer<typeof updateApplicationSchema>;

// Service implementation
class ApplicationService extends BaseService {
  protected baseEndpoint = '/api/applications';

  async getApplications(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) {
    const searchParams = params
      ? Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]))
      : undefined;

    return this.findAll(paginatedResponseSchema(applicationSchema), searchParams);
  }

  async getApplicationById(id: string) {
    return this.findById(
      id,
      baseResponseSchema.extend({
        data: applicationSchema,
      })
    );
  }

  async createApplication(data: CreateApplicationRequest) {
    return this.create(
      data,
      baseResponseSchema.extend({
        data: applicationSchema,
      })
    );
  }

  async updateApplication(id: string, data: UpdateApplicationRequest) {
    return this.update(
      id,
      data,
      baseResponseSchema.extend({
        data: applicationSchema,
      })
    );
  }

  async deleteApplication(id: string) {
    return this.remove(
      id,
      baseResponseSchema.extend({
        data: z.object({ id: z.string() }),
      })
    );
  }

  // Custom business methods
  async getApplicationsByEnvironment(environmentId: string) {
    const response = await this.getApplications({
      status: 'active',
    });

    return {
      ...response,
      data: response.data.filter((app) => app.environmentId === environmentId),
    };
  }

  async deployApplication(id: string) {
    const response = await httpClient.post(`${this.baseEndpoint}/${id}/deploy`);
    return this.validateResponse(
      response,
      baseResponseSchema.extend({
        data: applicationSchema,
      })
    );
  }
}

export const applicationService = new ApplicationService();
```

### Step 5: React Query Hooks

#### src/hooks/use-applications.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  applicationService,
  type Application,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from '@/services/application-service';

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  environment: (environmentId: string) =>
    [...applicationKeys.all, 'environment', environmentId] as const,
};

// Hooks for applications
export function useApplications(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: applicationKeys.list(params || {}),
    queryFn: () => applicationService.getApplications(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationService.getApplicationById(id),
    enabled: !!id,
  });
}

export function useApplicationsByEnvironment(environmentId: string) {
  return useQuery({
    queryKey: applicationKeys.environment(environmentId),
    queryFn: () => applicationService.getApplicationsByEnvironment(environmentId),
    enabled: !!environmentId,
  });
}

// Mutations
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationService.createApplication(data),
    onSuccess: () => {
      // Invalidate and refetch applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      applicationService.updateApplication(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific application and lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationService.deleteApplication(id),
    onSuccess: () => {
      // Invalidate applications lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeployApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationService.deployApplication(id),
    onSuccess: (_, id) => {
      // Invalidate specific application
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}
```

### Step 6: Error Boundary Implementation

#### src/components/error-boundary.tsx

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const retry = () => {
        this.setState({ hasError: false, error: undefined });
      };

      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} retry={retry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={retry} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
```

### Step 7: Update App with Providers

#### src/app/layout.tsx (atualizar)

```tsx
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

### Step 8: API Documentation Setup

#### src/lib/swagger.ts

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataOcean Instance Manager API',
      version: '1.0.0',
      description: 'API documentation for DataOcean Instance Manager',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Application: {
          type: 'object',
          required: ['name', 'environmentId', 'locationId'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'error'],
            },
            environmentId: { type: 'string', format: 'uuid' },
            locationId: { type: 'string', format: 'uuid' },
            configuration: { type: 'object' },
            metadata: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                owner: { type: 'string' },
                lastDeployment: { type: 'string', format: 'date-time' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

export const specs = swaggerJsdoc(options);
```

#### src/app/api/docs/route.ts

```typescript
import { NextResponse } from 'next/server';
import { specs } from '@/lib/swagger';

export async function GET() {
  return NextResponse.json(specs);
}
```

## Validação Contínua

### Após Cada Step:

```bash
# Type checking
npm run type-check

# Build verification
npm run build

# Test execution
npm run test:run

# Start dev server to test APIs
npm run dev
```

## Checklist de Implementação

### ✅ Step 1: Dependencies

- [ ] TanStack Query instalado
- [ ] Zod para validação
- [ ] Swagger para documentação

### ✅ Step 2: HTTP Client

- [ ] Custom HTTP client implementado
- [ ] Interceptors configurados
- [ ] Error handling robusto
- [ ] Type safety completa

### ✅ Step 3: Query Management

- [ ] React Query configurado
- [ ] DevTools habilitadas
- [ ] Retry logic implementada
- [ ] Cache strategy definida

### ✅ Step 4: Service Layer

- [ ] Base service class criada
- [ ] Schema validation com Zod
- [ ] CRUD operations padronizadas
- [ ] Type-safe responses

### ✅ Step 5: React Hooks

- [ ] Query hooks implementados
- [ ] Mutation hooks criados
- [ ] Cache invalidation configurada
- [ ] Optimistic updates habilitadas

### ✅ Step 6: Error Handling

- [ ] Error boundary implementado
- [ ] Global error handling
- [ ] User-friendly error messages
- [ ] Retry mechanisms

### ✅ Step 7: Integration

- [ ] Providers configurados no layout
- [ ] Error boundaries integrados
- [ ] DevTools habilitadas

### ✅ Step 8: Documentation

- [ ] OpenAPI specs configuradas
- [ ] API documentation endpoint
- [ ] Swagger UI integração

## Documentação dos Resultados

```markdown
# API Architecture Implementation Summary

## ✅ Completed

### HTTP Client Layer

- Custom HTTP client with interceptors
- Automatic retry with exponential backoff
- Request/response validation with Zod
- Comprehensive error handling

### Cache Management

- TanStack Query for state management
- Background updates and stale-while-revalidate
- Intelligent cache invalidation
- Optimistic updates for better UX

### Service Layer

- Base service class for consistency
- Type-safe API contracts
- CRUD operations standardization
- Business logic encapsulation

### Developer Experience

- React Query DevTools integration
- OpenAPI documentation
- Comprehensive TypeScript support
- Error boundaries for resilience

## Impact

### Performance

- Request deduplication
- Background cache updates
- Optimistic UI updates
- Reduced loading states

### Reliability

- Automatic retry mechanisms
- Comprehensive error handling
- Network resilience
- Type safety

### Maintainability

- Consistent patterns
- Centralized configuration
- Comprehensive documentation
- Easy testing

## Next Steps

✅ Phase 03 (API Architecture) completed
→ Ready for Phase 04 (Features Architecture)
```

## Próximos Passos

Após completar a implementação com sucesso:

1. Executar `validation/prompt.md` para validar a API architecture
2. Migrar services existentes para nova arquitetura
3. Proceder para Phase 04 - Features Architecture
